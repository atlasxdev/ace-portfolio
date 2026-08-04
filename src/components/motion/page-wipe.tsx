"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { WIPE_MS, wipe } from "@/lib/motion";

type Phase = "hidden" | "covering" | "revealing";

/**
 * Page transition: a downward-to-upward wipe on a custom eased curve, about
 * half a second, with a matching entrance delay on the incoming page.
 *
 * Two halves:
 *
 *   - This overlay does the wipe. It has to be an overlay because App Router
 *     unmounts the outgoing tree before AnimatePresence could play an exit on
 *     it, so animating the page itself out is unreliable.
 *   - The outgoing page's slight upward drift is CSS: a `data-leaving`
 *     attribute goes on <html> during the cover, and globals.css transitions
 *     the main element up while fading it.
 *
 * Internal link clicks are intercepted so the cover finishes before the route
 * changes. Modified clicks, new tabs, downloads, hashes and other origins are
 * left alone.
 */
export function PageWipe() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const navigating = useRef(false);

  // Once the new route has mounted, wipe away to reveal it. Deferred a frame
  // so the incoming page paints underneath first — and so this isn't a
  // synchronous setState inside an effect.
  useEffect(() => {
    if (!navigating.current) return;
    navigating.current = false;
    document.documentElement.removeAttribute("data-leaving");
    const frame = requestAnimationFrame(() => setPhase("revealing"));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (reduced) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      navigating.current = true;
      document.documentElement.setAttribute("data-leaving", "");
      setPhase("covering");

      window.setTimeout(
        () => router.push(url.pathname + url.search),
        WIPE_MS + 60
      );
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.documentElement.removeAttribute("data-leaving");
    };
  }, [reduced, router]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-90 bg-background"
      initial="hidden"
      animate={phase}
      variants={wipe}
      onAnimationComplete={(definition) => {
        if (definition === "revealing") setPhase("hidden");
      }}
    />
  );
}
