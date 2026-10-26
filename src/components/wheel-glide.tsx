"use client";

import { useEffect } from "react";

/**
 * Mouse-wheel scrolling that glides to a stop the way iOS momentum does,
 * instead of jumping a notch at a time.
 *
 * Only a mouse wheel is taken over. Trackpads and touch already get the
 * platform's own momentum, and replacing that always feels worse, so their
 * events pass straight through. So does anything inside a scrollable panel,
 * zooming (ctrl + wheel), sideways scrolling, a scroll-locked page (an open
 * dialog) and reduced motion.
 *
 * The model is UIScrollView's: velocity decays exponentially, v·Rᵗ per
 * millisecond. Each notch adds velocity worth exactly its own distance
 * (Δ·(1-R)), so a notch still travels as far as it natively would; it just
 * arrives smoothly. R is between UIKit's .normal (0.998, a flick) and .fast
 * (0.99), as a notch is a short, deliberate move rather than a throw.
 */
const R = 0.996;
/** A trackpad gesture is assumed to continue this long after its last event. */
const GESTURE_MS = 400;

export function WheelGlide() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let v = 0; // px per ms, + is down
    let pos = 0; // unrounded scroll position, so slow tails don't stall on rounding
    let raf = 0;
    let last = 0;
    let trackpadUntil = 0;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      v = 0;
    };

    const isMouseWheel = (e: WheelEvent) => {
      if (e.deltaMode !== 0) return true; // lines or pages: only wheels report these
      // Chromium and Safari: a wheel notch is a multiple of 120 legacy units;
      // trackpads report arbitrary amounts and usually some sideways drift.
      const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
      return !!legacy && legacy % 120 === 0 && e.deltaX === 0;
    };

    /** Whether something under the pointer scrolls this way on its own. */
    const nestedScroller = (target: EventTarget | null, dy: number) => {
      for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1) continue;
        const { overflowY } = getComputedStyle(el);
        if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") continue;
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    };

    const locked = () =>
      getComputedStyle(document.body).overflowY === "hidden" ||
      getComputedStyle(document.documentElement).overflowY === "hidden";

    const frame = (now: number) => {
      // rAF stamps the frame start, which can be before the wheel event that
      // started it: never a negative step.
      const dt = Math.min(Math.max(now - last, 0), 32);
      last = now;
      // Someone else moved the page (scrollbar drag, keys, an anchor): yield.
      if (Math.abs(window.scrollY - pos) > 3) return stop();

      const decay = R ** dt;
      pos += (v * R * (1 - decay)) / (1 - R);
      v *= decay;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Only an edge the page is moving into stops it: sitting at the top must
      // still let a scroll down start.
      if ((pos <= 0 && v < 0) || (pos >= max && v > 0)) v = 0;
      pos = Math.min(Math.max(pos, 0), max);
      window.scrollTo({ top: pos, behavior: "instant" });

      // Stop once less than half a pixel of travel is left.
      if (Math.abs(v) / (1 - R) < 0.5) return stop();
      raf = requestAnimationFrame(frame);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.shiftKey || reduced.matches) return;
      if (!isMouseWheel(e)) {
        trackpadUntil = e.timeStamp + GESTURE_MS;
        return;
      }
      if (e.timeStamp < trackpadUntil || e.deltaY === 0) return;
      if (nestedScroller(e.target, e.deltaY) || locked()) return;

      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!raf) {
        pos = window.scrollY;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      // Turning the wheel the other way catches the page, as a finger does on iOS.
      if (Math.sign(dy) !== Math.sign(v)) v = 0;
      v += dy * (1 - R);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
