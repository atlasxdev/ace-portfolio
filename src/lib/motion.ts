import type { Transition, Variants } from "motion/react";

/**
 * One source of truth for the site's motion.
 *
 * Short and light: opacity plus a small vertical lift, 150–300ms, once, on
 * entering the viewport. Only `transform` and `opacity` are animated, so every
 * frame stays on the compositor. Above-the-fold content doesn't animate at
 * all — see `onLoad` on <Reveal>.
 */

/** Custom eased curve used by the page transition and the reveals. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Content lifting into place. */
export const RISE: Transition = { duration: 0.3, ease: EASE };

/** Supporting details — a plain fade, no movement. */
export const FADE: Transition = { duration: 0.25, ease: EASE };

/** Card groups resizing. */
export const CARD_STATE: Transition = { duration: 0.9, ease: EASE };

export const STAGGER = 0.05;

/** Ceiling on any reveal's delay, so a long list never keeps content waiting. */
export const MAX_DELAY = 0.2;

/* ── Scroll-in reveals ────────────────────────────────────────────────────
   Reusable content — card contents, work-history details, titles, metadata —
   fades in while moving up 12px, once, on entering the viewport. */

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Parent for staggered groups — children inherit the sequence. */
export const stagger = (delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren } },
});

/* ── Page transition ─────────────────────────────────────────────────────
   A downward-to-upward wipe on a custom eased curve, a quarter of a second
   each way.

   Implemented as a fixed overlay rather than by exit-animating the outgoing
   page: App Router unmounts the old tree before AnimatePresence can play it.
   The outgoing page's slight upward drift is handled in CSS instead — see
   `[data-leaving]` in globals.css. */

export const WIPE_MS = 250;

export const wipe: Variants = {
  hidden: { y: "-100%" },
  covering: { y: "0%", transition: { duration: WIPE_MS / 1000, ease: EASE } },
  revealing: {
    y: "100%",
    transition: { duration: WIPE_MS / 1000, ease: EASE },
  },
};

/**
 * Per-kind transitions.
 *
 * NOTE: the variants above deliberately carry no `transition` of their own.
 * A transition declared inside a variant beats the component-level prop, which
 * is where each element's stagger delay lives — leaving it there made every
 * delay a no-op and fired the whole cascade simultaneously.
 *
 * Framer Motion's component-level `transition` prop REPLACES the one declared
 * inside a variant — so passing `transition={{ delay }}` silently threw away
 * the spring and fell back to a default tween. Components merge from here
 * instead: `{ ...TRANSITIONS[kind], delay }`.
 */
export const TRANSITIONS = {
  rise: RISE,
  fade: FADE,
} as const;

/** Shared viewport config so sections trigger at a consistent point. */
export const inViewOnce = {
  once: true,
  // Fixed px, not a percentage. A -12% dead zone is ~98px on a 820px viewport,
  // which is deeper than the footer's 48px bottom padding — so the last row on
  // the page could never enter the trigger area and stayed at opacity 0 for
  // anyone who scrolled to the end. 40px is always shallower than that padding.
  margin: "0px 0px -40px 0px",
} as const;
