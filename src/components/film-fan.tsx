"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FilmPlayer } from "@/components/film-player";
import { SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Film = {
  title: string;
  src: string;
  poster: string;
  blurb: string;
  link?: { type: string; href: string };
  /** Seconds. */
  duration?: number;
};

/** Sent by Ag's "Show me" (detail: a project title) to bring that film forward. */
export const SHOW_FILM = "ag:show-film";
/** How long the folder takes to fan its films out, so Ag lands once they're there. */
export const SWING_MS = 500;

/*
 * The section is drawn in a fixed scene and scaled to fit, so the choreography
 * is plain numbers. The cards are big and overlap like a hand of cards: on
 * desktop fanned in a row, the middle two on top; on phones stacked down the
 * page, each one's top edge showing above the next. `z` is the stacking order,
 * `tag` the side of the card that stays in view, where its title sits.
 */
type Slot = { x: number; y: number; r: number; z: number; tag: "left" | "right" };
type Scene = {
  w: number;
  h: number;
  card: number;
  /** Where titles sit: clear of the posters' own headlines on desktop, on the
   *  only strip that shows in the phone stack. */
  edge: "top" | "bottom";
  folder: { x: number; y: number; w: number; h: number };
  /** How far above its open spot the shut folder sits: centred in the scene. */
  lift: number;
  open: Slot[];
};
const WIDE: Scene = {
  w: 1000,
  h: 540,
  card: 360,
  edge: "bottom",
  folder: { x: 290, y: 320, w: 420, h: 210 },
  lift: 155,
  open: [
    { x: 215, y: 205, r: -8, z: 1, tag: "left" },
    { x: 400, y: 172, r: -3, z: 2, tag: "left" },
    { x: 600, y: 172, r: 3, z: 2, tag: "right" },
    { x: 785, y: 205, r: 8, z: 1, tag: "right" },
  ],
};
const COMPACT: Scene = {
  w: 400,
  h: 610,
  card: 300,
  edge: "top",
  folder: { x: 45, y: 440, w: 310, h: 160 },
  lift: 215,
  open: [
    { x: 188, y: 95, r: -4, z: 1, tag: "left" },
    { x: 212, y: 175, r: 3, z: 2, tag: "left" },
    { x: 190, y: 255, r: -3, z: 3, tag: "left" },
    { x: 210, y: 335, r: 4, z: 4, tag: "left" },
  ],
};
/** A card is the film's 16:9 poster, full bleed. */
const cardH = (w: number) => w * (9 / 16);

/** Smootherstep: eases in and out with no jolt at either end. */
const ease = (t: number) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * u * (u * (u * 6 - 15) + 10);
};

/**
 * Where print `i` is at flight progress `p` (0 in the folder, 1 fanned out).
 * One spring drives the whole flight, so reversing midway keeps its momentum.
 * The middle of the flight lifts the print in an arc and tips it towards the
 * viewer, the way paper pulled from a folder does.
 */
function pose(scene: Scene, i: number, p: number, count: number, peek: number) {
  const side = i - (count - 1) / 2;
  // Inner prints leave first, outer ones a beat later.
  const lag = Math.abs(side) * 0.07;
  const u = ease((p - lag) / (1 - lag));
  const arc = 64 * p ** 3 * (1 - p) ** 3;
  const f = scene.folder;
  // Shut, the prints sit in the folder where it rests, centred; a hover on
  // the shut folder lifts them a little, as if about to be pulled out.
  const shut = { x: f.x + f.w / 2 + side * 16, y: f.y - scene.lift + 70 - 26 * peek, r: side * 3 };
  const to = scene.open[i];
  return {
    x: shut.x + (to.x - shut.x) * u,
    y: shut.y + (to.y - shut.y) * u - 46 * arc,
    rotate: shut.r + (to.r - shut.r) * u + side * 2 * arc,
    rotateX: -14 * arc,
    rotateY: -side * 9 * arc,
    scale: 0.82 + 0.18 * u,
    sheen: arc * 0.6,
  };
}

/** The folder's own drop as it opens: from centred down to its open spot. */
const folderDrop = (scene: Scene, p: number) => -scene.lift * (1 - ease(p));

/** The flight as motion values: one transform per property, all off the one spring. */
function usePose(progress: MotionValue<number>, peek: MotionValue<number>, scene: Scene, i: number, count: number) {
  const both: MotionValue<number>[] = [progress, peek];
  const at = (v: number[]) => pose(scene, i, v[0], count, v[1]);
  return {
    x: useTransform(both, (v) => at(v as number[]).x),
    y: useTransform(both, (v) => at(v as number[]).y),
    rotate: useTransform(both, (v) => at(v as number[]).rotate),
    rotateX: useTransform(both, (v) => at(v as number[]).rotateX),
    rotateY: useTransform(both, (v) => at(v as number[]).rotateY),
    scale: useTransform(both, (v) => at(v as number[]).scale),
    sheen: useTransform(both, (v) => at(v as number[]).sheen),
  };
}

function Print({
  film,
  i,
  count,
  scene,
  progress,
  peek,
  open,
  hidden,
  spot,
  onPlay,
  imageRef,
}: {
  film: Film;
  i: number;
  count: number;
  scene: Scene;
  progress: MotionValue<number>;
  peek: MotionValue<number>;
  open: boolean;
  /** Its film is up in the player, so the print has lifted out. */
  hidden: boolean;
  /** Ag is pointing at it. */
  spot: boolean;
  onPlay: () => void;
  imageRef: (el: HTMLDivElement | null) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const w = scene.card;
  const h = cardH(w);
  const { x, y, rotate, rotateX, rotateY, scale, sheen } = usePose(progress, peek, scene, i, count);
  const [over, setOver] = useState(false);
  const lifted = open && (over || spot);
  const slot = scene.open[i];

  return (
    <motion.div
      data-project={film.title}
      data-film
      className="absolute top-0 left-0 will-change-transform"
      style={{
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        x,
        y,
        rotate,
        rotateX,
        rotateY,
        scale,
        // Lifted to the top of the hand while pointed at.
        zIndex: lifted ? 10 : 2 + slot.z,
        visibility: hidden ? "hidden" : "visible",
        pointerEvents: open ? "auto" : "none",
      }}>
      {/* The hit target holds still while the card inside lifts and leans, so
          the card can never move out from under the pointer mid-click. */}
      <button
        type="button"
        onClick={onPlay}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOver(true)}
        onPointerLeave={() => setOver(false)}
        onFocus={() => setOver(true)}
        onBlur={() => setOver(false)}
        tabIndex={open ? 0 : -1}
        aria-label={`Watch the ${film.title} film`}
        className="group absolute inset-0 cursor-pointer rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground">
        <motion.div
          ref={imageRef}
          initial={false}
          animate={{ y: lifted ? -14 : 0, scale: lifted ? 1.03 : 1 }}
          transition={reduced ? { duration: 0 } : SNAPPY}
          className="pointer-events-none relative size-full overflow-hidden rounded-md bg-neutral-900 shadow-[0_2px_6px_rgb(0_0_0/0.2),0_24px_48px_-16px_rgb(0_0_0/0.6)] ring-1 ring-black/10 dark:ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- a card in a fan; next/image adds nothing here */}
          <img src={film.poster} alt="" draggable={false} loading="lazy" className="size-full object-cover" />
          {/* The title, on the corner the cards above it leave uncovered. */}
          <span
            className={cn(
              "absolute max-w-[70%] truncate rounded-full bg-black/70 px-3 py-1 text-[12.5px] leading-4 font-medium text-white",
              slot.tag === "left" ? "left-3" : "right-3",
              scene.edge === "top" ? "top-3" : "bottom-3",
            )}>
            {film.title}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
            <span className="grid size-14 scale-90 place-items-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
              <Play className="size-5 translate-x-px fill-current" aria-hidden />
            </span>
          </span>
          {/* Light catching the card mid-flight. */}
          <motion.span
            aria-hidden
            style={{ opacity: sheen }}
            className="absolute inset-0 bg-[linear-gradient(120deg,rgb(255_255_255/0.3),transparent_55%)]"
          />
        </motion.div>
      </button>
    </motion.div>
  );
}

/**
 * The homepage's projects as a folder of film cards.
 *
 * It opens on its own the first time it scrolls into view, the prints flying
 * out of it in an arc, so the films are on show without a click; the folder
 * itself closes and reopens it. A print opens its film in the full-size
 * player, grown out of that print, and it shrinks back into whichever print
 * is current when the player closes.
 */
export function FilmFan({ films }: { films: Film[] }) {
  const reduced = useReducedMotion() ?? false;
  const stage = useRef<HTMLDivElement>(null);
  const images = useRef<(HTMLDivElement | null)[]>([]);
  const seen = useInView(stage, { once: true, amount: 0.45 });
  /** Set once the visitor opens or closes it; until then it follows the scroll. */
  const [chosen, setOpen] = useState<boolean | null>(null);
  const open = chosen ?? seen;
  const [playing, setPlaying] = useState<number | null>(null);
  const [spot, setSpot] = useState<number | null>(null);
  const [width, setWidth] = useState(0);

  const scene = width && width < 640 ? COMPACT : WIDE;
  const scale = width ? Math.min(width / scene.w, 1.1) : 1;
  // Apple's spring model, as everywhere else on the site: the whole flight
  // in under half a second with a touch of overshoot, and a quick peek.
  const progress = useSpring(0, { visualDuration: 0.45, bounce: 0.12, restDelta: 0.0002 });
  const peek = useSpring(0, { visualDuration: 0.25, bounce: 0 });
  const [hovered, setHovered] = useState(false);
  const drop = useTransform(progress, (p) => folderDrop(scene, p));

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) progress.jump(open ? 1 : 0);
    else progress.set(open ? 1 : 0);
  }, [open, reduced, progress]);

  useEffect(() => {
    peek.set(!open && hovered && !reduced ? 1 : 0);
  }, [open, hovered, reduced, peek]);

  useEffect(() => {
    let clear = 0;
    const show = (e: Event) => {
      const i = films.findIndex((f) => f.title === (e as CustomEvent<string>).detail);
      if (i < 0) return;
      setOpen(true);
      setSpot(i);
      window.clearTimeout(clear);
      clear = window.setTimeout(() => setSpot(null), 2400);
    };
    window.addEventListener(SHOW_FILM, show);
    return () => {
      window.removeEventListener(SHOW_FILM, show);
      window.clearTimeout(clear);
    };
  }, [films]);

  const f = scene.folder;
  const flap = SNAPPY;

  return (
    <div ref={stage} className="relative w-full" style={{ height: scene.h * scale }}>
      <div
        className="absolute top-0 left-1/2 origin-top [perspective:1400px]"
        style={{ width: scene.w, height: scene.h, marginLeft: -scene.w / 2, transform: `scale(${scale})` }}>
        {/* Folder back, with its tab */}
        <motion.div aria-hidden className="absolute z-[1]" style={{ left: f.x, top: f.y, width: f.w, height: f.h, y: drop }}>
          <div className="absolute -top-6 left-2 h-10 w-[30%] rounded-t-[14px] bg-[#2c5a96] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]" />
          <div className="absolute inset-x-2 inset-y-0 rounded-[14px] bg-[#2c5a96] shadow-[inset_0_1px_1px_rgb(255_255_255/0.25)]" />
        </motion.div>

        {films.map((film, i) => (
          <Print
            key={film.title}
            film={film}
            i={i}
            count={films.length}
            scene={scene}
            progress={progress}
            peek={peek}
            open={open}
            hidden={playing === i}
            spot={spot === i}
            onPlay={() => setPlaying(i)}
            imageRef={(el) => {
              images.current[i] = el;
            }}
          />
        ))}

        {/* Folder front: the pocket the prints sit in. It tips back as they
            fly out, and is the button that closes and reopens the folder. */}
        <motion.div
          className="absolute z-[6] [perspective:1000px]"
          style={{ left: f.x, top: f.y + 34, width: f.w, height: f.h - 34, y: drop }}>
          <motion.button
            type="button"
            onClick={() => setOpen(!open)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            aria-expanded={open}
            aria-label={open ? "Put the project films away" : "Take out the project films"}
            initial={false}
            animate={{ rotateX: open ? -24 : hovered && !reduced ? -12 : 0 }}
            transition={reduced ? { duration: 0 } : flap}
            className="absolute inset-0 origin-bottom cursor-pointer rounded-[12px_12px_16px_16px] border border-white/20 bg-[#3b6fb6] bg-[linear-gradient(165deg,rgb(255_255_255/0.08),rgb(0_0_0/0.1))] text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_16px_-10px_rgb(0_0_0/0.4)] outline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground">
            <span aria-hidden className="absolute top-4 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-black/15" />
            {/* The folder's label, stuck on like a real one: what's inside and when. */}
            <span className="absolute bottom-6 left-6 -rotate-[1.5deg] rounded-[3px] bg-[#fbfaf6] px-3.5 py-2 text-neutral-900 shadow-[0_1px_2px_rgb(0_0_0/0.25)]">
              <span className="block text-[15px] leading-5 font-semibold tracking-[-0.01em]">Selected work</span>
              <span className="block text-[12px] leading-4 text-neutral-500 tabular-nums">2024–2026</span>
            </span>
          </motion.button>
        </motion.div>

        {/* Its shadow on the page */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ scaleX: open ? 1.08 : 1, opacity: open ? 0.22 : 0.3 }}
          transition={reduced ? { duration: 0 } : flap}
          className="absolute z-0 h-5 rounded-[50%] bg-black blur-[14px]"
          style={{ left: f.x + 20, top: f.y + f.h - 8, width: f.w - 40, y: drop }}
        />
      </div>

      {playing !== null && (
        <FilmPlayer
          films={films}
          index={playing}
          onIndex={setPlaying}
          origin={() => images.current[playing]?.getBoundingClientRect() ?? null}
          onClosed={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
