"use client";

import { motion, useReducedMotion } from "motion/react";
import { FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { useOpeningReady } from "@/components/motion/opening";
import { APPROACH } from "@/data/approach";
import { EASE, inViewOnce } from "@/lib/motion";

/**
 * How the work actually gets done, as five ordered stages.
 *
 * The brief was a stock "HOW WE WORK?" infographic — numbered steps, an icon in
 * a coloured circle, and a curved path weaving between them, each step sitting
 * alternately above and below that path. The shape is replicated; the skin is
 * not. Red and yellow on white would read as imported, so the colour comes
 * instead from the four hues the ambient field behind the page is already built
 * from, and the path is the site's own hairline rather than a dashed rule.
 *
 * The alternation has a hard requirement: each step must stay short. Steps two
 * slots apart share a band, so a block can only be wider than its own column
 * while it's short enough not to run into that neighbour. The reference gets
 * away with it on eight-word captions — hence one sentence per step here, with
 * the paragraph version in the linked post.
 *
 * Below 1200px it all stacks and the path runs straight down. Five columns need
 * width that simply isn't there on a phone or a tablet.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;

const BADGE = 56;
/** How far the low steps sit below the high ones. Matches `lg:pt-19` below. */
const SWING = 76;
/** Matches `lg:gap-snug` on the grid. */
const GAP = 16;
/**
 * Badge-to-card clearance on desktop (`lg:gap-entry`). It has to be at least
 * SWING - BADGE/2 or the low arc of the curve dips behind the high cards,
 * which shows through the glass as a line crossing the card.
 */
const CLEARANCE = 48;

/** Odd steps ride low, even steps ride high — the reference's rhythm. */
const isLow = (i: number) => i % 2 === 0;

/**
 * The weaving path.
 *
 * Drawn from measured pixels rather than a percentage viewBox: stretching an
 * SVG to fit would distort the stroke, and the whole point of this shape is
 * that it reads as a drawn line. A ResizeObserver keeps it honest on resize.
 *
 * Solid rather than the reference's dashes, for two reasons: a dash pattern and
 * a `pathLength` draw both drive `stroke-dasharray`, so they can't coexist —
 * and every other rule on this page is a solid hairline that draws itself in,
 * which is the language the section should be speaking.
 */
function CurvedPath({ width, ready }: { width: number; ready: boolean }) {
  const reduced = useReducedMotion();
  if (!width) return null;

  const cell = (width - GAP * (APPROACH.length - 1)) / APPROACH.length;
  // Badge centre, not cell centre: the badges are left-aligned with their
  // card's padding edge, so a cell/2 offset here left the curve floating clear
  // of the first and last badge instead of touching them.
  const cx = (i: number) => i * (cell + GAP) + BADGE / 2;
  const cy = (i: number) => (isLow(i) ? SWING : 0) + BADGE / 2;

  const d = APPROACH.slice(0, -1)
    .map((_, i) => {
      const [x1, y1, x2, y2] = [cx(i), cy(i), cx(i + 1), cy(i + 1)];
      // Leave and arrive horizontally, so the curve meets each badge flat
      // rather than pointing at it.
      const bend = (x2 - x1) * 0.45;
      return `M${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      width={width}
      height={SWING + BADGE}
      fill="none"
    >
      <motion.path
        d={d}
        className="stroke-rule"
        strokeWidth={1}
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.4, ease: EASE }}
        {...(reduced || !ready
          ? {}
          : { whileInView: { pathLength: 1 }, viewport: inViewOnce })}
      />
    </svg>
  );
}

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  const openingReady = useOpeningReady();
  const band = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = band.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={band} className="relative">
      {/* Desktop only — below lg the steps stack and the path becomes a
          straight hairline drawn per row instead. */}
      <div className="hidden lg:block">
        <CurvedPath width={width} ready={openingReady} />
      </div>

      <ol className="flex flex-col gap-snug lg:grid lg:grid-cols-5 lg:items-start">
        {APPROACH.map((step, i) => {
          const Icon = ICONS[i];
          const last = i === APPROACH.length - 1;

          return (
            <li
              key={step.title}
              className="relative"
              style={{ "--step": HUES[i % HUES.length] } as React.CSSProperties}
            >
              {/* Stacked only: a straight hairline down to the next badge,
                  across the 16px gap between rows. */}
              {!last && (
                <motion.span
                  aria-hidden
                  className="absolute top-7 -bottom-4 left-6.75 w-px origin-top bg-rule lg:hidden"
                  initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  {...(reduced || !openingReady
                    ? {}
                    : { whileInView: { scaleY: 1 }, viewport: inViewOnce })}
                />
              )}

              {/* The alternation. Low steps drop a full swing; high steps sit
                  flush with the top of the band. */}
              <div className={isLow(i) ? "lg:pt-19" : undefined}>
                <Reveal delay={Math.min(i * 0.06, 0.24)}>
                  {/* Badge beside the card when stacked, above it when the row
                      weaves. No lift on hover — the badge sits on the path, so
                      moving it would pull it off the line. The hue bloom is the
                      hover state instead. */}
                  <div className="group flex items-start gap-snug lg:flex-col lg:gap-entry">
                    <span
                      aria-hidden
                      className="step-badge relative z-10 grid size-14 shrink-0 place-items-center rounded-full"
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>

                    {/* label -> title -> detail, the order used page-wide. The
                        number stays neutral: at 12px these hues miss AA on the
                        light ground, and the badge already carries the colour. */}
                    <div className="glass min-w-0 flex-1 p-group lg:w-full lg:flex-none">
                      <span className="label text-ink-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1.5 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 max-w-[76ch] text-body-sm leading-[1.7] text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ApproachSection;
