"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], [role='radio'], [role='option'], label, summary, select";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, [contenteditable='true']";

/**
 * A dot that sits on the pointer and a ring that trails it. The ring swells
 * over anything clickable and shrinks on press. Over text fields the custom
 * cursor steps aside for the native I-beam.
 *
 * Mouse and trackpad only: touch has no hover, and on a coarse pointer it
 * would just be a stuck dot. Reduced motion keeps the cursor but drops the
 * trail. Everything runs on refs and rAF, so moving the mouse never renders.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = document.documentElement;
    root.classList.add("custom-cursor");

    const target = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const tick = () => {
      const ease = reduced ? 1 : 0.2;
      trail.x += (target.x - trail.x) * ease;
      trail.y += (target.y - trail.y) * ease;
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      raf = Math.abs(target.x - trail.x) + Math.abs(target.y - trail.y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const setState = (key: string, on: boolean) => {
      dot.current?.toggleAttribute(key, on);
      ring.current?.toggleAttribute(key, on);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        // First move after entering: jump the ring rather than sweep in from a corner.
        trail.x = target.x;
        trail.y = target.y;
        visible = true;
        setState("data-visible", true);
      }
      const el = e.target as Element | null;
      setState("data-text", !!el?.closest(TEXT));
      setState("data-hover", !!el?.closest(INTERACTIVE));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      visible = false;
      setState("data-visible", false);
    };
    const onDown = () => setState("data-down", true);
    const onUp = () => setState("data-down", false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring" />
      <div ref={dot} aria-hidden className="cursor-dot" />
    </>
  );
}
