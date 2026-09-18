"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-control border border-rule bg-background/60 px-3 py-2.5 text-body-sm text-foreground placeholder:text-ink-faint transition-colors focus:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

/**
 * Footer contact form. Posts to /api/contact, which emails the message to
 * Ace and sends the visitor a one-time auto-reply.
 *
 * Two quiet bot checks ride along: a honeypot field people never see, and the
 * time the form was first rendered, so the route can drop instant submissions.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  // Set on mount, not during render — the server render would otherwise stamp
  // the build time, and every submission would look minutes old.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

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
        setError(json.error || "Something went wrong. Please email me directly.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setError("Couldn't reach the server. Please email me directly.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="glass p-group" role="status">
        <div className="flex items-center gap-2.5">
          <Check className="size-4 text-available" aria-hidden />
          <p className="font-medium">Message sent.</p>
        </div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Thanks — a confirmation is on its way to your inbox, and I&rsquo;ll reply within one to two working days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="label mt-group transition-colors hover:text-foreground">
          Send another
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="glass grid gap-snug p-group">
      <div className="grid gap-snug sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Name</span>
          <input name="name" required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="label">Message</span>
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={5}
          placeholder="A role, a project, or just a question."
          className={cn(field, "resize-y")}
        />
      </label>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip;
          hidden from assistive tech and the tab order so people never hit it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

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
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-body-sm font-medium text-background transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {sending ? "Sending" : "Send message"}
        </button>
      </div>
    </form>
  );
}
