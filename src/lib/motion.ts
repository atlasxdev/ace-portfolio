import type { Transition, Variants } from "motion/react";

/**
 * One source of truth for the site's motion.
 *
 * The language is editorial and calm: opacity plus vertical movement, slow
 * spring entrances, delayed sequencing, and a masked page transition. No
 * rotation, scaling, blur, parallax or bounce anywhere.
 */

/** Custom eased curve used by the page transition and the long tweens. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** The workhorse: a gentle 0.8s spring with no bounce. */
export const SPRING: Transition = {
  type: "spring",
  duration: 0.8,
  bounce: 0,
};

/** Supporting details — a plain delayed fade, no movement. */
export const FADE: Transition = { duration: 0.6, ease: EASE };

/** Card groups use a longer, smoother tween for state changes. */
export const CARD_STATE: Transition = { duration: 0.9, ease: EASE };

export const STAGGER = 0.08;

/* ── Opening sequence ─────────────────────────────────────────────────────
   The intro and About rise from 80px. Location/languages follow, then the
   social links, and the divider lines land last. */

export const openRise: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
};

/** Divider lines: a 40px upward reveal, deliberately late in the sequence. */
export const ruleIn: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

/**
 * The footer name gets the most dramatic entry on the page: it rises from far
 * below over 2.1 seconds on a custom eased tween rather than a spring.
 */
export const dramaticRise: Variants = {
  hidden: { opacity: 0, y: 260 },
  visible: { opacity: 1, y: 0 },
};

/* ── Scroll-in reveals ────────────────────────────────────────────────────
   Reusable content — card contents, work-history details, titles, metadata —
   fades in while moving up 20px, once, on entering the viewport. */

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 20 },
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
   A downward-to-upward wipe on a custom eased curve, roughly half a second,
   with a matching entrance delay.

   Implemented as a fixed overlay rather than by exit-animating the outgoing
   page: App Router unmounts the old tree before AnimatePresence can play it.
   The outgoing page's slight upward drift is handled in CSS instead — see
   `[data-leaving]` in globals.css. */

export const WIPE_MS = 500;

export const wipe: Variants = {
  hidden: { y: "-100%" },
  covering: { y: "0%", transition: { duration: WIPE_MS / 1000, ease: EASE } },
  revealing: {
    y: "100%",
    transition: { duration: WIPE_MS / 1000, ease: EASE },
  },
};

/** Incoming pages begin transparent and settle after the wipe clears. */
export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE, delay: 0.1 },
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
  rise: SPRING,
  fade: FADE,
  open: SPRING,
  rule: SPRING,
  dramatic: { duration: 2.1, ease: EASE } as Transition,
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
