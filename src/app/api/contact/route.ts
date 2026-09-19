import { NextResponse } from "next/server";
import { Resend } from "resend";
import { DATA } from "@/data/resume";

// Node runtime: the rate limiter below keeps state in module scope, which edge
// isolates don't share even as loosely as a warm Node instance does.
export const runtime = "nodejs";

const INBOX = process.env.CONTACT_TO || DATA.contact.email;

/* --- Templates -------------------------------------------------------------
   Both emails are published Resend templates, which own the sender and the
   subject line. The HTML they were built from is kept in emails/. */
const TEMPLATES = {
  notify: "34ba8d5d-e32e-431c-89b9-e6cdf888080c", // "Contact Form" (contact-form)
  reply: "fcd48c38-b56e-4419-b365-8de44d2357f6", // "Contact Response" (contact-response)
};

// Template variables land in HTML, so markup in them is neutralised here.
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// The name also fills the subject line, where an entity would show literally,
// so it's cleaned rather than escaped: no angle brackets, no line breaks.
const cleanName = (s: string) => s.replace(/[<>]/g, "").replace(/[\r\n]+/g, " ");

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

/* --- Turnstile -------------------------------------------------------------
   Cloudflare's CAPTCHA. The widget in the form yields a single-use token;
   Cloudflare confirms it here, server side, before anything is sent. Without
   TURNSTILE_SECRET_KEY (local dev) the check is skipped. */
async function passesTurnstile(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip !== "unknown") form.append("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) console.warn("Contact API: Turnstile rejected", result["error-codes"]);
    return result.success === true;
  } catch (error) {
    console.error("Contact API: Turnstile verification failed", error);
    return false;
  }
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

  // Behind Cloudflare's proxy, x-forwarded-for holds a Cloudflare edge IP
  // shared by many visitors; cf-connecting-ip is the visitor's own.
  const ip =
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (!(await passesTurnstile(body["cf-turnstile-response"], ip))) {
    return NextResponse.json(
      { error: "Couldn't verify you're human. Please try again, or email me directly." },
      { status: 400 }
    );
  }

  if (limited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — try again in a few minutes, or email me directly." },
      { status: 429 }
    );
  }

  // The notification to Ace is the one that matters. If it fails, the visitor
  // is told so, rather than getting an auto-reply for a message nobody saw.
  const notify = await resend.emails.send({
    to: INBOX,
    replyTo: email,
    template: {
      id: TEMPLATES.notify,
      variables: {
        SENDER_NAME: cleanName(name),
        SENDER_EMAIL: escapeHtml(email),
        MESSAGE: escapeHtml(message),
      },
    },
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
    to: email,
    replyTo: INBOX,
    template: { id: TEMPLATES.reply },
  });

  if (reply.error) {
    console.error("Contact API: auto-reply failed", reply.error);
  }

  return NextResponse.json({ ok: true });
}
