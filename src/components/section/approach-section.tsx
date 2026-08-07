"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { useOpeningReady } from "@/components/motion/opening";
import { APPROACH } from "@/data/approach";
import { EASE, inViewOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
 * Dashed like the reference. That rules out Framer's `pathLength` draw, which
 * animates the same `stroke-dasharray` the pattern needs, so the line is wiped
 * in behind a clip rect instead — every segment runs left to right, so a
 * left-to-right wipe reads as drawing regardless. Arrowheads stay solid.
 */
function CurvedPath({ width, play }: { width: number; play: boolean }) {
  const reduced = useReducedMotion();
  const uid = useId();
  if (!width) return null;

  const cell = (width - GAP * (APPROACH.length - 1)) / APPROACH.length;
  // Cell centre: each badge is centred over its own card, so which step a badge
  // belongs to is unambiguous. Left-aligning them put every badge nearer the
  // gap between two cards than to either one.
  const cx = (i: number) => i * (cell + GAP) + cell / 2;
  const cy = (i: number) => (isLow(i) ? SWING : 0) + BADGE / 2;

  /** Clear of the badge rim at both ends, with room for the arrowhead. */
  const OUT = BADGE / 2 + 7;
  const IN = BADGE / 2 + 10;

  const segments = APPROACH.slice(0, -1).map((_, i) => {
    const [x1, y1] = [cx(i) + OUT, cy(i)];
    const [x2, y2] = [cx(i + 1) - IN, cy(i + 1)];
    // Leave and arrive horizontally. That's partly how the curve should read,
    // and partly what makes the arrowhead free: the tangent at the end is
    // always +x, so the chevron never needs rotating.
    const bend = (x2 - x1) * 0.5;
    return {
      d: `M${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
      head: `M${x2 - 6} ${y2 - 4.5} L${x2} ${y2} L${x2 - 6} ${y2 + 4.5}`,
      x1,
      w: x2 - x1,
      at: i * 0.22,
    };
  });

  const on = play || reduced;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      width={width}
      height={SWING + BADGE}
      fill="none"
    >
      {segments.map((seg, i) => {
        const clip = `${uid}-${i}`;
        return (
          <g key={i} className="stroke-ink-faint/85 dark:stroke-ink-faint/70" strokeWidth={1}>
            {/* Wiped in behind a clip rect rather than drawn with `pathLength`.
                pathLength animates via stroke-dasharray, which is the same
                property the dash pattern needs — the two cannot coexist, and
                the dashes are the point. A left-to-right wipe reads as drawing
                anyway, because every segment runs left to right.

                The rect drives `animate` off a measured in-view flag instead of
                `whileInView`: it lives inside <clipPath> and is never painted,
                so an IntersectionObserver on it would have nothing to observe. */}
            <clipPath id={clip}>
              <motion.rect
                x={seg.x1 - 6}
                y={0}
                height={SWING + BADGE}
                initial={{ width: reduced ? seg.w + 14 : 0 }}
                animate={{ width: on ? seg.w + 14 : 0 }}
                transition={{ duration: 0.75, ease: EASE, delay: seg.at }}
              />
            </clipPath>

            {/* One path per segment rather than one path of many subpaths: a
                marker-end only lands on the last vertex of a whole path, so
                subpaths would have given four lines and a single arrowhead. */}
            <path
              d={seg.d}
              clipPath={`url(#${clip})`}
              strokeDasharray="4 5"
              strokeLinecap="round"
            />

            {/* Solid, and it arrives once its line has, so the sequence reads
                1 to 5 rather than five arrows appearing at once. */}
            <motion.path
              d={seg.head}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: on ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: seg.at + 0.6 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * The stacked equivalent of one curve segment.
 *
 * The dash is a repeating gradient rather than an SVG stroke because the row
 * height varies with the card, and a stretched SVG would stretch its dashes
 * with it. A gradient tiles at whatever height it's given. The reveal is a clip
 * inset rather than scaleY for the same reason — scaling would smear the
 * pattern instead of uncovering it.
 *
 * Line and head are siblings, not nested. The head sat inside the line at
 * first, where the clip that reveals the line also clipped the head away to
 * nothing: a clip-path applies to the whole subtree, and the head deliberately
 * overhangs the line's box.
 *
 * The run starts at the badge's bottom edge, not its centre. Starting at the
 * centre drew the first 28px of dashes straight through the icon.
 */
function StackedConnector({
  play,
  reduced,
  delay,
}: {
  play: boolean;
  reduced: boolean;
  delay: number;
}) {
  const hidden = { clipPath: "inset(0 0 100% 0)" };
  const shown = { clipPath: "inset(0 0 0% 0)" };
  const ink = "text-ink-faint/85 dark:text-ink-faint/70";

  return (
    <>
      {/* badge bottom (56px) down to just short of the next badge */}
      <motion.span
        aria-hidden
        className={cn(
          "absolute top-14 -bottom-1 left-7 w-px -translate-x-1/2 lg:hidden",
          ink
        )}
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 9px)",
        }}
        initial={reduced ? shown : hidden}
        transition={{ duration: 0.7, ease: EASE, delay }}
        {...(reduced || !play
          ? {}
          : { whileInView: shown, viewport: inViewOnce })}
      />

      {/* seated in the 16px gap between rows, clear of both badges */}
      <motion.svg
        aria-hidden
        className={cn(
          "absolute -bottom-2.5 left-7 -translate-x-1/2 lg:hidden",
          ink
        )}
        width="11"
        height="6"
        fill="none"
        initial={{ opacity: reduced ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE, delay: delay + 0.55 }}
        {...(reduced || !play
          ? {}
          : { whileInView: { opacity: 1 }, viewport: inViewOnce })}
      >
        <path
          d="M0.5 0.5 L5.5 5.5 L10.5 0.5"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </>
  );
}

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  const openingReady = useOpeningReady();
  const band = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Measured here and handed down, because the clip rect that drives the wipe
  // is never painted and so can't observe its own intersection.
  const inView = useInView(band, inViewOnce);

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
        <CurvedPath width={width} play={openingReady && inView} />
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
              {/* Stacked only: the same dashed run and arrowhead as the
                  desktop curve, turned through 90 degrees. Runs from the badge
                  centre down across the 16px gap to the next badge's edge. */}
              {!last && (
                <StackedConnector
                  play={openingReady}
                  reduced={reduced}
                  delay={Math.min(i * 0.06, 0.24)}
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
                  <div className="group flex items-start gap-snug lg:flex-col lg:items-center lg:gap-entry">
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
