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
   * Above-the-fold content. Rendered in its final state straight from the
   * server, with no entrance at all: the hero holds the page's LCP element,
   * and anything starting at opacity 0 doesn't count as painted until it
   * animates in — which pushes LCP out by the length of the animation.
   */
  onLoad?: boolean;
}

/**
 * Scroll-in reveal. Every timing comes from src/lib/motion.ts, so the page
 * retunes from one file.
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

  if (onLoad) {
    return (
      <div className={cn(className)} role={role}>
        {children}
      </div>
    );
  }

  // Reduced motion: keep a short cross-fade, drop all movement.
  //
  // WCAG's concern is vestibular triggers — translation, parallax, scaling —
  // not opacity. Killing the fade too meant anyone with Windows' "Show
  // animations" switched off (a common performance tweak, not necessarily an
  // accessibility need) saw a completely inert page. Delays are capped so the
  // sequence doesn't crawl.
  if (reduced) {
    return (
      <motion.div
        className={cn(className)}
        role={role}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inViewOnce}
        transition={{
          duration: 0.35,
          ease: EASE,
          delay: Math.min(delay, 0.4),
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      role={role}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      variants={VARIANTS[kind]}
      // Merge, don't replace: a bare `transition={{ delay }}` would discard
      // the variant's spring and fall back to a default tween.
      transition={{ ...TRANSITIONS[kind], delay }}
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

  // Same reasoning as above: fade the group in, no movement.
  if (reduced) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inViewOnce}
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
      whileInView="visible"
      viewport={inViewOnce}
      variants={stagger(delay)}
    >
      {children}
    </motion.div>
  );
}

/** Hairline divider. Reveals on scroll, or sits static above the fold. */
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
