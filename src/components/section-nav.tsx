"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import type { SECTIONS } from "@/data/sections";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Jump-to nav for the homepage.
 *
 * The page is a long scroll and every section sits below the fold, so anyone
 * who came to see one thing — the timeline, the work — had to scroll past
 * everything else to reach it. This is a slim bar that appears under the header
 * once you've left the hero, marks where you are, and takes you anywhere in one
 * click.
 *
 * The list arrives as a prop from `src/data/sections.ts` rather than being
 * scraped out of the DOM. Scraping meant reading the page inside an effect to
 * set state — the cascading-render pattern — and tied the labels to heading
 * text, so renaming a heading quietly desynced the nav.
 */
export function SectionNav({
  sections,
}: {
  sections: typeof SECTIONS | { id: string; label: string }[];
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState("");
  const [past, setPast] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Which section owns the viewport. The top and bottom bands are discounted
    // so a section counts as current once it's genuinely in view, not the
    // instant its first pixel appears.
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    }

    // And this one only asks "are we past the hero yet", so the bar never
    // covers the opening screen.
    const hero = document.querySelector("main section:first-of-type");
    const gate = new IntersectionObserver(
      ([e]) => setPast(!e.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    if (hero) gate.observe(hero);

    return () => {
      spy.disconnect();
      gate.disconnect();
    };
  }, [sections]);

  // Keep the current chip in view on phones, where the bar scrolls sideways.
  useEffect(() => {
    if (!active || !bar.current) return;
    bar.current
      .querySelector<HTMLElement>(`[data-id="${active}"]`)
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: reduced ? "auto" : "smooth",
      });
  }, [active, reduced]);

  return (
    <AnimatePresence>
      {past && (
        <motion.nav
          aria-label="Page sections"
          className="sticky top-14 z-40 border-b border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* Scrolls sideways on phones so no chip is unreachable, but the
              first still lines up with the page gutter. */}
          <div
            ref={bar}
            className="shell flex gap-group overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-id={s.id}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "label relative shrink-0 py-1 transition-colors hover:text-foreground",
                  active === s.id ? "text-foreground" : "text-ink-faint"
                )}
              >
                {s.label}
                {active === s.id && (
                  <motion.span
                    layoutId="section-nav-marker"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-foreground"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", duration: 0.5, bounce: 0 }
                    }
                  />
                )}
              </a>
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default SectionNav;
