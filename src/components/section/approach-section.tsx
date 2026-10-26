"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { APPROACH } from "@/data/approach";
import { SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages walked one at a time, like
 * an onboarding flow.
 *
 * The stage list down the side is the macOS installer's sidebar: every stage
 * stays visible so a skimmer sees the whole process at once, the current one
 * is highlighted, and the line beside them fills as the walk gets further.
 * Any stage jumps straight to its card. On a phone the list folds into a row
 * of icons above the card.
 *
 * The last card's button goes back to the first stage, because review feeds
 * the next stakeholder call.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so stage five shares stage one's blue.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;
const LAST = APPROACH.length - 1;

/** A swipe this far, or this fast, turns the card. */
const SWIPE_PX = 60;
const SWIPE_V = 400;

function Stages({ step, onSelect }: { step: number; onSelect: (i: number) => void }) {
  const reduced = useReducedMotion() ?? false;
  const spring = reduced ? { duration: 0 } : SNAPPY;
  const progress = step / LAST;

  return (
    <ol className="relative flex w-full justify-between lg:flex-col lg:justify-start lg:gap-1">
      {/* The line the stages hang on, filling up to the current one. It runs
          badge centre to badge centre: across on a phone, down on desktop. */}
      <span aria-hidden className="absolute top-[22px] right-[22px] left-[22px] h-px bg-foreground/10 lg:top-[26px] lg:right-auto lg:bottom-[26px] lg:left-[30px] lg:h-auto lg:w-px">
        <motion.span
          className="absolute inset-0 origin-left bg-foreground/45 lg:hidden"
          initial={false}
          animate={{ scaleX: progress }}
          transition={spring}
        />
        <motion.span
          className="absolute inset-0 hidden origin-top bg-foreground/45 lg:block"
          initial={false}
          animate={{ scaleY: progress }}
          transition={spring}
        />
      </span>

      {APPROACH.map((s, i) => {
        const Icon = ICONS[i];
        const here = i === step;
        return (
          <li key={s.title} className="relative">
            <button
              type="button"
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-current={here ? "step" : undefined}
              onClick={() => onSelect(i)}
              className="group relative flex cursor-pointer items-center gap-3.5 rounded-2xl text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-foreground lg:w-full lg:px-2 lg:py-2">
              {here && (
                <motion.span
                  layoutId="approach-current"
                  aria-hidden
                  transition={spring}
                  className="absolute inset-0 hidden rounded-2xl bg-foreground/[0.06] lg:block"
                />
              )}
              {/* Solid behind the tinted badge, so the line doesn't show through. */}
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-background">
                <span
                  data-active={here || undefined}
                  style={{ "--step": hue(i) } as React.CSSProperties}
                  className={cn(
                    "step-badge grid size-full place-items-center rounded-full transition-opacity duration-300",
                    // Stages not reached yet sit back until the walk gets to them.
                    i > step && "opacity-45 group-hover:opacity-100",
                  )}>
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                </span>
              </span>
              <span className="relative hidden min-w-0 lg:block">
                <span
                  className={cn(
                    "block text-body font-medium transition-colors duration-300",
                    here ? "text-foreground" : i < step ? "text-muted-foreground" : "text-ink-faint",
                  )}>
                  {s.stage}
                </span>
                <span className="block truncate text-body-sm text-ink-faint">{s.title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  /** +1 forward, -1 back: the side the next card slides in from. */
  const [dir, setDir] = useState(1);

  const go = (to: number) => {
    if (to === step || to < 0 || to > LAST) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
  };
  // The last stage hands back to the first, as the lifecycle does.
  const forward = () => (step === LAST ? (setDir(1), setStep(0)) : go(step + 1));
  const back = () => go(step - 1);

  const onSwipe = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_V) go(step + 1);
    else if (offset.x > SWIPE_PX || velocity.x > SWIPE_V) back();
  };

  const slide = reduced ? { duration: 0 } : SNAPPY;
  const Icon = ICONS[step];

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") go(step + 1);
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") back();
        else return;
        e.preventDefault();
      }}
      className="flex flex-col gap-group lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-10">
      <Reveal kind="fade" className="w-full px-1 lg:px-0">
        <Stages step={step} onSelect={go} />
      </Reveal>

      <Reveal delay={0.1} className="w-full">
        <div className="glass flex w-full flex-col overflow-hidden p-group md:p-8">
          <motion.div
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragSnapToOrigin
            onDragEnd={onSwipe}
            aria-live="polite"
            className="grid cursor-grab touch-pan-y select-none active:cursor-grabbing">
            {/* Every stage laid out unseen in the same cell, so the card is
                always as tall as the longest and never jumps between them. */}
            {APPROACH.map((s) => (
              <StepBody key={s.title} s={s} i={0} className="invisible" aria-hidden />
            ))}
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={{
                  in: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 32 }),
                  shown: { opacity: 1, x: 0 },
                  out: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -32 }),
                }}
                initial="in"
                animate="shown"
                exit="out"
                transition={slide}
                className="col-start-1 row-start-1">
                <span
                  className="step-badge grid size-12 place-items-center rounded-2xl"
                  data-active
                  style={{ "--step": hue(step) } as React.CSSProperties}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <StepBody s={APPROACH[step]} i={step} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-body-sm text-ink-faint tabular-nums">
              {step + 1} of {APPROACH.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="pill-sm"
                onClick={back}
                disabled={step === 0}
                className="rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-0">
                <ArrowLeft className="size-3.5" aria-hidden />
                Back
              </Button>
              <Button variant="pill" size="pill-sm" onClick={forward}>
                {step === LAST ? "Back to the start" : "Next"}
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function StepBody({
  s,
  i,
  className,
  ...rest
}: { s: (typeof APPROACH)[number]; i: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("col-start-1 row-start-1", className)} {...rest}>
      {/* Space for the badge, which only the visible copy draws. */}
      {className === "invisible" && <span className="block size-12" />}
      <p className="label mt-6 text-[10px] text-ink-faint">
        <span className="text-foreground">{String(i + 1).padStart(2, "0")}</span> {s.stage}
      </p>
      <h3 className="mt-2 font-display text-[22px] leading-[28px] font-semibold tracking-[-0.02em] text-balance md:text-[26px] md:leading-[32px]">
        {s.title}
      </h3>
      <p className="mt-3 max-w-[52ch] text-body-lg text-pretty text-muted-foreground">{s.body}</p>
    </div>
  );
}

export default ApproachSection;
