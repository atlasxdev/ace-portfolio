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

/** Delay window for the opening dividers, in seconds. */
export const RULE_DELAY = { min: 2.8, max: 3.1 };

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

/* ── Preloader ───────────────────────────────────────────────────────────
   A three-stage title reveal on a full-screen surface.

     1. RISE   the full name enters from below. Each character rises 270px
               while fading in and sharpening from a 5px blur, on a 0.4s eased
               curve with a small stagger, starting 0.3s in. Underneath, the
               whole name block travels 640px over 2.1s — so the letters
               resolve first and the name itself settles afterwards.
     2. HOLD   the settled name is held centred for ~1.5s. The ambient field
               blooms in behind it, a hairline draws underneath, and the role
               settles below that.
     3. OUT    the whole surface fades, exposing the site beneath.

   Stage 3 was originally the name lifting through the top edge while the
   surface collapsed into a hairline. It was dropped because it stuttered
   badly: animating the overlay's height reflows the document every frame, and
   the page underneath is full of backdrop-filtered glass, so each of those
   frames forced a full re-composite. Opacity stays on the compositor. */

/** Stage 1 — character level. */
export const PRE_CHAR_DELAY = 0.3;
export const PRE_CHAR_STAGGER = 0.035;
export const PRE_CHAR_MS = 400;
export const PRE_CHAR_RISE = 270;
export const PRE_CHAR_BLUR = 5;

/** Stage 1 — the block the characters sit in. */
export const PRE_BLOCK_MS = 2100;
export const PRE_BLOCK_RISE = 640;

/** Stage 2 — the hold. */
export const PRE_HOLD_MS = 1500;
export const PRE_SWITCH_MS = 100;

/* Stage 3 — the name scatters out character by character, then the surface
   fades off behind it. The scatter order is deliberately not left-to-right:
   the entrance already read as a sequence, so repeating it on the way out
   would look like a rewind. */
export const PRE_SCATTER_STAGGER = 0.04;
export const PRE_CHAR_OUT_MS = 350;

/**
 * The surface waits until the last character is gone before it starts fading.
 *
 * Overlapping the two looked dirty: a character at 0.4 opacity inside a panel
 * at 0.4 opacity paints at 0.16, so letters dropped out at wildly different
 * rates depending on where they fell in the scatter. Strict sequence — letters
 * out, then ground out — keeps every opacity curve doing exactly one thing.
 * The exit also carries no blur, unlike the entrance: animating `filter`
 * re-rasterizes each glyph every frame and smears rather than dissolves.
 */
export const PRE_OUT_DELAY = 0.8;
export const PRE_OUT_MS = 1200;
/** The bloom clears just ahead of the surface, so the reveal is off a flat ground. */
export const PRE_GLOW_OUT_DELAY = 0.35;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * A fixed scatter for `n` characters: position `i` leaves in slot
 * `(i * step) % n`. Deterministic, so the server and client agree and the
 * order is stable between loads — a `Math.random()` here would break
 * hydration and make the exit feel arbitrary rather than composed.
 */
export function scatterOrder(n: number): number[] {
  const step = [7, 5, 3].find((s) => gcd(s, n) === 1) ?? 1;
  return Array.from({ length: n }, (_, i) => (i * step) % n);
}

/* The hold is the long part of the sequence, so it gets something to watch:
   the page's own ambient field blooms in behind the name, a hairline draws
   underneath it, and the role settles below that. The rule's duration is the
   hold exactly — it finishes drawing at the moment the lift starts, so the
   wait reads as progress rather than as a pause. */
export const PRE_GLOW_DELAY = 1.2;
export const PRE_GLOW_MS = 1400;
/** How far up the ambient field comes — full strength would swamp the name. */
export const PRE_GLOW_OPACITY = 0.55;
export const PRE_META_DELAY = 2.45;

/** Whole sequence, start to clear. */
export const PRELOAD_MS = PRE_BLOCK_MS + PRE_HOLD_MS + PRE_SWITCH_MS + PRE_OUT_MS;

/** When the surface starts fading — everything before this is the hold. */
export const PRE_OUT_AT = PRE_BLOCK_MS + PRE_HOLD_MS + PRE_SWITCH_MS;

/**
 * The site is uncovered part-way through the collapse rather than after it, so
 * the opening cascade is already running as the surface pulls off the page.
 */
export const PRE_HANDOFF_MS = PRE_OUT_AT + PRE_OUT_DELAY * 1000;

/**
 * Per-character rise. Blur and travel resolve before the block settles.
 *
 * Unlike the scroll-in variants above, the preloader's variants DO carry their
 * own transitions — they're driven directly and never through <Reveal>, so
 * there's no component-level `transition` prop to be overridden by. Adding one
 * to these elements would clobber the orchestration below.
 */
export const preloaderChar: Variants = {
  hidden: {
    opacity: 0,
    y: PRE_CHAR_RISE,
    filter: `blur(${PRE_CHAR_BLUR}px)`,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: PRE_CHAR_MS / 1000, ease: EASE },
  },
};

/** Parent of the characters — owns the 0.3s lead-in and the stagger. */
export const preloaderName: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: PRE_CHAR_DELAY,
      staggerChildren: PRE_CHAR_STAGGER,
    },
  },
};

/** The block the characters ride on: a longer, slower settle underneath them. */
export const preloaderBlock: Variants = {
  hidden: { y: PRE_BLOCK_RISE },
  visible: {
    y: 0,
    transition: { duration: PRE_BLOCK_MS / 1000, ease: EASE },
  },
};

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
