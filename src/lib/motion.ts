import type { Transition } from "motion/react";

/**
 * One source of truth for the site's motion: the chat panel and the
 * approach diagram. Content no longer animates in on scroll (see
 * <Reveal>); only `transform` and `opacity` are animated, so every frame stays
 * on the compositor.
 */

/** Custom eased curve used by the panels. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** The chat panel opening and closing. */
export const CARD_STATE: Transition = { duration: 0.25, ease: EASE };

/** Shared viewport config so sections trigger at a consistent point. */
export const inViewOnce = {
  once: true,
  // Fixed px, not a percentage. A -12% dead zone is ~98px on a 820px viewport,
  // which is deeper than the footer's 48px bottom padding — so the last row on
  // the page could never enter the trigger area and stayed at opacity 0 for
  // anyone who scrolled to the end. 40px is always shallower than that padding.
  margin: "0px 0px -40px 0px",
} as const;
