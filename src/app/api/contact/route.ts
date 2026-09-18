import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { DATA } from "@/data/resume";

// Node runtime: the rate limiter below keeps state in module scope, which edge
// isolates don't share even as loosely as a warm Node instance does.
export const runtime = "nodejs";

// Must be an address on the domain verified in Resend. Overridable so a
// subdomain (e.g. send.aceguevarra.xyz) can be used without a code change.
const FROM = process.env.CONTACT_FROM || `${DATA.name} <hello@aceguevarra.xyz>`;
const INBOX = process.env.CONTACT_TO || DATA.contact.email;

/* --- Templates -------------------------------------------------------------
   The HTML in emails/ is sent as-is. Not Resend dashboard templates: that
   editor converts pasted HTML into its own blocks and drops the <style> head,
   which takes the fonts and the mobile rules with it. The folder is shipped
   with this route via outputFileTracingIncludes in next.config.mjs. */
let templates: Promise<string[]> | undefined;
const loadTemplates = () =>
  (templates ??= Promise.all(
    ["contact-notification.html", "contact-reply.html"].map((f) =>
      readFile(join(process.cwd(), "emails", f), "utf8")
    )
  ));

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// Fills {{{NAME}}} placeholders, escaping every value — they come from the form.
const fill = (html: string, vars: Record<string, string>) =>
  html.replace(/\{\{\{(\w+)\}\}\}/g, (_, key: string) => escapeHtml(vars[key] ?? ""));

// Header-bound strings must not carry line breaks.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

const REPLY_TEXT = `Thanks for reaching out.

I read every message myself and usually reply within one to two working days.
Something time-sensitive? Email me directly at ${DATA.contact.email}.

While you wait:
- Book a 15-minute call: ${DATA.contact.calendly}
- Read a case study: ${DATA.url}/blog/admissions-portal-rebuild
- Browse the work: ${DATA.url}/#projects

${DATA.name}
${DATA.url}

You're receiving this because you sent a message through aceguevarra.xyz. It's a one-time reply, not a mailing list.
`;

const LIMITS = { name: 100, email: 254, message: 5000 } as const;

// A human needs a few seconds to read the form and type into it. Bots that
// post the instant the page loads fail this before costing an email.
const MIN_FILL_MS = 3000;

/* --- Rate limit ------------------------------------------------------------
   Best-effort, per warm instance: a cold start or a second instance resets
   it. That's acceptable here — it exists to stop one visitor hammering the
   form, and with it the auto-reply to an address they control. Anything
   sturdier needs a shared store (Upstash, Vercel KV). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  // Created per request, not at module scope: the constructor throws without
  // a key, and a module-level throw would take the build down with it.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact API: RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Email is not configured." }, { status: 500 });
  }
  const resend = new Resend(apiKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a field hidden from people. Anything in it is a bot. Answer as
  // if it worked so the bot has nothing to learn from.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — try again in a few minutes, or email me directly." },
      { status: 429 }
    );
  }

  // The notification to Ace is the one that matters. If it fails, the visitor
  // is told so, rather than getting an auto-reply for a message nobody saw.
  const [notifyHtml, replyHtml] = await loadTemplates();

  const notify = await resend.emails.send({
    from: FROM,
    to: INBOX,
    replyTo: email,
    subject: oneLine(`New message from ${name}`).slice(0, 150),
    html: fill(notifyHtml, { SENDER_NAME: name, SENDER_EMAIL: email, MESSAGE: message }),
    text: `${name} <${email}>\nvia the contact form on aceguevarra.xyz\n\n${message}\n`,
  });

  if (notify.error) {
    console.error("Contact API: notification failed", notify.error);
    return NextResponse.json(
      { error: "Couldn't send your message. Please email me directly instead." },
      { status: 502 }
    );
  }

  // The auto-reply is a courtesy. The message already reached the inbox, so a
  // failure here is logged, not surfaced. No variables, deliberately: nothing
  // the visitor typed is echoed back, so the form can't be used to mail
  // arbitrary text to arbitrary inboxes from this domain.
  const reply = await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: INBOX,
    subject: `Thanks for reaching out — ${DATA.name}`,
    html: replyHtml,
    text: REPLY_TEXT,
  });

  if (reply.error) {
    console.error("Contact API: auto-reply failed", reply.error);
  }

  return NextResponse.json({ ok: true });
}
