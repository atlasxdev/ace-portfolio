import type { Transition } from "motion/react";

/**
 * One source of truth for the site's motion: the chat panel and the
 * approach diagram. Content no longer animates in on scroll (see
 * <Reveal>); only `transform` and `opacity` are animated, so every frame stays
 * on the compositor.
 *
 * Interface motion uses Apple's spring model (WWDC23 "Animate with Springs"):
 * a perceived duration plus a bounce, rather than a timed curve. Springs carry
 * the pointer's momentum when they're interrupted midway, which is what makes
 * them feel physical. Motion maps `visualDuration` + `bounce` to stiffness
 * (2π/d)² and damping 4π(1-bounce)/d, the same as SwiftUI.
 */

/** SwiftUI `.smooth`: no overshoot. Panels, fades, anything that opens or closes. */
export const SPRING: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/** SwiftUI `.snappy`: a hint of overshoot. Selection pills, cards that move under the pointer. */
export const SNAPPY: Transition = { type: "spring", visualDuration: 0.3, bounce: 0.15 };

/** SwiftUI `.bouncy`: for a press that should spring back. Use sparingly. */
export const BOUNCY: Transition = { type: "spring", visualDuration: 0.35, bounce: 0.3 };

/** Custom eased curve, kept for drawn paths where a spring has nothing to carry. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** The chat panel opening and closing. */
export const CARD_STATE: Transition = SPRING;

/** Shared viewport config so sections trigger at a consistent point. */
export const inViewOnce = {
  once: true,
  // Fixed px, not a percentage. A -12% dead zone is ~98px on a 820px viewport,
  // which is deeper than the footer's 48px bottom padding — so the last row on
  // the page could never enter the trigger area and stayed at opacity 0 for
  // anyone who scrolled to the end. 40px is always shallower than that padding.
  margin: "0px 0px -40px 0px",
} as const;
