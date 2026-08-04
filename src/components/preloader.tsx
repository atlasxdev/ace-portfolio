"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { PRELOADER_DONE_EVENT } from "@/components/motion/opening";
import { DATA } from "@/data/resume";
import {
  EASE,
  PRE_BLOCK_MS,
  PRE_CHAR_OUT_MS,
  PRE_GLOW_DELAY,
  PRE_GLOW_MS,
  PRE_GLOW_OUT_DELAY,
  PRE_GLOW_OPACITY,
  PRE_HANDOFF_MS,
  PRE_HOLD_MS,
  PRE_META_DELAY,
  PRE_OUT_AT,
  PRE_OUT_DELAY,
  PRE_OUT_MS,
  PRE_SCATTER_STAGGER,
  preloaderBlock,
  preloaderChar,
  preloaderName,
  scatterOrder,
} from "@/lib/motion";

/**
 * Preloader: a three-stage title reveal.
 *
 * 1. The full name rises in — characters first, each sharpening from a blur,
 *    then the slower settle of the block they sit on.
 * 2. It holds centred while the ambient field blooms in behind it, a hairline
 *    draws underneath, and the role settles below. The rule's duration is the
 *    hold exactly, so the wait reads as progress rather than a pause.
 * 3. The surface fades off, exposing the page.
 *
 * Starts visible rather than being switched on from an effect. Rendering it on
 * the server too means no flash of content before it covers, and no hydration
 * mismatch. Everything after that is driven by timers, so nothing sets state
 * synchronously during an effect — and there is only one state change in the
 * whole sequence, at the very end.
 *
 * Plays on every page load, and skipped entirely under reduced-motion. It sits
 * in the root layout, so it mounts once per document — in-app navigation gets
 * the page wipe instead, not a second run of this.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const announce = () => window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));

    if (reduced) {
      const skip = window.setTimeout(() => {
        setVisible(false);
        announce();
      }, 0);
      return () => window.clearTimeout(skip);
    }

    document.body.style.overflow = "hidden";

    const timers = [
      // Unmounting is what plays the exit fade, so this IS stage 3.
      window.setTimeout(() => setVisible(false), PRE_OUT_AT),
      // Hand off part-way into the fade: the opening cascade should be under
      // way as the surface clears, not queued behind it.
      window.setTimeout(() => {
        announce();
        document.body.style.overflow = "";
      }, PRE_HANDOFF_MS),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  const chars = [...DATA.name];
  const scatter = scatterOrder(chars.length);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="preloader"
            aria-hidden
            className="fixed inset-0 z-100 grid place-items-center overflow-hidden bg-background"
            initial={{ opacity: 1 }}
            // Held until every character is gone, so the two fades never
            // multiply into each other — see motion.ts.
            exit={{
              opacity: 0,
              transition: {
                duration: PRE_OUT_MS / 1000 - PRE_OUT_DELAY,
                ease: EASE,
                delay: PRE_OUT_DELAY,
              },
            }}>
            {/* The page's ambient field, blooming in behind the name so the
                hold has something to look at. Sits under everything. */}
            <motion.span
              aria-hidden
              className="preload-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: PRE_GLOW_OPACITY }}
              transition={{
                duration: PRE_GLOW_MS / 1000,
                ease: EASE,
                delay: PRE_GLOW_DELAY,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: PRE_OUT_DELAY - PRE_GLOW_OUT_DELAY,
                  ease: EASE,
                  delay: PRE_GLOW_OUT_DELAY,
                },
              }}
            />

            {/* Stage 1b — the slow settle underneath the characters. The
                column shrinks to the name's width, so the rule below can
                simply be w-full and match it. */}
            <motion.div
              className="relative inline-flex flex-col items-center"
              variants={reduced ? undefined : preloaderBlock}
              initial="hidden"
              animate="visible">
              {/* Stage 1a — lead-in and stagger for the characters. */}
              <motion.p
                className="font-display text-[32px] leading-9.5 font-semibold tracking-[-0.03em] md:text-[40px] md:leading-11.5"
                variants={reduced ? undefined : preloaderName}
                initial="hidden"
                animate="visible">
                {chars.map((char, i) => (
                  <motion.span
                    key={`${char}-${i}`}
                    className="inline-block whitespace-pre"
                    variants={reduced ? undefined : preloaderChar}
                    // Each character leaves on its own clock, in scattered
                    // order. Opacity and a short drift only — see the note in
                    // motion.ts on why the exit carries no blur.
                    exit={{
                      opacity: 0,
                      y: -18,
                      transition: {
                        duration: PRE_CHAR_OUT_MS / 1000,
                        ease: EASE,
                        delay: scatter[i] * PRE_SCATTER_STAGGER,
                      },
                    }}>
                    {char}
                  </motion.span>
                ))}
              </motion.p>

              {/* Draws across the hold and completes as the fade begins. Its
                  own `animate` object, which opts it out of the parent's
                  variant propagation. */}
              <motion.span
                aria-hidden
                className="mt-snug block h-px w-full origin-left bg-foreground/25"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: PRE_HOLD_MS / 1000,
                  ease: "linear",
                  delay: PRE_BLOCK_MS / 1000,
                }}
                exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
              />

              <motion.span
                className="label mt-tight text-ink-faint"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: PRE_META_DELAY,
                }}
                exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}>
                Full-stack &middot; Automation &middot; AI
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {visible && <span className="sr-only">Loading</span>}
    </>
  );
}
