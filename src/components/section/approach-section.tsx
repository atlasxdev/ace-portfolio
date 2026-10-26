"use client";

import { motion, useInView, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, AudioLines, Blocks, FileCode2, RotateCcw, SearchCheck, Workflow } from "lucide-react";
import { useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { APPROACH } from "@/data/approach";
import { EASE, SNAPPY, inViewOnce } from "@/lib/motion";
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

/** The recorded call, the repo's rules, the architecture, the pipeline, the review. */
const ICONS = [AudioLines, FileCode2, Blocks, Workflow, SearchCheck] as const;
const LAST = APPROACH.length - 1;

/** The ring's own coordinate space. It scales as a whole with the dial. */
const SIZE = 340;
const C = SIZE / 2;
const R = 124;
/** Node radius in the same space, plus clearance, sets where each arc stops. */
const NODE = 24;
const ARC_GAP = ((NODE + 7) / R) * (180 / Math.PI);

const rad = (d: number) => (d * Math.PI) / 180;
/** Rounded: Node and the browser disagree in the last float digit of the trig,
 *  and an unrounded coordinate fails hydration. */
const round = (n: number) => Math.round(n * 100) / 100;
const at = (r: number, deg: number) =>
  [round(C + r * Math.cos(rad(deg))), round(C + r * Math.sin(rad(deg)))] as const;
/** Step i's angle: step one at twelve o'clock, clockwise from there. */
const angle = (i: number) => -90 + (360 / APPROACH.length) * i;
const pct = (v: number) => `${(v / SIZE) * 100}%`;

const ARCS = APPROACH.map((_, i) => {
  const a1 = angle(i) + ARC_GAP;
  const a2 = angle(i + 1) - ARC_GAP;
  const [x1, y1] = at(R, a1);
  const [x2, y2] = at(R, a2);
  // Chevron at the arc's end, opening back along the tangent.
  const [ax, ay] = [x2, y2];
  const t = a2 + 90;
  const k = 5;
  const back = [round(-Math.cos(rad(t)) * k), round(-Math.sin(rad(t)) * k)];
  const side = [round(Math.cos(rad(a2)) * k * 0.8), round(Math.sin(rad(a2)) * k * 0.8)];
  return {
    d: `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`,
    head: `M${ax + back[0] + side[0]} ${ay + back[1] + side[1]} L${ax} ${ay} L${ax + back[0] - side[0]} ${ay + back[1] - side[1]}`,
    loop: i === LAST,
  };
});

/** Tick marks on an outer scale, a longer one every fifth. */
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const long = i % 12 === 0;
  const [x1, y1] = at(R + 16, i * 6 - 90);
  const [x2, y2] = at(R + 16 + (long ? 7 : 3), i * 6 - 90);
  return { x1, y1, x2, y2, long };
});

const LOOP_NOTE = at(R + 34, -126);

function Dial({ step, onSelect, play }: { step: number; onSelect: (i: number) => void; play: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const on = play || reduced;

  return (
    <div className="relative mx-auto aspect-square w-[230px] md:w-[300px] lg:w-[340px]">
      {/* Drafting grid, reaching past the ring and fading out beyond it. */}
      <div
        aria-hidden
        className="absolute -inset-[30%] rounded-full [background-image:linear-gradient(color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-position:center] [background-size:3.125%_3.125%] [mask-image:radial-gradient(circle,#000_38%,transparent_70%)]"
      />

      <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full overflow-visible" fill="none">
        <circle cx={C} cy={C} r={R} className="stroke-rule" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {TICKS.map(({ long, ...line }, i) => (
          <line
            key={i}
            {...line}
            className={long ? "stroke-foreground/30" : "stroke-foreground/14"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {ARCS.map((arc, i) => {
          // Arc i leads into step i + 1, so it's drawn once that step is
          // reached; the return arc only on the last step.
          const drawn = on && (arc.loop ? step === LAST : step > i);
          const transition = reduced ? { duration: 0 } : { duration: 0.35, ease: EASE };
          return (
            <g key={i} stroke={hue(i)} strokeLinecap="round" strokeLinejoin="round">
              {/* Solid arcs draw on; the dashed return can't (pathLength and a
                  dash pattern both drive stroke-dasharray), so it fades in. */}
              {arc.loop ? (
                <motion.path
                  d={arc.d}
                  strokeWidth={1.5}
                  strokeDasharray="3 4"
                  initial={false}
                  animate={{ opacity: drawn ? 0.7 : 0 }}
                  transition={transition}
                />
              ) : (
                <motion.path
                  d={arc.d}
                  strokeWidth={step === i + 1 ? 2 : 1.5}
                  initial={false}
                  animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 0.85 : 0 }}
                  transition={transition}
                />
              )}
              <motion.path
                d={arc.head}
                strokeWidth={1.5}
                initial={false}
                animate={{ opacity: drawn ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.15, ease: EASE, delay: drawn ? 0.25 : 0 }}
              />
            </g>
          );
        })}
      </svg>

      {/* overflow-hidden: .glass's top-sheen ::before is a rounded rect, and
          on a circle its corners poke out past the rim. */}
      <div className="glass absolute top-1/2 left-1/2 grid size-[39%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full text-center">
        <div>
          <span className="label text-[9.5px] text-ink-faint">Lifecycle</span>
          <p className="mt-1 font-display text-[12.5px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[15px] lg:text-[17px]">
            Ship, learn,
            <br />
            repeat
          </p>
        </div>
      </div>

      {APPROACH.map((s, i) => {
        const [x, y] = at(R, angle(i));
        return (
          <button
            key={s.title}
            type="button"
            aria-label={`Step ${i + 1}: ${s.title}`}
            aria-current={step === i ? "step" : undefined}
            onClick={() => onSelect(i)}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[11px] outline-offset-2 transition-transform duration-300 ease-(--ease-snappy) focus-visible:outline-2 focus-visible:outline-foreground lg:rounded-[14px]",
              // The current stage stands a little proud of the ring.
              step === i ? "scale-110 shadow-[0_8px_24px_-8px_var(--step)]" : "hover:scale-105",
            )}
            style={{ left: pct(x), top: pct(y), "--step": hue(i) } as React.CSSProperties}>
            <StageIcon
              i={i}
              reached={i <= step}
              className="size-10 rounded-[11px] lg:size-12 lg:rounded-[14px]"
              glyph="size-5 lg:size-6"
            />
          </button>
        );
      })}

      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: step === LAST ? 1 : 0 }}
        className="label absolute hidden -translate-x-[70%] -translate-y-full text-[9.5px] whitespace-nowrap text-ink-faint md:block"
        style={{ left: pct(LOOP_NOTE[0]), top: pct(LOOP_NOTE[1]) }}>
        ↺ Next iteration
      </motion.span>
    </div>
  );
}

/**
 * A stage's icon as an Apple Settings tile: a rounded square in the stage's
 * hue with a white glyph. The hue is deepened toward the bottom so the glyph
 * clears 3:1 even on the green. Stages not reached yet are plain grey; the
 * colour fades in over the grey as the walk gets to them.
 */
function StageIcon({ i, reached, className, glyph }: { i: number; reached: boolean; className: string; glyph: string }) {
  const Icon = ICONS[i];
  const h = hue(i);
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-background", className)}>
      {/* Solid underneath, so nothing behind shows through the grey. */}
      <span aria-hidden className="absolute inset-0 bg-foreground/8" />
      <span
        aria-hidden
        className="absolute inset-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] transition-opacity duration-300"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${h} 90%, #fff), color-mix(in srgb, ${h} 78%, #000))`,
          opacity: reached ? 1 : 0,
        }}
      />
      <Icon
        aria-hidden
        className={cn("relative transition-colors duration-300", glyph, reached ? "text-white" : "text-ink-faint")}
        strokeWidth={2}
      />
    </span>
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
              const here = i === step;
              return (
                <motion.div
                  key={s.title}
                  inert={!here}
                  aria-hidden={!here}
                  initial={false}
                  // Passed steps wait off to the left, later ones to the right, so a
                  // card always enters from the side it's coming from.
                  animate={{ opacity: here ? 1 : 0, x: here ? 0 : i < step ? -28 : 28 }}
                  transition={here ? slide : reduced ? { duration: 0 } : { duration: 0.15 }}
                  style={{ "--step": hue(i) } as React.CSSProperties}
                  className={cn("col-start-1 row-start-1 select-none", !here && "pointer-events-none")}>
                  <StageIcon i={i} reached className="size-12 rounded-[14px]" glyph="size-6" />
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
