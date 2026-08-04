"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import {
  EASE,
  TRANSITIONS,
  dramaticRise,
  fadeIn,
  inViewOnce,
  openRise,
  riseIn,
  ruleIn,
  stagger,
} from "@/lib/motion";
import { useOpeningReady } from "@/components/motion/opening";

type RevealKind =
  /** scroll-in content: up 20px */
  | "rise"
  /** supporting detail: opacity only */
  | "fade"
  /** opening sequence: up 80px */
  | "open"
  /** divider line: up 40px, late */
  | "rule"
  /** the one dramatic entry: up from far below over 2.1s */
  | "dramatic";

const VARIANTS: Record<RevealKind, Variants> = {
  rise: riseIn,
  fade: fadeIn,
  open: openRise,
  rule: ruleIn,
  dramatic: dramaticRise,
};

interface RevealProps {
  kind?: RevealKind;
  delay?: number;
  className?: string;
  children?: React.ReactNode;
  role?: string;
  /**
   * Play as part of the opening cascade instead of on scroll. These wait for
   * the preloader to finish — otherwise the whole sequence runs behind it and
   * is over before the visitor sees anything.
   */
  onLoad?: boolean;
}

/**
 * Scroll-in (or opening-cascade) reveal. Every timing comes from
 * src/lib/motion.ts, so the page retunes from one file.
 *
 * Under `prefers-reduced-motion` this renders the final state with no
 * transform and no transition — the content is simply there.
 */
export function Reveal({
  kind = "rise",
  delay = 0,
  className,
  children,
  role,
  onLoad = false,
}: RevealProps) {
  const reduced = useReducedMotion();
  const openingReady = useOpeningReady();

  // Reduced motion: keep a short cross-fade, drop all movement.
  //
  // WCAG's concern is vestibular triggers — translation, parallax, scaling —
  // not opacity. Killing the fade too meant anyone with Windows' "Show
  // animations" switched off (a common performance tweak, not necessarily an
  // accessibility need) saw a completely inert page. Delays are capped so the
  // sequence doesn't crawl.
  if (reduced) {
    const softTrigger = onLoad
      ? { animate: openingReady ? { opacity: 1 } : { opacity: 0 } }
      : openingReady
        ? { whileInView: { opacity: 1 }, viewport: inViewOnce }
        : { animate: { opacity: 0 } };

    return (
      <motion.div
        className={cn(className)}
        role={role}
        initial={{ opacity: 0 }}
        transition={{
          duration: 0.35,
          ease: EASE,
          delay: Math.min(delay, 0.4),
        }}
        {...softTrigger}
      >
        {children}
      </motion.div>
    );
  }

  // Scroll reveals wait for the preloader too, not just the opening cascade.
  // Anything already in the viewport at load — the first divider, the top of
  // About — otherwise fires `whileInView` immediately, behind the covered
  // screen, and has finished before the visitor sees anything. Holding at
  // "hidden" until the surface clears is the same fix as `onLoad`, applied to
  // the reveals that happen to start above the fold.
  const trigger = onLoad
    ? { animate: openingReady ? "visible" : "hidden" }
    : openingReady
      ? { whileInView: "visible", viewport: inViewOnce }
      : { animate: "hidden" };

  return (
    <motion.div
      className={cn(className)}
      role={role}
      initial="hidden"
      variants={VARIANTS[kind]}
      // Merge, don't replace: a bare `transition={{ delay }}` would discard
      // the variant's spring and fall back to a default tween.
      transition={{ ...TRANSITIONS[kind], delay }}
      {...trigger}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wraps a group whose children should arrive in sequence rather than together.
 * Children must be <Reveal> for the stagger to drive them.
 */
export function RevealGroup({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const openingReady = useOpeningReady();
  // Same gate as <Reveal>: don't stagger a group that's above the fold while
  // the preloader is still covering it.
  const groupTrigger = openingReady
    ? ({ whileInView: "visible", viewport: inViewOnce } as const)
    : ({ animate: "hidden" } as const);

  // Same reasoning as above: fade the group in, no movement.
  if (reduced) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={openingReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={stagger(delay)}
      {...groupTrigger}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hairline divider. On the opening screen these land last, ~2.8–3.1s after the
 * cascade starts; further down the page they simply reveal on scroll.
 */
export function Rule({
  className,
  delay = 0,
  onLoad = false,
}: {
  className?: string;
  delay?: number;
  onLoad?: boolean;
}) {
  return (
    <Reveal
      kind="rule"
      role="separator"
      delay={delay}
      onLoad={onLoad}
      className={cn("h-px w-full origin-left bg-rule", className)}
    />
  );
}
