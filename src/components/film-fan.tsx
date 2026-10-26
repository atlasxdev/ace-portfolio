"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FilmPlayer } from "@/components/film-player";

export type Film = {
  title: string;
  src: string;
  poster: string;
  blurb: string;
  link?: { type: string; href: string };
};

/** Sent by Ag's "Show me" (detail: a project title) to bring that film forward. */
export const SHOW_FILM = "ag:show-film";
/** How long the folder takes to fan its films out, so Ag lands once they're there. */
export const SWING_MS = 500;

/*
 * The section is drawn in a fixed scene and scaled to fit, so the choreography
 * is plain numbers. Desktop fans the four films in a row above the folder;
 * phones stack them two by two.
 */
type Scene = {
  w: number;
  h: number;
  card: number;
  folder: { x: number; y: number; w: number; h: number };
  open: { x: number; y: number; r: number }[];
};
const WIDE: Scene = {
  w: 1000,
  h: 470,
  card: 236,
  folder: { x: 290, y: 250, w: 420, h: 210 },
  open: [
    { x: 145, y: 150, r: -7 },
    { x: 383, y: 122, r: -2 },
    { x: 617, y: 122, r: 2.5 },
    { x: 855, y: 150, r: 7 },
  ],
};
const COMPACT: Scene = {
  w: 400,
  h: 520,
  card: 172,
  folder: { x: 45, y: 340, w: 310, h: 170 },
  open: [
    { x: 110, y: 92, r: -4 },
    { x: 290, y: 92, r: 3 },
    { x: 110, y: 240, r: -3 },
    { x: 290, y: 240, r: 4 },
  ],
};
/** The print's image is 16:9 inside a 6px paper border, with a title strip under it. */
const cardH = (w: number) => (w - 12) * (9 / 16) + 12 + 30;

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
function pose(scene: Scene, i: number, p: number, count: number) {
  const side = i - (count - 1) / 2;
  // Inner prints leave first, outer ones a beat later.
  const lag = Math.abs(side) * 0.07;
  const u = ease((p - lag) / (1 - lag));
  const arc = 64 * p ** 3 * (1 - p) ** 3;
  const f = scene.folder;
  const shut = { x: f.x + f.w / 2 + side * 16, y: f.y + 70, r: side * 3 };
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

/** The flight as motion values: one transform per property, all off the one spring. */
function usePose(progress: MotionValue<number>, scene: Scene, i: number, count: number) {
  const at = (p: number) => pose(scene, i, p, count);
  return {
    x: useTransform(progress, (p) => at(p).x),
    y: useTransform(progress, (p) => at(p).y),
    rotate: useTransform(progress, (p) => at(p).rotate),
    rotateX: useTransform(progress, (p) => at(p).rotateX),
    rotateY: useTransform(progress, (p) => at(p).rotateY),
    scale: useTransform(progress, (p) => at(p).scale),
    sheen: useTransform(progress, (p) => at(p).sheen),
  };
}

function Print({
  film,
  i,
  count,
  scene,
  progress,
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
  const { x, y, rotate, rotateX, rotateY, scale, sheen } = usePose(progress, scene, i, count);

  // The print leans towards the pointer and a light band follows it.
  const pitch = useMotionValue(0);
  const yaw = useMotionValue(0);
  const glint = useMotionValue(0);
  const tiltX = useSpring(pitch, { stiffness: 140, damping: 26 });
  const tiltY = useSpring(yaw, { stiffness: 140, damping: 26 });
  const glintX = useSpring(glint, { stiffness: 110, damping: 25 });
  const [over, setOver] = useState(false);
  const lifted = open && (over || spot);

  const lean = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduced || !open || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    pitch.set(-py * 10);
    yaw.set(px * 14);
    glint.set(px * 60);
  };
  const rest = () => {
    setOver(false);
    pitch.set(0);
    yaw.set(0);
  };

  return (
    <motion.div
      data-project={film.title}
      data-film
      className="absolute top-0 left-0 [transform-style:preserve-3d]"
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
        zIndex: lifted ? 5 : 3,
        visibility: hidden ? "hidden" : "visible",
        pointerEvents: open ? "auto" : "none",
      }}>
      <motion.button
        type="button"
        onClick={onPlay}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOver(true)}
        onPointerMove={lean}
        onPointerLeave={rest}
        tabIndex={open ? 0 : -1}
        aria-label={`Watch the ${film.title} film`}
        initial={false}
        animate={{ y: lifted ? -10 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
        style={{ rotateX: tiltX, rotateY: tiltY }}
        className="group relative block size-full cursor-pointer rounded-[7px] bg-[#fcfbf7] p-1.5 text-left shadow-[0_2px_3px_rgb(0_0_0/0.12),0_16px_30px_-12px_rgb(0_0_0/0.45)] outline-offset-4 transition-shadow duration-300 hover:shadow-[0_4px_8px_-3px_rgb(0_0_0/0.18),0_26px_40px_-16px_rgb(0_0_0/0.55)] focus-visible:outline-2 focus-visible:outline-foreground">
        <div ref={imageRef} className="relative aspect-video overflow-hidden rounded-[3px] bg-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small print; next/image adds nothing here */}
          <img src={film.poster} alt="" draggable={false} loading="lazy" className="size-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/15">
            <span className="grid size-9 scale-90 place-items-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
              <Play className="size-4 translate-x-px" aria-hidden />
            </span>
          </span>
          {/* Light catching the paper mid-flight, and following the pointer after. */}
          <motion.span
            aria-hidden
            style={{ opacity: sheen }}
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgb(255_255_255/0.35),transparent_55%)]"
          />
          <motion.span
            aria-hidden
            style={{ x: glintX }}
            className="pointer-events-none absolute -inset-x-1/2 inset-y-0 bg-[linear-gradient(115deg,transparent_38%,rgb(255_255_255/0.16)_50%,transparent_62%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>
        <p className="truncate px-1 pt-2 text-[12.5px] leading-4 font-medium tracking-[-0.01em] text-neutral-800">
          {film.title}
        </p>
      </motion.button>
    </motion.div>
  );
}

/**
 * The homepage's projects as a folder of printed film stills.
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
  const progress = useSpring(0, { stiffness: 90, damping: 23, restDelta: 0.0002 });

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
  const flap = { type: "spring", stiffness: 110, damping: 23 } as const;

  return (
    <div ref={stage} className="relative w-full" style={{ height: scene.h * scale }}>
      <div
        className="absolute top-0 left-1/2 origin-top [perspective:1400px]"
        style={{ width: scene.w, height: scene.h, marginLeft: -scene.w / 2, transform: `scale(${scale})` }}>
        {/* Folder back, with its tab */}
        <div aria-hidden className="absolute z-[1]" style={{ left: f.x, top: f.y, width: f.w, height: f.h }}>
          <div className="absolute -top-6 left-2 h-10 w-[30%] rounded-t-[14px] bg-[#2c5a96] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]" />
          <div className="absolute inset-x-2 inset-y-0 rounded-[14px] bg-[#2c5a96] shadow-[inset_0_1px_1px_rgb(255_255_255/0.25)]" />
        </div>

        {films.map((film, i) => (
          <Print
            key={film.title}
            film={film}
            i={i}
            count={films.length}
            scene={scene}
            progress={progress}
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
        <div className="absolute z-[6] [perspective:1000px]" style={{ left: f.x, top: f.y + 34, width: f.w, height: f.h - 34 }}>
          <motion.button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Put the project films away" : "Take out the project films"}
            initial={false}
            animate={{ rotateX: open ? -24 : 0 }}
            transition={reduced ? { duration: 0 } : flap}
            className="absolute inset-0 origin-bottom cursor-pointer rounded-[12px_12px_16px_16px] border border-white/20 bg-[#3b6fb6] bg-[linear-gradient(165deg,rgb(255_255_255/0.08),rgb(0_0_0/0.1))] text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_16px_-10px_rgb(0_0_0/0.4)] outline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground">
            <span aria-hidden className="absolute top-4 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-black/15" />
            <span className="absolute bottom-5 left-6 text-white">
              <span className="block font-display text-[22px] leading-none font-semibold tracking-[-0.02em]">Launch films</span>
              <span className="mt-1.5 block text-[13px] text-white/70">
                {open ? "Pick one to watch" : `${films.length} projects, tap to open`}
              </span>
            </span>
          </motion.button>
        </div>

        {/* Its shadow on the page */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ scaleX: open ? 1.08 : 1, opacity: open ? 0.22 : 0.3 }}
          transition={reduced ? { duration: 0 } : flap}
          className="absolute z-0 h-5 rounded-[50%] bg-black blur-[14px]"
          style={{ left: f.x + 20, top: f.y + f.h - 8, width: f.w - 40 }}
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
