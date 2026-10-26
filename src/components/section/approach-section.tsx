"use client";

import {
  AnimatePresence,
  animate,
  motion,
  motionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { ArrowLeft, ArrowRight, AudioLines, Blocks, FileCode2, SearchCheck, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { APPROACH } from "@/data/approach";
import { SNAPPY, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * How the work actually gets done: the five stages as a loose stack of cards
 * beside their words, after the StackSlider reference (our own code).
 *
 * The front card is the current stage; the rest sit behind it, a little
 * askew, so it reads as a pile you work through. Throw the front card off the
 * side (drag, Next, →) and it springs round to the back; Back (←) brings the
 * last one forward again. The words beside it change with it: the title rises
 * in word by word, the description follows.
 *
 * It plays through on its own while it's on screen, the active pill filling
 * as the time runs, and stops for good once the visitor takes over. Every
 * move is a spring (Apple's duration and bounce), including the throw, which
 * keeps the velocity of the hand that threw it.
 *
 * Colour comes from the four hues the ambient field behind the page is built
 * from, cycling, so stage five shares stage one's blue.
 */

/** The ambient field's palette — see `#ambient` in globals.css. */
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;
const hue = (i: number) => HUES[i % HUES.length];

/** The recorded call, the repo's rules, the architecture, the pipeline, the review. */
const ICONS = [AudioLines, FileCode2, Blocks, Workflow, SearchCheck] as const;
const N = APPROACH.length;

/** How askew each card back sits, in degrees: the pile's "messiness". */
const SPREAD = [0, -5, 4, -3, 2.5];
/** Cards shown behind the front one. */
const BEHIND = 3;
/** Seconds each stage stays in front while it plays through. */
const DWELL = 5;

const SETTLE = { type: "spring", visualDuration: 0.45, bounce: 0.2 } as const;
const THROW = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;

function Card({
  i,
  depth,
  x,
  w,
  h,
  front,
  reduced,
  onRelease,
}: {
  i: number;
  depth: number;
  x: MotionValue<number>;
  w: number;
  h: number;
  front: boolean;
  reduced: boolean;
  onRelease: (info: PanInfo) => void;
}) {
  const Icon = ICONS[i];
  const s = APPROACH[i];
  const k = Math.min(depth, BEHIND);
  const shown = depth <= BEHIND;
  // A thrown card leans the way it's going.
  const lean = useTransform(x, [-w * 2, 0, w * 2], [-14, 0, 14]);

  // The front card tips towards the pointer, with a light that follows it.
  const tiltX = useSpring(0, { stiffness: 200, damping: 24 });
  const tiltY = useSpring(0, { stiffness: 200, damping: 24 });
  const [glare, setGlare] = useState<{ x: number; y: number } | null>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!front || reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tiltX.set((0.5 - py) * 10);
    tiltY.set((px - 0.5) * 12);
    setGlare({ x: px * 100, y: py * 100 });
  };
  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setGlare(null);
  };

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{
        y: -k * h * 0.06,
        scale: 1 - k * 0.055,
        rotate: front ? 0 : SPREAD[depth % SPREAD.length],
        opacity: shown ? 1 : 0,
      }}
      transition={reduced ? { duration: 0 } : SETTLE}
      className="absolute top-1/2 left-1/2"
      style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, zIndex: 100 - depth }}>
      <motion.div
        drag={front && !reduced ? "x" : false}
        dragMomentum={false}
        dragElastic={0.9}
        onDragEnd={(_, info) => onRelease(info)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ x, rotate: lean, transformPerspective: 1200 }}
        className={cn("absolute inset-0 touch-pan-y", front ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}>
        <motion.div
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            background: `linear-gradient(165deg, color-mix(in srgb, ${hue(i)} 92%, #fff) 0%, color-mix(in srgb, ${hue(i)} 70%, #000) 100%)`,
          }}
          className="relative size-full overflow-hidden rounded-[18px] text-white shadow-[0_40px_70px_-28px_rgb(0_0_0/0.6),0_2px_6px_rgb(0_0_0/0.12)]">
          {/* Rim light and a soft sheen across the top. */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(155deg,rgb(255_255_255/0.22)_0%,transparent_32%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14),inset_0_1px_0_rgb(255_255_255/0.35)]"
          />
          {/* The stage's mark, large, and its number and name at the foot. */}
          <Icon aria-hidden strokeWidth={1.25} className="absolute top-[18%] left-1/2 size-[46%] -translate-x-1/2 opacity-95" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
            <span className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="pb-1 text-body font-medium text-white/85">{s.stage}</span>
          </div>
          {/* Cards further back sink into the page. */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ opacity: Math.min(1, k * 0.18) }}
            transition={reduced ? { duration: 0 } : SPRING}
            className="absolute inset-0 bg-background"
          />
          {glare && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgb(255 255 255 / 0.5), transparent 55%)` }}
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** A round control that leans a little towards the pointer, on a spring. */
function Magnet({
  onClick,
  label,
  solid,
  children,
}: {
  onClick: () => void;
  label: string;
  solid?: boolean;
  children: React.ReactNode;
}) {
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={SNAPPY}
      style={{ x, y }}
      className={cn(
        "relative grid size-11 cursor-pointer place-items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-foreground",
        solid ? "bg-foreground text-background" : "border border-foreground/15 text-foreground",
      )}>
      {children}
    </motion.button>
  );
}

/** The title, rising in word by word on a spring. */
function Words({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((w, k) => (
        <span key={k} className="inline-block overflow-hidden pb-[0.1em] align-top">
          <motion.span
            className="inline-block"
            initial={reduced ? false : { y: "110%" }}
            animate={{ y: "0%", transition: reduced ? { duration: 0 } : { ...SETTLE, bounce: 0.1, delay: k * 0.05 } }}
            exit={{ y: "-110%", transition: reduced ? { duration: 0 } : { ...THROW, visualDuration: 0.25, delay: k * 0.02 } }}>
            {w}
            {k < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function ApproachSection() {
  const reduced = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const [order, setOrder] = useState(() => APPROACH.map((_, i) => i));
  const orderRef = useRef(order);
  orderRef.current = order;
  const front = order[0];
  const xs = useMemo(() => APPROACH.map(() => motionValue(0)), []);
  const busy = useRef(false);
  const [phone, setPhone] = useState(false);

  // Autoplay: on while in view and untouched; any hand on it ends it.
  const [auto, setAuto] = useState(true);
  const hovering = useRef(false);
  const progress = useMotionValue(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const w = phone ? 210 : 270;
  const h = Math.round(w / 0.78);
  const away = w * 1.25 + 60;

  /** Throws the front card off to one side (away from the words, on the right)
   *  and it springs round to the back. */
  const throwFront = async (dir: 1 | -1, velocity = 0) => {
    if (busy.current) return;
    busy.current = true;
    progress.set(0);
    const top = orderRef.current[0];
    const x = xs[top];
    if (!reduced) await animate(x, dir * away, { ...THROW, velocity, restDelta: 20 });
    setOrder((o) => [...o.slice(1), o[0]]);
    if (reduced) x.set(0);
    else animate(x, 0, { ...SETTLE, delay: 0.05 });
    busy.current = false;
  };
  /** Brings the back card round to the front. */
  const bringBack = () => {
    if (busy.current) return;
    progress.set(0);
    const last = orderRef.current[N - 1];
    if (!reduced) xs[last].set(away);
    setOrder((o) => [o[N - 1], ...o.slice(0, N - 1)]);
    if (!reduced) animate(xs[last], 0, SETTLE);
  };
  const goTo = (i: number) => {
    if (i === orderRef.current[0] || busy.current) return;
    progress.set(0);
    setOrder((o) => {
      const at = o.indexOf(i);
      return [...o.slice(at), ...o.slice(0, at)];
    });
    if (!reduced) {
      xs[i].set(w);
      animate(xs[i], 0, SETTLE);
    }
  };
  const takeOver = () => setAuto(false);

  const onRelease = (info: PanInfo) => {
    takeOver();
    const x = xs[orderRef.current[0]];
    const { x: dx } = info.offset;
    const { x: vx } = info.velocity;
    if (Math.abs(dx) > w * 0.28 || Math.abs(vx) > 550) throwFront(dx + vx * 0.1 > 0 ? 1 : -1, vx);
    else animate(x, 0, { type: "spring", visualDuration: 0.3, bounce: 0.25 });
  };

  useEffect(() => {
    if (!auto || reduced || !inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (!hovering.current && !busy.current && !document.hidden) {
        const v = progress.get() + dt / DWELL;
        if (v >= 1) {
          progress.set(0);
          throwFront(1);
        } else progress.set(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // throwFront reads only refs and stable values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, reduced, inView]);

  // The pile leans a touch with the pointer.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, (v) => v * 6), { stiffness: 90, damping: 18 });
  const rotX = useSpring(useTransform(my, (v) => -v * 6), { stiffness: 90, damping: 18 });

  const s = APPROACH[front];

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="How I work, step by step"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") throwFront(1);
        else if (e.key === "ArrowLeft") bringBack();
        else return;
        e.preventDefault();
        takeOver();
      }}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => {
        hovering.current = false;
        mx.set(0);
        my.set(0);
      }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse" || !root.current) return;
        const r = root.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="grid items-center gap-10 select-none md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
      {/* The words */}
      <div className="order-2 flex flex-col gap-8 md:order-1 md:pl-2">
        <div className="grid" aria-live="polite">
          <AnimatePresence initial={false}>
            <motion.div key={front} className="col-start-1 row-start-1 flex flex-col gap-4 self-end">
              <p className="text-body-sm text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{String(front + 1).padStart(2, "0")}</span>{" "}
                {s.stage}
              </p>
              <h3 className="font-display text-[30px] leading-[1.02] font-semibold tracking-[-0.035em] md:text-[44px]">
                <Words text={s.title} reduced={reduced} />
              </h3>
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: reduced ? { duration: 0 } : { ...SPRING, delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}
                className="max-w-[44ch] text-body-lg text-pretty text-muted-foreground">
                {s.body}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <Magnet
              label="Previous step"
              onClick={() => {
                takeOver();
                bringBack();
              }}>
              <ArrowLeft className="size-4" aria-hidden />
            </Magnet>
            <Magnet
              label="Next step"
              solid
              onClick={() => {
                takeOver();
                throwFront(1);
              }}>
              <ArrowRight className="size-4" aria-hidden />
            </Magnet>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Steps">
            {APPROACH.map((st, i) => (
              <button
                key={st.title}
                type="button"
                aria-label={`Step ${i + 1}: ${st.title}`}
                aria-current={i === front ? "step" : undefined}
                onClick={() => {
                  takeOver();
                  goTo(i);
                }}
                className="cursor-pointer py-2 focus-visible:outline-2 focus-visible:outline-foreground">
                <motion.span
                  initial={false}
                  animate={{ width: i === front ? 28 : 6 }}
                  transition={SNAPPY}
                  className="relative block h-1.5 overflow-hidden rounded-full bg-foreground/15">
                  {i === front && (
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full"
                      style={{ scaleX: auto && !reduced ? progress : 1, background: hue(i) }}
                    />
                  )}
                </motion.span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The pile */}
      <div className="relative order-1 md:order-2" style={{ height: h + 80 }}>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full opacity-30 blur-[40px] transition-colors duration-[1200ms]"
          style={{ width: w * 2.4, height: h * 1.4, x: "-50%", y: "-50%", background: `radial-gradient(closest-side, ${hue(front)}, transparent)` }}
        />
        <motion.div className="absolute inset-0" style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1400 }}>
          {APPROACH.map((st, i) => (
            <Card
              key={st.title}
              i={i}
              depth={order.indexOf(i)}
              x={xs[i]}
              w={w}
              h={h}
              front={i === front}
              reduced={reduced}
              onRelease={onRelease}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ApproachSection;
