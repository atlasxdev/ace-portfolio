"use client";

import { motion, useReducedMotion } from "motion/react";
import { FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { useOpeningReady } from "@/components/motion/opening";
import { APPROACH } from "@/data/approach";
import { EASE, inViewOnce } from "@/lib/motion";

/**
 * How the work actually gets done, as five ordered stages.
 *
 * The brief was a stock "HOW WE WORK?" infographic — numbered steps, an icon in
 * a coloured circle, a path joining them. The structure is kept and the skin is
 * not: its red/yellow serpentine on white would read as imported here. The
 * colour instead comes from the four hues the ambient field behind the page is
 * already built from, so it belongs to the site rather than to the reference.
 *
 * The serpentine doesn't survive the translation either. The content module is
 * 720px at most and five steps across it would be unreadable, so the path runs
 * vertically and the page's own scroll carries the sequence.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;

/**
 * The path, drawn one segment at a time.
 *
 * Segments rather than a single line down the section: the tiles have different
 * heights, so nothing but a per-row segment can reliably start at one badge and
 * stop at the next. `top-7` is half of the size-14 badge — its centre — and
 * `-bottom-4` reaches across the `gap-snug` between rows to meet the next
 * badge's top edge. It also means the path draws progressively as you scroll,
 * which is the better read anyway.
 */
function Connector({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="absolute top-7 -bottom-4 left-6.75 w-px origin-top bg-rule"
      initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      // Reduced motion keeps the full-height path. Leaving it at scaleY 0 would
      // delete the sequence for anyone who can't see it draw.
      {...(reduced || !ready
        ? {}
        : { whileInView: { scaleY: 1 }, viewport: inViewOnce })}
    />
  );
}

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  const openingReady = useOpeningReady();

  return (
    <ol className="flex flex-col gap-snug">
      {APPROACH.map((step, i) => {
        const Icon = ICONS[i];
        const hue = HUES[i % HUES.length];
        const last = i === APPROACH.length - 1;

        return (
          <li
            key={step.title}
            className="relative"
            style={{ "--step": hue } as React.CSSProperties}
          >
            {!last && <Connector ready={openingReady} reduced={reduced} />}

            <Reveal delay={Math.min(i * 0.05, 0.2)}>
              {/* No lift on hover: the badge sits on the path, so moving the
                  row would pull it off the line. The hue bloom on the badge is
                  the hover state instead — structure stays put. */}
              <div className="group flex items-start gap-snug">
                <span
                  aria-hidden
                  className="step-badge relative z-10 grid size-14 shrink-0 place-items-center rounded-full"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>

                {/* label -> title -> detail, the order used page-wide. The
                    number stays neutral: at 12px these hues miss AA on the
                    light ground, and the badge already carries the colour. */}
                <div className="glass min-w-0 flex-1 p-group">
                  <span className="label text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[68ch] text-body-sm leading-[1.7] text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

export default ApproachSection;
