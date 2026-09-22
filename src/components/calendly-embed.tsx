"use client";

import { useEffect, useRef, useState } from "react";

import { DATA } from "@/data/resume";

/**
 * Calendly's inline booking widget, as on the /schedule page. The widget
 * script is loaded on mount rather than site-wide, so only visitors who go
 * to book pay for it.
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

export function CalendlyEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    loadCalendly()
      .then((Calendly) => {
        if (cancelled) return;
        // The cookie banner would cover half the calendar.
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

  return <div ref={ref} className="h-[700px] min-w-[320px]" />;
}
