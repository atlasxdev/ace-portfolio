"use client";

import { useEffect, useState } from "react";

/**
 * Which section owns the viewport, and whether we've left the hero yet.
 *
 * Shared by both navigations — the dock on desktop and the bar below it. They
 * are never on screen together, but they have to agree about where you are, and
 * two copies of this logic would eventually drift.
 *
 * The list is passed in rather than scraped from the DOM: reading the page
 * inside an effect to set state is the cascading-render pattern, and tying
 * labels to heading text meant a rename silently desynced the nav.
 */
export function useSectionSpy(sections: readonly { id: string }[]) {
  const [active, setActive] = useState("");
  const [past, setPast] = useState(false);

  useEffect(() => {
    // The top and bottom bands are discounted so a section counts as current
    // once it's genuinely in view, not the instant its first pixel appears.
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

    // Separate observer, one job: has the hero gone? Neither navigation should
    // cover the opening screen.
    const hero = document.querySelector("main section:first-of-type");
    const gate = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    if (hero) gate.observe(hero);

    return () => {
      spy.disconnect();
      gate.disconnect();
    };
  }, [sections]);

  return { active, past };
}
