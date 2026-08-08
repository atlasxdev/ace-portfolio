"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import type { SECTIONS } from "@/data/sections";
import { EASE } from "@/lib/motion";
import { useSectionSpy } from "@/lib/use-section-spy";
import { cn } from "@/lib/utils";

/**
 * Floating dock — the desktop navigation for the homepage's nine sections.
 *
 * A slim glass capsule pinned to the left edge: one dot per section, the
 * current one drawn as a dash. Hovering or tabbing into it expands the dots
 * into labels.
 *
 * It floats above the page rather than living in it, which is the whole reason
 * it works. A labelled rail needs 145px of clear space; measured against this
 * layout, that only exists past 1728px because the Approach band runs to
 * 1400px. At rest this is ~40px and overlaps nothing, so the width problem
 * never arises.
 *
 * NOTE the radius: `rounded-[26px]`, never `rounded-full`. On an element this
 * tall a full radius becomes an ellipse and clips the first and last items —
 * "About" and "Certifications" lost their ends to it in the mockup.
 *
 * Below `xl` (1320px) there isn't room beside the content — measured, the dock
 * overlapped the section labels by 24px at 1200 — so `SectionNav` takes over as
 * a bar under the header. The two are never visible together.
 */
export function SectionDock({
  sections,
}: {
  sections: typeof SECTIONS | { id: string; label: string }[];
}) {
  const reduced = useReducedMotion();
  const { active, past } = useSectionSpy(sections);
  const [open, setOpen] = useState(false);

  // Nine unlabelled dots don't announce themselves as navigation. So the dock
  // introduces itself once — expands as it arrives, holds a beat, collapses —
  // and is quiet from then on. Skipped entirely under reduced motion, where
  // unrequested movement is the thing to avoid.
  const [peeking, setPeeking] = useState(false);
  const introduced = useRef(false);

  useEffect(() => {
    if (!past || introduced.current || reduced) return;
    introduced.current = true;
    const show = window.setTimeout(() => setPeeking(true), 260);
    const hide = window.setTimeout(() => setPeeking(false), 2100);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [past, reduced]);

  const expanded = open || peeking;

  return (
    <AnimatePresence>
      {past && (
        <motion.nav
          aria-label="Page sections"
          className="glass fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-[26px] py-3 xl:flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          // Tabbing in has to expand it too, or the labels are keyboard-only
          // invisible and the dots are unlabelled targets.
          onFocusCapture={() => setOpen(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setOpen(false);
            }
          }}
          style={{ paddingInline: expanded ? 12 : 10 }}
        >
          {sections.map((s) => {
            const current = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "group/item flex items-center gap-3 rounded-full py-1.5 transition-colors",
                  expanded ? "px-3" : "px-1.5",
                  current && expanded && "bg-foreground/8"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "block shrink-0 rounded-full transition-all duration-300",
                    current
                      ? "h-1.5 w-4 bg-foreground"
                      : "size-1.5 bg-foreground/35 group-hover/item:bg-foreground/70"
                  )}
                />

                {/* Always in the DOM so the link has an accessible name; the
                    width is what animates, not the presence. */}
                <span
                  className={cn(
                    "label overflow-hidden whitespace-nowrap transition-all duration-300",
                    expanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
                    current ? "text-foreground" : "text-ink-faint"
                  )}
                >
                  {s.label}
                </span>
              </a>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default SectionDock;
