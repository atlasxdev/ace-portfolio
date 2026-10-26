"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { ArrowLeft, ArrowRight, FolderCog, PhoneCall, Rocket, ScanEye, Waypoints } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { APPROACH } from "@/data/approach";
import { SNAPPY, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages as a lifecycle, walked one
 * step at a time like an onboarding flow.
 *
 * The dial is a wheel. The stages sit on its rim and it turns to bring the
 * current one to the top, under the pointer. It never unwinds: Next on the last
 * stage keeps turning forward into the first, so the loop is the motion itself
 * rather than a line drawn back. It can be spun by hand, and lets go the way
 * an iOS picker does: the release velocity is projected forward with
 * UIScrollView's deceleration and the wheel springs to the stage nearest that.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so stage five shares stage one's blue — fitting for the stage
 * that hands back to the start.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

const ICONS = [PhoneCall, FolderCog, Waypoints, Rocket, ScanEye] as const;
const N = APPROACH.length;
const LAST = N - 1;
const STEP_DEG = 360 / N;

const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Signed angle in (-180, 180]. */
const wrap = (deg: number) => mod(deg + 180, 360) - 180;
/** The shortest way round from one stage to another, in stages. */
const shortest = (from: number, to: number) => {
  const d = mod(to - from, N);
  return d > N / 2 ? d - N : d;
};

/** Rim radius as a share of the dial, and where each stage sits on it. */
const RIM = 0.37;
const place = (i: number) => {
  const a = ((-90 + STEP_DEG * i) * Math.PI) / 180;
  // Rounded: Node and the browser disagree in the last float digit of the
  // trig, and an unrounded coordinate fails hydration.
  const r = (v: number) => `${Math.round((50 + v * RIM * 100) * 100) / 100}%`;
  return { left: r(Math.cos(a)), top: r(Math.sin(a)) };
};

/** UIScrollView's .fast deceleration per ms: how far a released spin carries. */
const SPIN_DECEL = 0.99;

function Stage({ i, rot, current, onSelect }: { i: number; rot: MotionValue<number>; current: boolean; onSelect: () => void }) {
  const Icon = ICONS[i];
  // 0 at the top, 1 at the bottom: nearer the pointer is larger and brighter.
  const far = useTransform(rot, (r) => Math.abs(wrap(STEP_DEG * i + r)) / 180);
  const scale = useTransform(far, (d) => 1.3 - d * 0.5);
  const opacity = useTransform(far, (d) => 1 - d * 0.6);
  const upright = useTransform(rot, (r) => -r);

  return (
    <motion.button
      type="button"
      aria-label={`Step ${i + 1}: ${APPROACH[i].title}`}
      aria-current={current ? "step" : undefined}
      onClick={onSelect}
      // Solid behind the tinted badge, so the disc doesn't show through.
      className="absolute z-10 size-11 cursor-pointer rounded-full bg-background outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--step) lg:size-12"
      style={{ ...place(i), x: "-50%", y: "-50%", rotate: upright, scale, opacity, "--step": hue(i) } as never}>
      <span data-active={current || undefined} className="step-badge grid size-full place-items-center rounded-full">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
    </motion.button>
  );
}

function Dial({ pos, onPos }: { pos: number; onPos: (p: number) => void }) {
  const reduced = useReducedMotion() ?? false;
  const step = mod(pos, N);
  const rot = useMotionValue(-pos * STEP_DEG);
  const ref = useRef<HTMLDivElement>(null);
  const spin = useRef<AnimationPlaybackControls | null>(null);
  const grab = useRef<{ angle: number; t: number; v: number; moved: number } | null>(null);
  /** A spin that already set its own landing, so the pos change mustn't restart it. */
  const landing = useRef<number | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (landing.current === pos) {
      landing.current = null;
      return;
    }
    spin.current?.stop();
    spin.current = animate(rot, -pos * STEP_DEG, reduced ? { duration: 0 } : SNAPPY);
  }, [pos, reduced, rot]);

  const pointerAngle = (e: React.PointerEvent) => {
    const b = ref.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180) / Math.PI;
  };

  const onDown = (e: React.PointerEvent) => {
    if (reduced || e.button !== 0) return;
    spin.current?.stop();
    grab.current = { angle: pointerAngle(e), t: e.timeStamp, v: 0, moved: 0 };
    dragged.current = false;
  };

  const onMove = (e: React.PointerEvent) => {
    const g = grab.current;
    if (!g) return;
    const a = pointerAngle(e);
    const d = wrap(a - g.angle);
    const dt = Math.max(e.timeStamp - g.t, 1);
    g.moved += Math.abs(d);
    if (g.moved > 4 && !dragged.current) {
      dragged.current = true;
      ref.current!.setPointerCapture(e.pointerId);
    }
    // Smoothed, so the last jittery frame doesn't decide the throw.
    g.v = g.v * 0.6 + (d / dt) * 0.4;
    g.angle = a;
    g.t = e.timeStamp;
    rot.set(rot.get() + d);
  };

  const onUp = () => {
    const g = grab.current;
    grab.current = null;
    if (!g || !dragged.current) return;
    // Where the spin would coast to, then the stage nearest that.
    const coast = rot.get() + (g.v * SPIN_DECEL) / (1 - SPIN_DECEL);
    const to = Math.round(-coast / STEP_DEG);
    spin.current = animate(rot, -to * STEP_DEG, { ...SNAPPY, velocity: g.v * 1000 });
    if (to !== pos) {
      landing.current = to;
      onPos(to);
    }
  };

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClickCapture={(e) => {
        // The click that ends a spin isn't a press on whatever it ended over.
        if (dragged.current) {
          e.stopPropagation();
          dragged.current = false;
        }
      }}
      className="relative mx-auto aspect-square w-[280px] touch-pan-y select-none md:w-[320px] lg:w-[360px]">
      {/* The current stage's hue, washing in behind the wheel. */}
      {APPROACH.map((s, i) => (
        <motion.div
          key={s.title}
          aria-hidden
          initial={false}
          animate={{ opacity: i === step ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute -inset-[12%] rounded-full blur-2xl"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${hue(i)} 26%, transparent), transparent)` }}
        />
      ))}

      {/* The wheel: a glass disc whose rim carries the stages. */}
      <div aria-hidden className="glass absolute inset-[13%] overflow-hidden rounded-full" />
      <div aria-hidden className="absolute inset-[24%] rounded-full border border-foreground/8" />

      {/* The pointer the current stage turns up under. */}
      <span aria-hidden className="absolute top-[1.5%] left-1/2 h-2.5 w-1 -translate-x-1/2 rounded-full bg-foreground/50" />

      <motion.div className="absolute inset-0" style={{ rotate: rot }}>
        {APPROACH.map((s, i) => (
          <Stage key={s.title} i={i} rot={rot} current={i === step} onSelect={() => onPos(pos + shortest(step, i))} />
        ))}
      </motion.div>

      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
            transition={reduced ? { duration: 0 } : SPRING}>
            <p className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] tabular-nums lg:text-[56px]" style={{ color: `color-mix(in srgb, ${hue(step)} 70%, var(--foreground))` }}>
              {step + 1}
            </p>
            <p className="mt-1.5 text-body-sm text-muted-foreground">{APPROACH[step].stage}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A swipe this far, or this fast, turns the card. */
const SWIPE_PX = 60;
const SWIPE_V = 400;

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  /** Unbounded, so the wheel keeps turning one way through the loop. */
  const [pos, setPos] = useState(0);
  /** +1 forward, -1 back: the side the next card slides in from. */
  const [dir, setDir] = useState(1);
  const step = mod(pos, N);

  const turnTo = (p: number) => {
    if (p === pos) return;
    setDir(p > pos ? 1 : -1);
    setPos(p);
  };
  // Forward always turns on, so the last stage's Next hands back to the first.
  const forward = () => turnTo(pos + 1);
  const back = () => step > 0 && turnTo(pos - 1);

  const onSwipe = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_V) forward();
    else if (offset.x > SWIPE_PX || velocity.x > SWIPE_V) back();
  };

  const slide = reduced ? { duration: 0 } : SNAPPY;
  const Icon = ICONS[step];

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") forward();
        else if (e.key === "ArrowLeft") back();
        else return;
        e.preventDefault();
      }}
      className="flex flex-col items-center gap-group lg:grid lg:grid-cols-[360px_minmax(0,500px)] lg:justify-center lg:gap-14">
      <Reveal kind="fade">
        <Dial pos={pos} onPos={turnTo} />
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
                key={pos}
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
                <span className="step-badge grid size-12 place-items-center rounded-2xl" data-active style={{ "--step": hue(step) } as React.CSSProperties}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <StepBody s={APPROACH[step]} i={step} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" role="group" aria-label="Steps">
              {APPROACH.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => turnTo(pos + shortest(step, i))}
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
      <p className="mt-3 max-w-[46ch] text-body-lg text-pretty text-muted-foreground">{s.body}</p>
    </div>
  );
}

export default ApproachSection;
