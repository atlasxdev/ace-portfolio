"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DATA } from "@/data/resume";

type Status = "idle" | "sending" | "sent" | "error";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

// One script tag for the page, however many times the dialog opens.
let turnstileLoad: Promise<Turnstile> | null = null;
function loadTurnstile() {
  turnstileLoad ??= new Promise<Turnstile>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject());
    script.onerror = () => {
      turnstileLoad = null;
      reject();
    };
    document.head.appendChild(script);
  });
  return turnstileLoad;
}

/**
 * Contact form, shown in the site-wide contact dialog. Posts to /api/contact, which emails the message to
 * Ace and sends the visitor a one-time auto-reply.
 *
 * Bot checks: a honeypot field people never see, the time the form was first
 * rendered (so the route can drop instant submissions), and a Cloudflare
 * Turnstile widget whose token the route verifies with Cloudflare.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(0);
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Without a site key there's no widget to wait for.
  const [verified, setVerified] = useState(!TURNSTILE_SITE_KEY);

  // Set on mount, not during render — the server render would otherwise stamp
  // the build time, and every submission would look minutes old.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Rendered explicitly: the form mounts inside a dialog, after Turnstile's
  // implicit scan of the page has already run. It adds a hidden
  // `cf-turnstile-response` input to the form, which FormData picks up.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || status === "sent") return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !widgetEl.current) return;
        widgetId.current = turnstile.render(widgetEl.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          size: "flexible",
          callback: () => setVerified(true),
          "expired-callback": () => setVerified(false),
          "error-callback": () => setVerified(false),
        });
      })
      .catch(() => console.error("Contact form: Turnstile failed to load"));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [status === "sent"]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // A token is single-use, so a failed attempt needs a fresh one.
        if (widgetId.current) {
          window.turnstile?.reset(widgetId.current);
          setVerified(false);
        }
        setError(json.error || "Something went wrong. Please email me directly.");
        setStatus("error");
        return;
      }

      form.reset();
      setVerified(!TURNSTILE_SITE_KEY);
      setStatus("sent");
    } catch {
      setError("Couldn't reach the server. Please email me directly.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status">
        <div className="flex items-center gap-2.5">
          <Check className="size-4 text-available" aria-hidden />
          <p className="font-medium">Message sent.</p>
        </div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Thanks — a confirmation is on its way to your inbox, and I&rsquo;ll reply within one to two working days.
        </p>
        <Button
          type="button"
          variant="control"
          size="pill-sm"
          onClick={() => setStatus("idle")}
          className="label mt-group">
          Send another
        </Button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="relative grid gap-snug">
      <div className="grid gap-snug sm:grid-cols-2">
        <Label>
          <span className="label">Name</span>
          <Input name="name" required maxLength={100} autoComplete="name" />
        </Label>
        <Label>
          <span className="label">Email</span>
          <Input name="email" type="email" required maxLength={254} autoComplete="email" />
        </Label>
      </div>

      <Label>
        <span className="label">Message</span>
        <Textarea
          name="message"
          required
          maxLength={5000}
          rows={5}
          placeholder="A role, a project, or just a question."
        />
      </Label>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip;
          hidden from assistive tech and the tab order so people never hit it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <div ref={widgetEl} className="min-h-[65px]" />}

      <div className="flex flex-wrap items-center justify-between gap-snug">
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          {status === "error" ? (
            <span className="text-destructive">
              {error}{" "}
              <a href={`mailto:${DATA.contact.email}`} className="underline underline-offset-4">
                {DATA.contact.email}
              </a>
            </span>
          ) : (
            "You'll get a confirmation by email."
          )}
        </p>
        <Button
          type="submit"
          variant="pill"
          size="pill"
          disabled={sending || !verified}
          title={verified ? undefined : "Waiting for the verification check"}>
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {sending ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
