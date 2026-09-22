"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DATA } from "@/data/resume";

/**
 * Calendly booking in a site-wide dialog, opened from the sidebar and the
 * footer. Like the contact dialog, the open state sits in context at the
 * layout: the phone sheet closes when its row is tapped, and a dialog living
 * inside it would unmount with it.
 */

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyGlobal = { initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void };

/** Loads Calendly's widget script once and resolves with its global. */
let widgetScript: Promise<CalendlyGlobal> | null = null;
function loadCalendly() {
  widgetScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve((window as unknown as { Calendly: CalendlyGlobal }).Calendly);
    script.onerror = () => {
      widgetScript = null;
      reject(new Error("Calendly widget failed to load"));
    };
    document.body.appendChild(script);
  });
  return widgetScript;
}

function CalendlyEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    loadCalendly()
      .then((Calendly) => {
        if (cancelled) return;
        // The cookie banner would cover half the calendar inside the dialog.
        Calendly.initInlineWidget({ url: `${DATA.contact.calendly}?hide_gdpr_banner=1`, parentElement: el });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, []);

  if (failed) {
    return (
      <p className="p-group text-body-sm text-muted-foreground">
        The booking calendar didn&rsquo;t load.{" "}
        <a href={DATA.contact.calendly} target="_blank" rel="noopener noreferrer" className="text-foreground underline">
          Open it on Calendly
        </a>
        .
      </p>
    );
  }

  return <div ref={ref} className="h-[min(700px,calc(100dvh-6rem))] min-w-[320px]" />;
}

const ScheduleDialogContext = createContext<(() => void) | null>(null);

export function useScheduleDialog() {
  const open = useContext(ScheduleDialogContext);
  if (!open) throw new Error("useScheduleDialog must be used inside <ScheduleDialogProvider>");
  return open;
}

export function ScheduleDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);

  return (
    <ScheduleDialogContext.Provider value={show}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">Schedule a call</DialogTitle>
          <DialogDescription className="sr-only">Pick a time for a 15-minute call with {DATA.name}.</DialogDescription>
          {/* Mounted only while open, so the widget script loads on first use. */}
          {open && <CalendlyEmbed />}
        </DialogContent>
      </Dialog>
    </ScheduleDialogContext.Provider>
  );
}

/** A button that opens the booking dialog. Styling is the caller's. */
export function ScheduleTrigger(props: Omit<React.ComponentProps<"button">, "onClick" | "type">) {
  const open = useScheduleDialog();
  return <button type="button" onClick={open} {...props} />;
}
