"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Compass,
  Footprints,
  GraduationCap,
  Layers,
  LayoutGrid,
  PenLine,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { SECTIONS } from "@/data/sections";
import { EASE } from "@/lib/motion";
import { useSectionSpy } from "@/lib/use-section-spy";
import { cn } from "@/lib/utils";

/**
 * Floating dock — the desktop navigation for the homepage's ten sections.
 *
 * A vertical glass capsule pinned to the left edge: one chip per section, the
 * column swelling around whichever is under the cursor, and the label sliding
 * out to the right of the hovered chip.
 *
 * WHY CHIPS, NOT LABELS. This rail used to expand its dots into a labelled
 * list, which is what forced it to be desktop-only: a labelled rail needs 145px
 * of clear gutter, and measured against this layout that only exists past
 * 1728px, because the Approach band runs to 1400px. Chips hold the rail at
 * ~51px at rest and ~72px at full swell, so it never reaches the content, and
 * the label comes back as a tooltip rather than by widening the capsule.
 *
 * Ten chips stack to ~480px, so the constraint here is viewport HEIGHT rather
 * than width — see the sizing note in globals.css before raising --dock-rest.
 *
 * Left edge rather than the bottom: a bottom bar has the whole viewport width
 * to work with but has to share it — the chatbot sits bottom-right at z-50 —
 * and a horizontal row of ten chips reads as a toolbar for the page rather than
 * a map of it. The rail also keeps the reading column's vertical rhythm, which
 * is the page's organising idea.
 *
 * The magnification is CSS (`.dock-item` in globals.css) rather than a motion
 * value driven by pointer position. Sibling selectors already know which chip
 * is hovered, so the JS alternative would mean measuring ten bounding boxes per
 * frame to recompute what `:has()` resolves for free — and those boxes move as
 * their own neighbours resize, so they cannot be cached either.
 *
 * Below `xl` (1320px) `SectionNav` takes over as a bar under the header; the
 * two are never on screen together and share their scroll-spy so they cannot
 * disagree about where you are. That breakpoint is now conservative rather than
 * forced — it was set for the labelled rail's 145px, and chips need a quarter
 * of that — but the bar is the better shape on a narrow screen regardless.
 */

/**
 * Which mark stands for which section.
 *
 * Kept here rather than in `data/sections.ts` — the same split `org-logo.tsx`
 * uses: the data says which sections exist, this says how one is drawn.
 * Components in the data file would also pull `lucide-react` into everything
 * importing `SECTIONS`, `SectionNav` included, which renders no icons at all.
 */
const MARKS: Record<string, LucideIcon> = {
  about: UserRound,
  experience: Briefcase,
  education: GraduationCap,
  capabilities: Layers,
  approach: Compass,
  projects: LayoutGrid,
  writing: PenLine,
  journey: Footprints,
  recognition: Award,
  certifications: BadgeCheck,
};

export function SectionDock({
  sections,
}: {
  sections: typeof SECTIONS | { id: string; label: string }[];
}) {
  const reduced = useReducedMotion();
  const { active, past } = useSectionSpy(sections);

  return (
    <AnimatePresence>
      {past && (
        <motion.nav
          aria-label="Page sections"
          // `items-start` is what makes it a dock: chips grow rightward off a
          // fixed left edge rather than about their own centres, so the rail's
          // outer edge stays put while the row under the cursor reaches out.
          // The gutter between chips is each item's block padding, not a flex
          // gap — the padding holds while the item grows, so chips never
          // collide at peak.
          // NOTE the radius: never `rounded-full`. On an element this tall a
          // full radius resolves to an ellipse and clips the first and last
          // chips — the failure the labelled version of this rail hit.
          className="dock glass fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 flex-col items-start rounded-3xl px-2 py-2 xl:flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {sections.map((s) => {
            const current = active === s.id;
            const Mark = MARKS[s.id] ?? UserRound;

            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className="dock-item group/item relative flex items-center"
              >
                {/* Tailwind v4 sets `-translate-y-1/2` through the standalone
                    `translate` property, so it composes with the `transform`
                    the .dock-tip slide uses rather than clobbering it. */}
                <span
                  aria-hidden
                  className="dock-tip glass label absolute top-1/2 left-full ml-1 -translate-y-1/2 rounded-full px-2.5 py-1 whitespace-nowrap text-foreground"
                >
                  {s.label}
                </span>

                {/* The current section is carried by inverting the chip rather
                    than by a dot beneath it. Once a neighbour is magnified the
                    eye reads size first, and the active chip is frequently not
                    the largest one — so the signal has to be tonal, not
                    positional. `foreground`/`background` are the site's own
                    pair, so this lands dark-on-light in the light theme and
                    light-on-dark in the dark one without a second rule. */}
                <span
                  aria-hidden
                  className={cn(
                    "dock-chip flex items-center justify-center border transition-colors duration-300",
                    current
                      ? "border-transparent bg-foreground text-background"
                      : "border-rule bg-foreground/6 text-muted-foreground group-hover/item:bg-foreground/12 group-hover/item:text-foreground"
                  )}
                >
                  <Mark className="dock-mark" strokeWidth={1.75} />
                </span>

                {/* Real text, not an aria-label: the tooltip is decorative and
                    hidden, so this is the link's only accessible name. */}
                <span className="sr-only">{s.label}</span>
              </a>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default SectionDock;
