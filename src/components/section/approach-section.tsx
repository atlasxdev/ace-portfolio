"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, FolderCog, PhoneCall, RotateCcw, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { APPROACH } from "@/data/approach";
import { SNAPPY, SPRING, inViewOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages as a lifecycle, walked one
 * step at a time like an onboarding flow, with the ring as its progress.
 *
 * A ring rather than a row because the stages loop — review feeds the next
 * stakeholder call — and a line that ends at step five says the opposite. The
 * 5 → 1 arc is dashed to mark it as the return, not another step.
 *
 * The ring stays whole while the card shows one step, so a skimmer still sees
 * all five stages at once. Each arc draws in as the step after it is reached,
 * the dashed return draws on the last step, and any node jumps straight to its
 * step. The card moves by Next and Back, the arrow keys, or a swipe; nothing
 * advances on its own.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so step five shares step one's blue — fitting for the step
 * that hands back to the start.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;
const LAST = APPROACH.length - 1;

/** The ring's own coordinate space. It scales as a whole with the dial. */
const SIZE = 340;
const C = SIZE / 2;
const R = 124;
/** The progress stroke, in the same space. */
const STROKE = 9;

const rad = (d: number) => (d * Math.PI) / 180;
/** Rounded: Node and the browser disagree in the last float digit of the trig,
 *  and an unrounded coordinate fails hydration. */
const round = (n: number) => Math.round(n * 100) / 100;
const at = (r: number, deg: number) =>
  [round(C + r * Math.cos(rad(deg))), round(C + r * Math.sin(rad(deg)))] as const;
/** Step i's angle: step one at twelve o'clock, clockwise from there. */
const angle = (i: number) => -90 + (360 / APPROACH.length) * i;
const pct = (v: number) => `${(v / SIZE) * 100}%`;

/** Each segment runs node to node; the nodes sit over its ends. */
const ARCS = APPROACH.map((_, i) => {
  const [x1, y1] = at(R, angle(i));
  const [x2, y2] = at(R, angle(i + 1));
  return { d: `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`, loop: i === LAST };
});

const LOOP_NOTE = at(R + 30, -126);

/**
 * The ring is the walk's progress, drawn like Apple's Activity rings: a quiet
 * track, and a thick stroke that grows step by step in each stage's hue. The
 * centre names the step you're on.
 */
function Dial({ step, onSelect, play }: { step: number; onSelect: (i: number) => void; play: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const on = play || reduced;
  const grow = reduced ? { duration: 0 } : SPRING;

  return (
    <div className="relative mx-auto aspect-square w-[230px] md:w-[300px] lg:w-[340px]">
      <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full overflow-visible" fill="none">
        <circle cx={C} cy={C} r={R} className="stroke-foreground/8" strokeWidth={STROKE} />

        {ARCS.map((arc, i) => {
          // Segment i leads into step i + 1, so it fills once that step is
          // reached; the return segment only on the last step.
          const drawn = on && (arc.loop ? step === LAST : step > i);
          return arc.loop ? (
            // pathLength and a dash pattern both drive stroke-dasharray, so
            // the dashed return fades in instead of drawing.
            <motion.path
              key={i}
              d={arc.d}
              stroke={hue(i)}
              strokeWidth={STROKE / 2.5}
              strokeLinecap="round"
              strokeDasharray="2 7"
              initial={false}
              animate={{ opacity: drawn ? 0.9 : 0 }}
              transition={grow}
            />
          ) : (
            <motion.path
              key={i}
              d={arc.d}
              stroke={hue(i)}
              strokeWidth={STROKE}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
              transition={{ ...grow, opacity: { duration: 0.1 } }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={grow}>
            <p className="text-[11px] text-ink-faint tabular-nums md:text-body-sm">
              Step {step + 1} of {APPROACH.length}
            </p>
            <p className="mt-0.5 font-display text-[20px] leading-tight font-semibold tracking-[-0.02em] md:text-[24px] lg:text-[28px]">
              {APPROACH[step].stage}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {APPROACH.map((s, i) => {
        const Icon = ICONS[i];
        const [x, y] = at(R, angle(i));
        return (
          <motion.button
            key={s.title}
            type="button"
            aria-label={`Step ${i + 1}: ${s.title}`}
            aria-current={step === i ? "step" : undefined}
            onClick={() => onSelect(i)}
            initial={false}
            animate={{ scale: step === i ? 1.15 : 1 }}
            whileTap={reduced ? undefined : { scale: 0.92 }}
            transition={reduced ? { duration: 0 } : SNAPPY}
            // Solid behind the tinted badge, so the ring doesn't show through.
            className="absolute z-10 size-10 cursor-pointer rounded-full bg-background outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--step) lg:size-12"
            style={{ left: pct(x), top: pct(y), x: "-50%", y: "-50%", "--step": hue(i) } as React.CSSProperties}>
            <span
              data-active={step === i || undefined}
              className={cn(
                "step-badge grid size-full place-items-center rounded-full transition-opacity duration-300",
                // Steps not yet reached sit back until the walk gets to them.
                i > step && "opacity-50",
              )}>
              <Icon className="size-4 lg:size-[18px]" strokeWidth={1.75} />
            </span>
          </motion.button>
        );
      })}

      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: step === LAST ? 1 : 0 }}
        className="absolute hidden -translate-x-[70%] -translate-y-full text-body-sm whitespace-nowrap text-ink-faint md:block"
        style={{ left: pct(LOOP_NOTE[0]), top: pct(LOOP_NOTE[1]) }}>
        ↺ Back to the start
      </motion.span>
    </div>
  );
}


/** A swipe this far, or this fast, turns the card. */
const SWIPE_PX = 60;
const SWIPE_V = 400;

export function ApproachSection() {
  const band = useRef<HTMLDivElement>(null);
  const inView = useInView(band, inViewOnce);
  const reduced = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);

  const go = (to: number) => {
    const next = Math.min(Math.max(to, 0), LAST);
    if (next !== step) setStep(next);
  };
  // The last step's Next hands back to the start, as the lifecycle does.
  const forward = () => (step === LAST ? go(0) : go(step + 1));

  const onSwipe = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_V) go(step + 1);
    else if (offset.x > SWIPE_PX || velocity.x > SWIPE_V) go(step - 1);
  };

  const slide = reduced ? { duration: 0 } : SNAPPY;

  return (
    <div
      ref={band}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(step + 1);
        else if (e.key === "ArrowLeft") go(step - 1);
        else return;
        e.preventDefault();
      }}
      className="flex flex-col items-center gap-group lg:grid lg:grid-cols-[340px_minmax(0,520px)] lg:justify-center lg:gap-14">
      <Reveal kind="fade">
        <Dial step={step} onSelect={go} play={inView} />
      </Reveal>

      <Reveal delay={0.1} className="w-full">
        <div className="glass flex w-full flex-col overflow-hidden p-group md:p-8">
          {/* Every step sits in the same grid cell, so the card is always as
              tall as the longest one and never jumps between steps. */}
          <motion.div
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragSnapToOrigin
            onDragEnd={onSwipe}
            aria-live="polite"
            className="grid cursor-grab touch-pan-y active:cursor-grabbing">
            {APPROACH.map((s, i) => {
              const Icon = ICONS[i];
              const here = i === step;
              return (
                <motion.div
                  key={s.title}
                  inert={!here}
                  aria-hidden={!here}
                  initial={false}
                  animate={{ opacity: here ? 1 : 0, // Passed steps wait off to the left, later ones to the right, so a card
                  // always enters from the side it's coming from.
                  x: here ? 0 : (i < step ? -28 : 28) }}
                  transition={here ? slide : reduced ? { duration: 0 } : { duration: 0.15 }}
                  style={{ "--step": hue(i) } as React.CSSProperties}
                  className={cn("col-start-1 row-start-1 select-none", !here && "pointer-events-none")}>
                  <span className="step-badge grid size-12 place-items-center rounded-2xl" data-active>
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <p className="label mt-6 text-[10px] text-ink-faint">
                    <span className="text-foreground">{String(i + 1).padStart(2, "0")}</span> {s.stage}
                  </p>
                  <h3 className="mt-2 font-display text-[22px] leading-[28px] font-semibold tracking-[-0.02em] text-balance md:text-[26px] md:leading-[32px]">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-body-lg text-pretty text-muted-foreground">{s.body}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" role="group" aria-label="Steps">
              {APPROACH.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => go(i)}
                  // A 24px hit area around a 6px dot.
                  className="group grid h-6 cursor-pointer place-items-center px-0.5 focus-visible:outline-2 focus-visible:outline-foreground">
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ width: i === step ? 20 : 6 }}
                    transition={slide}
                    className={cn(
                      "block h-1.5 rounded-full transition-colors",
                      i === step ? "bg-foreground" : "bg-foreground/20 group-hover:bg-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="pill-sm"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className="rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-0">
                <ArrowLeft className="size-3.5" aria-hidden />
                Back
              </Button>
              <Button variant="pill" size="pill-sm" onClick={forward}>
                {step === LAST ? (
                  <>
                    <RotateCcw className="size-3.5" aria-hidden />
                    Start over
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-3.5" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default ApproachSection;
