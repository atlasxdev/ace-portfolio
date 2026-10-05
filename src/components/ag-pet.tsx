"use client";

import { Music2, VolumeX } from "lucide-react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type TargetAndTransition,
} from "motion/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { petSounds } from "@/lib/pet-sounds";
import {
  CONTACT_SENT_EVENT,
  isPetMuted,
  isPetShown,
  serverSnapshot,
  setPetMuted,
  setPetShown,
  subscribePet,
  togglePet,
} from "@/lib/pet-store";
import { cn } from "@/lib/utils";

/**
 * Ag, the site pet: a small silver pixel creature (Ag is silver, element 47,
 * and Ace's initials). Out by default on every page, above everything else,
 * until it's sent away; Ctrl/⌘ + . or "/pet" in the chat palette brings it
 * back (and sends it off again).
 *
 * It plays on the page itself: hops up onto headings, images, cards and
 * buttons, walks along their top edges, jumps between them, rides along when
 * the page scrolls and drops to the bottom of the screen when its perch
 * leaves view. Scrolling is a ride: it stretches on the way down, squashes on
 * the way up, and has opinions about going fast. It watches the pointer, dozes when the visitor goes idle and
 * has something to say about a few pages. Clicking it opens Pet, Feed, Mute
 * and Send away, each with its own reaction. With reduced motion it stays at
 * the bottom of the screen and fades in and out.
 */

const PX = 5; // screen pixels per art pixel
const BODY = [
  "....XXXX....",
  "..XXSSSSXX..",
  ".XSSHHSSSSX.",
  ".XSHSSSSSSX.",
  "XSSSSSSSSSSX",
  "XSSSSSSSSSSX",
  "XSSSSSSSSSSX",
  "XSSSSSSSSSSX",
  ".XSSSSSSSSX.",
  "..XXXXXXXX..",
];
const FEET = ["..X.X..X.X..", ".X.X....X.X."];
const COLORS: Record<string, string> = {
  X: "#5f646c",
  S: "#cfd3d8",
  H: "#ffffff",
};
const HEART = [
  ".XX.XX.",
  "XXXXXXX",
  "XXXXXXX",
  ".XXXXX.",
  "..XXX..",
  "...X...",
];
const WIDTH = 12 * PX;
const HEIGHT = 11 * PX;

const SLEEP_AFTER = 45_000;
/** Scroll speeds, in px/ms, for a remark and for alarm. */
const SCROLL_FAST = 2.5;
const SCROLL_WILD = 6;
const SCROLL_LINES = {
  down: ["Wheee!", "Down we go!", "Going down!"],
  up: ["Going up!", "Back up we go!", "Elevator up!"],
  wild: ["Whoa, slow down!", "Too fast!", "My stomach!"],
};
const pick = (lines: string[]) =>
  lines[Math.floor(Math.random() * lines.length)];
const FLOOR_GAP = 12;
/** Room above a perch for the speech bubble. */
const HEADROOM = 70;
/** What Ag can climb onto. */
const PERCHES =
  "main :is(h1, h2, h3, img, a[href], button, .glass), aside :is(a[href], button, img)";
/** Text sits on its words, not on the full width of its box. */
const TEXT_PERCHES = "h1, h2, h3, a";

/** The visible top edge Ag stands on: an element's box, or the extent of its text. */
function perchBox(el: Element): DOMRect {
  if (el.matches(TEXT_PERCHES) && !el.querySelector("img, svg")) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    if (r.width > 0) return r;
  }
  return el.getBoundingClientRect();
}

const PAGE_LINES: Record<string, string> = {
  "/projects": "So many projects.",
  "/blog": "Reading time.",
  "/journey": "Ooh, the backstory.",
  "/tech-stacks": "I'm in the periodic table, not the stack.",
  "/schedule": "Book the call. I'll wait here.",
};

const PET_LINES = ["Purr.", "Ag approves.", "Again!", "Shiny and happy."];

type Mode = "idle" | "walk" | "jump" | "sleep";
type Reaction =
  | "pet"
  | "feed"
  | "mute"
  | "unmute"
  | "bye"
  | "land"
  | "huff"
  | "refuse"
  | "hic"
  | "startle"
  | "yawn"
  | "nod";
/** Too much of a good thing: grumpy after a petting spree, round after a feast. */
type Mood = "content" | "annoyed" | "full";
type Perch = { el: Element; dx: number };

/** How the body moves for each reaction; squash and stretch pivot on the feet. */
const REACTIONS: Record<Reaction, TargetAndTransition> = {
  pet: {
    scaleY: [1, 0.8, 1.12, 1],
    scaleX: [1, 1.12, 0.92, 1],
    y: [0, 0, -18, 0],
    transition: { duration: 0.6, times: [0, 0.2, 0.55, 1] },
  },
  feed: {
    scaleY: [1, 0.9, 1, 0.9, 1, 0.9, 1],
    scaleX: [1, 1.06, 1, 1.06, 1, 1.06, 1],
    transition: { duration: 1.1, delay: 0.3 },
  },
  mute: { rotate: [0, -12, 12, -9, 9, 0], transition: { duration: 0.55 } },
  unmute: { y: [0, -10, 0], rotate: [0, 6, 0], transition: { duration: 0.4 } },
  bye: { rotate: [0, -14, 14, -14, 14, 0], transition: { duration: 0.6 } },
  land: {
    scaleY: [0.78, 1.06, 1],
    scaleX: [1.15, 0.97, 1],
    transition: { duration: 0.3 },
  },
  huff: {
    scale: [1, 1.12, 1.12, 1],
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.6 },
  },
  refuse: {
    rotate: [0, -14, 14, -10, 10, 0],
    transition: { duration: 0.5, delay: 0.3 },
  },
  hic: { y: [0, -12, 0], scaleY: [1, 1.15, 1], transition: { duration: 0.28 } },
  startle: {
    y: [0, -22, 0],
    scaleY: [1, 1.2, 1],
    transition: { duration: 0.35 },
  },
  nod: { y: [0, 4, 0], transition: { duration: 0.25 } },
  yawn: {
    scaleY: [1, 1.14, 1.14, 1],
    scaleX: [1, 0.94, 0.94, 1],
    transition: { duration: 1.3, times: [0, 0.35, 0.7, 1] },
  },
};

const PET_SPREE = { count: 5, window: 6_000, cooldown: 8_000 };
const FEAST = { count: 4, window: 12_000, cooldown: 14_000 };
const CHEW = 1_400;

/** Ag's snacks, as pixel art: one is picked per feeding. */
const FOODS: { rows: string[]; colors: Record<string, string> }[] = [
  {
    // an apple
    rows: [
      "...LS...",
      "....S...",
      ".RRRRRR.",
      "RRWRRRRR",
      "RRRRRRRR",
      "RRRRRRRR",
      ".RRRRRR.",
      "..RRRR..",
    ],
    colors: { R: "#d9534f", W: "#f5b5b2", S: "#6b4423", L: "#6fbf5f" },
  },
  {
    // a cookie
    rows: [
      "..CCCC..",
      ".CCDCCC.",
      "CCCCCDCC",
      "CDCCCCCC",
      "CCCCDCCC",
      "CCDCCCDC",
      ".CCCCCC.",
      "..CCCC..",
    ],
    colors: { C: "#d9a441", D: "#6b4423" },
  },
  {
    // a fish
    rows: [
      "........",
      "..BBB..T",
      ".BBBBBTT",
      "BEBBBBTT",
      "BBBBBBTT",
      ".BBBBBTT",
      "..BBB..T",
      "........",
    ],
    colors: { B: "#7fb3d5", E: "#141414", T: "#5a8fb3" },
  },
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);
const between = (min: number, max: number) => min + Math.random() * (max - min);

const floorY = () => window.innerHeight - HEIGHT - FLOOR_GAP;
function floorRange() {
  // Below the desktop breakpoint, keep clear of the chat launcher on the right.
  const reserve = window.innerWidth < 1200 ? 200 : 24;
  return { min: 12, max: Math.max(12, window.innerWidth - WIDTH - reserve) };
}

/** A perch is wide enough, fully on screen, and leaves room for a bubble above. */
const fits = (r: DOMRect) =>
  r.width >= WIDTH + 24 &&
  r.top >= HEIGHT + HEADROOM &&
  r.top <= window.innerHeight - HEIGHT - 60 &&
  r.left >= 0 &&
  r.right <= window.innerWidth;

/** Its top edge isn't hidden under a sticky header or an open dialog. */
function exposed(el: Element, r: DOMRect) {
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + 2);
  return !!hit && (hit === el || el.contains(hit) || hit.contains(el));
}

function perchesNear(
  from: { x: number; y: number },
  exclude: Element | undefined,
  root: Element | null,
) {
  return [...document.querySelectorAll(PERCHES)]
    .filter((el) => el !== exclude && !root?.contains(el))
    .map((el) => ({ el, r: perchBox(el) }))
    .filter(({ el, r }) => fits(r) && exposed(el, r))
    .sort(
      (a, b) =>
        Math.hypot(a.r.left - from.x, a.r.top - from.y) -
        Math.hypot(b.r.left - from.x, b.r.top - from.y),
    )
    .slice(0, 6);
}

export function AgPet() {
  const shown = useSyncExternalStore(subscribePet, isPetShown, serverSnapshot);

  // Ctrl/⌘ + . summons and dismisses it from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        togglePet();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <AnimatePresence>{shown && <Ag key="ag" />}</AnimatePresence>;
}

function Ag() {
  const reduced = useReducedMotion();
  const muted = useSyncExternalStore(subscribePet, isPetMuted, serverSnapshot);
  const pathname = usePathname();

  // Position: the top-left of Ag, in viewport pixels.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const perch = useRef<Perch | null>(null);
  const moves = useRef<AnimationPlaybackControls[]>([]);
  const petRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef(0);

  const [mode, setMode] = useState<Mode>("idle");
  const [look, setLook] = useState(0);
  /** Eyes up (-1) or down (1) while the page scrolls. */
  const [lookY, setLookY] = useState(0);
  /** Scroll speed (px/ms, + is down), sprung, so Ag stretches and squashes with the ride. */
  const ride = useSpring(0, { stiffness: 260, damping: 18 });
  const rideY = useTransform(
    ride,
    (v) => 1 + clamp(v, -SCROLL_WILD, SCROLL_WILD) * 0.035,
  );
  const rideX = useTransform(
    ride,
    (v) => 1 - clamp(v, -SCROLL_WILD, SCROLL_WILD) * 0.02,
  );
  const [bubble, setBubble] = useState<string | null>("Hi, I'm Ag.");
  const [menu, setMenu] = useState(false);
  const [reaction, setReaction] = useState<{
    kind: Reaction;
    id: number;
  } | null>(null);
  const [happy, setHappy] = useState(false);
  const [chewing, setChewing] = useState(false);
  const [mood, setMood] = useState<Mood>("content");
  const moodRef = useRef(mood);
  const petTimes = useRef<number[]>([]);
  const feedTimes = useRef<number[]>([]);
  /** Bumped to make Ag leap somewhere else right now. */
  const [flee, setFlee] = useState(0);
  /** An open dialog Ag should hop onto next. */
  const visit = useRef<Element | null>(null);
  const lastDialog = useRef<Element | null>(null);
  const [shades, setShades] = useState(false);
  const [yawning, setYawning] = useState(false);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);
  /** Bumped when Ag decides to stay put, so the wander timer re-arms. */
  const [beat, setBeat] = useState(0);
  const modeRef = useRef(mode);
  useLayoutEffect(() => {
    modeRef.current = mode;
    moodRef.current = mood;
    themeRef.current = resolvedTheme;
  });

  // The lights going off makes it sleepy; the lights coming on makes it squint
  // and reach for sunglasses. (Adjusted during render, like the page remarks.)
  const [seenTheme, setSeenTheme] = useState(resolvedTheme);
  if (resolvedTheme !== seenTheme) {
    setSeenTheme(resolvedTheme);
    if (seenTheme && resolvedTheme) {
      if (resolvedTheme === "dark") {
        setShades(false);
        setYawning(true);
        setBubble("Lights out. *yawn*");
        setReaction((r) => ({ kind: "yawn", id: (r?.id ?? 0) + 1 }));
      } else {
        setYawning(false);
        setShades(true);
        setBubble("Too bright!");
        setReaction((r) => ({ kind: "startle", id: (r?.id ?? 0) + 1 }));
      }
    }
  }

  const react = (kind: Reaction) =>
    setReaction((r) => ({ kind, id: (r?.id ?? 0) + 1 }));
  const stopMoves = () => {
    moves.current.forEach((m) => m.stop());
    moves.current = [];
  };

  // Arrive on the floor, towards the right.
  useEffect(() => {
    lastActive.current = Date.now();
    const f = floorRange();
    x.set(Math.round(f.min + (f.max - f.min) * 0.75));
    y.set(floorY());
    return () => moves.current.forEach((m) => m.stop());
  }, [x, y]);

  // Keep Ag on its perch as the page scrolls or reflows, and drop it to the
  // floor when the perch scrolls away or leaves the page.
  useEffect(() => {
    let frame = 0;
    const track = () => {
      frame = 0;
      if (modeRef.current === "jump") return;
      const p = perch.current;
      if (!p) {
        const f = floorRange();
        y.set(floorY());
        if (modeRef.current !== "walk") x.set(clamp(x.get(), f.min, f.max));
        return;
      }
      const r = perchBox(p.el);
      if (!p.el.isConnected || !fits(r)) {
        perch.current = null;
        moves.current.forEach((m) => m.stop());
        const f = floorRange();
        setMode("jump");
        moves.current = [
          animate(x, clamp(x.get(), f.min, f.max), { duration: 0.45 }),
          animate(y, floorY(), {
            duration: 0.45,
            ease: "easeIn",
            onComplete: () => {
              setMode("idle");
              setReaction((rx) => ({ kind: "land", id: (rx?.id ?? 0) + 1 }));
            },
          }),
        ];
        return;
      }
      const top = r.top - HEIGHT;
      if (Math.abs(top - y.get()) > 0.5) {
        // The perch moved under it: stop any stroll and ride along.
        if (modeRef.current === "walk") {
          moves.current.forEach((m) => m.stop());
          moves.current = [];
          setMode("idle");
        }
        p.dx = x.get() - r.left;
        y.set(top);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(track);
    };
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);
    const t = setInterval(schedule, 400);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      clearInterval(t);
    };
  }, [x, y]);

  // Scrolling: eyes follow the direction, the body stretches going down and
  // squashes going up, and a quick scroll gets a remark (a wild one, alarm).
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0;
    let quiet = 0;
    let lastRemark = 0;
    let wasFast = false;
    const settle = () => {
      speed = 0;
      wasFast = false;
      ride.set(0);
      setLookY(0);
    };
    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(now - lastT, 8);
      lastY = window.scrollY;
      lastT = now;
      if (!dy) return;
      speed = speed * 0.6 + (dy / dt) * 0.4;
      lastActive.current = Date.now();
      ride.set(speed);
      setLookY(speed > 0.15 ? 1 : speed < -0.15 ? -1 : 0);
      clearTimeout(quiet);
      quiet = window.setTimeout(settle, 140);

      const fast = Math.abs(speed);
      if (fast < SCROLL_FAST || wasFast || now - lastRemark < 3500) return;
      if (modeRef.current === "jump") return;
      wasFast = true;
      lastRemark = now;
      if (modeRef.current === "sleep") {
        setMode("idle");
        setBubble("Huh?! Where are we going?");
        react("startle");
      } else if (fast >= SCROLL_WILD) {
        setBubble(pick(SCROLL_LINES.wild));
        react("startle");
      } else {
        setBubble(pick(speed > 0 ? SCROLL_LINES.down : SCROLL_LINES.up));
        react(speed > 0 ? "hic" : "nod");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(quiet);
    };
  }, [reduced, ride]);

  // Speech bubbles clear themselves.
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 2800);
    return () => clearTimeout(t);
  }, [bubble]);

  // A remark on arriving at some pages (state adjusted during render, so the
  // bubble appears with the page rather than one effect later).
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    const line = Object.entries(PAGE_LINES).find(([path]) =>
      pathname.startsWith(path),
    )?.[1];
    if (line) setBubble(line);
  }

  // Dialogs: hop onto one when it opens and say something about it; watch
  // the typing; celebrate a sent message.
  useEffect(() => {
    const t = setInterval(() => {
      const open = document.querySelector('[role="dialog"][data-state="open"]');
      if (open === lastDialog.current) return;
      lastDialog.current = open;
      if (!open) return;
      const name =
        open.getAttribute("aria-label") ??
        open.querySelector("h2, [data-slot$='-title']")?.textContent ??
        "";
      if (/working on|message/i.test(name))
        setBubble("A message for Ace? I'll keep quiet.");
      else if (/ask about ace/i.test(name))
        setBubble("Ask away. I'm listening.");
      else return; // menus and other sheets: no visit
      lastActive.current = Date.now();
      visit.current = open;
      if (modeRef.current === "walk") {
        moves.current.forEach((m) => m.stop());
        moves.current = [];
      }
      if (modeRef.current !== "jump") setMode("idle");
      setFlee((f) => f + 1);
    }, 300);

    let keys = 0;
    const onKey = (e: KeyboardEvent) => {
      const field = e.target as HTMLElement | null;
      if (
        !field?.closest('[role="dialog"]') ||
        !field.matches("input, textarea")
      )
        return;
      const box = field.getBoundingClientRect();
      const me = petRef.current?.getBoundingClientRect();
      if (me)
        setLook(
          box.left + box.width / 2 < me.left ? -1 : box.left > me.right ? 1 : 0,
        );
      if (++keys % 12 === 0)
        setReaction((r) => ({ kind: "nod", id: (r?.id ?? 0) + 1 }));
    };
    const onSent = () => {
      setBubble("Sent! Ace will get back to you.");
      setHappy(true);
      setReaction((r) => ({ kind: "pet", id: (r?.id ?? 0) + 1 }));
      if (!isPetMuted()) petSounds.pet();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(CONTACT_SENT_EVENT, onSent);
    return () => {
      clearInterval(t);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(CONTACT_SENT_EVENT, onSent);
    };
  }, []);

  // Eyes follow the pointer; any activity counts as company, and wakes it.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      lastActive.current = Date.now();
      const box = petRef.current?.getBoundingClientRect();
      if (!box) return;
      const centre = box.left + box.width / 2;
      setLook(e.clientX < centre - 40 ? -1 : e.clientX > centre + 40 ? 1 : 0);
    };
    const onKey = () => {
      lastActive.current = Date.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Dozing off when standing still, and waking up.
  useEffect(() => {
    const t = setInterval(() => {
      // A full Ag nods off almost at once: a food coma.
      // In the dark it's drowsier, too.
      const after =
        moodRef.current === "full"
          ? 6_000
          : themeRef.current === "dark"
            ? 20_000
            : SLEEP_AFTER;
      const idle = Date.now() - lastActive.current > after;
      const m = modeRef.current;
      if (idle && m === "idle" && !menu) setMode("sleep");
      else if (!idle && m === "sleep") {
        setMode("idle");
        setBubble("Oh! Hi.");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [menu]);

  // Play: every few seconds, stroll along whatever it's standing on, hop to
  // something nearby, or jump down to the floor.
  useEffect(() => {
    if (reduced || mode !== "idle" || (menu && !flee)) return;
    const t = setTimeout(
      () => {
        const p = perch.current;
        const here = { x: x.get(), y: y.get() };
        const surface = p
          ? (() => {
              const r = perchBox(p.el);
              return { min: r.left, max: r.right - WIDTH };
            })()
          : floorRange();
        // Fleeing always jumps, or scurries off if there's nowhere to jump.
        const fleeing = flee > 0;
        if (fleeing) setFlee(0);
        const roll = fleeing ? 1 : Math.random();
        if (roll < 0.2) return setBeat((b) => b + 1);

        if (roll < 0.55 && surface.max - surface.min > 40) {
          const target = Math.round(between(surface.min, surface.max));
          const distance = Math.abs(target - here.x);
          if (distance < 30) return setBeat((b) => b + 1);
          setLook(target > here.x ? 1 : -1);
          setMode("walk");
          moves.current = [
            animate(x, target, {
              duration: distance / 60,
              ease: "linear",
              onComplete: () => {
                if (perch.current)
                  perch.current.dx = x.get() - perchBox(perch.current.el).left;
                setMode((m) => (m === "walk" ? "idle" : m));
              },
            }),
          ];
          return;
        }

        // Jump: onto a dialog that just opened, to a nearby perch, or down to the floor.
        const target = visit.current;
        visit.current = null;
        const targetBox = target?.isConnected
          ? target.getBoundingClientRect()
          : null;
        if (!target && p?.el.matches('[role="dialog"]'))
          return setBeat((b) => b + 1);
        const options = perchesNear(here, p?.el, rootRef.current);
        let dest: { el: Element | null; x: number; y: number };
        if (target && targetBox && fits(targetBox)) {
          dest = {
            el: target,
            x: Math.round(
              clamp(here.x, targetBox.left + 8, targetBox.right - WIDTH - 8),
            ),
            y: targetBox.top - HEIGHT,
          };
        } else if ((p && Math.random() < 0.3) || options.length === 0) {
          if (!p) {
            if (!fleeing) return setBeat((b) => b + 1);
            const f = floorRange();
            const away = here.x > (f.min + f.max) / 2 ? f.min : f.max;
            setLook(away > here.x ? 1 : -1);
            setMode("walk");
            moves.current = [
              animate(x, away, {
                duration: Math.abs(away - here.x) / 220,
                ease: "easeOut",
                onComplete: () => setMode((m) => (m === "walk" ? "idle" : m)),
              }),
            ];
            return;
          }
          const f = floorRange();
          dest = {
            el: null,
            x: Math.round(clamp(here.x + between(-120, 120), f.min, f.max)),
            y: floorY(),
          };
        } else {
          const { el, r } = options[Math.floor(Math.random() * options.length)];
          dest = {
            el,
            x: Math.round(between(r.left, r.right - WIDTH)),
            y: r.top - HEIGHT,
          };
        }
        const peak = Math.min(here.y, dest.y) - between(40, 70);
        const duration = Math.min(
          0.9,
          0.4 + Math.hypot(dest.x - here.x, dest.y - here.y) / 1400,
        );
        setLook(dest.x > here.x ? 1 : -1);
        setMode("jump");
        moves.current = [
          animate(x, dest.x, { duration, ease: "linear" }),
          animate(y, [here.y, peak, dest.y], {
            duration,
            times: [0, 0.4, 1],
            ease: ["easeOut", "easeIn"],
            onComplete: () => {
              perch.current = dest.el
                ? { el: dest.el, dx: dest.x - perchBox(dest.el).left }
                : null;
              setMode("idle");
              react("land");
              // Whatever it lands on gives a little under its weight.
              dest.el?.animate(
                [
                  { transform: "translateY(0)" },
                  { transform: "translateY(3px)" },
                  { transform: "translateY(0)" },
                ],
                { duration: 260, easing: "ease-out" },
              );
            },
          }),
        ];
      },
      flee ? 350 : 2500 + Math.random() * 3000,
    );
    return () => clearTimeout(t);
  }, [mode, menu, reduced, beat, flee, x, y]);

  // Clicking the thing Ag is standing on startles it off.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const p = perch.current;
      if (
        !p ||
        modeRef.current === "jump" ||
        rootRef.current?.contains(e.target as Node)
      )
        return;
      if (!p.el.contains(e.target as Node)) return;
      setBubble("Whoa!");
      setReaction((r) => ({ kind: "startle", id: (r?.id ?? 0) + 1 }));
      setFlee((f) => f + 1);
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, []);

  // Moods wear off.
  useEffect(() => {
    if (mood === "content") return;
    const t = setTimeout(
      () => {
        setMood("content");
        setBubble(
          mood === "annoyed"
            ? "Fine. You're forgiven."
            : "Okay, I can move again.",
        );
      },
      mood === "annoyed" ? PET_SPREE.cooldown : FEAST.cooldown,
    );
    return () => clearTimeout(t);
  }, [mood]);

  // Sunglasses come off and yawns end on their own.
  useEffect(() => {
    if (!shades) return;
    const t = setTimeout(() => setShades(false), 4_000);
    return () => clearTimeout(t);
  }, [shades]);
  useEffect(() => {
    if (!yawning) return;
    const t = setTimeout(() => setYawning(false), 1_300);
    return () => clearTimeout(t);
  }, [yawning]);

  // Chewing stops once the snack is gone.
  useEffect(() => {
    if (!chewing) return;
    const t = setTimeout(() => setChewing(false), CHEW);
    return () => clearTimeout(t);
  }, [chewing]);

  // The menu closes on Esc and on a click elsewhere.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        petRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Happy eyes and blush fade after a moment.
  useEffect(() => {
    if (!happy) return;
    const t = setTimeout(() => setHappy(false), 1100);
    return () => clearTimeout(t);
  }, [happy]);

  const wake = () => {
    lastActive.current = Date.now();
    if (mode === "sleep") setMode("idle");
  };

  /** Records an interaction and says whether it tipped over into a spree. */
  const tally = (
    times: React.RefObject<number[]>,
    rule: { count: number; window: number },
  ) => {
    const now = Date.now();
    times.current = [
      ...times.current.filter((t) => now - t < rule.window),
      now,
    ];
    return times.current.length >= rule.count;
  };

  const pet = () => {
    wake();
    if (mood === "annoyed") {
      react("refuse");
      setBubble("Hmph.");
      return;
    }
    if (tally(petTimes, PET_SPREE)) {
      petTimes.current = [];
      setMood("annoyed");
      setHappy(false);
      react("huff");
      setBubble("Okay, okay! Personal space.");
      if (!muted) petSounds.huff();
      // Storm off somewhere else.
      setMenu(false);
      setTimeout(() => setFlee((f) => f + 1), 700);
      return;
    }
    react("pet");
    setHappy(true);
    setBubble(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    if (!muted) petSounds.pet();
  };

  const feed = () => {
    wake();
    if (mood === "full") {
      react("refuse");
      setBubble("No more, please.");
      return;
    }
    react("feed");
    setChewing(true);
    if (!muted) petSounds.feed();
    if (tally(feedTimes, FEAST)) {
      feedTimes.current = [];
      setMood("full");
      setBubble("So full…");
      // A hiccup once it's all gone down.
      setTimeout(() => {
        react("hic");
        setBubble("*hic*");
        if (!isPetMuted()) petSounds.hic();
      }, 1800);
      return;
    }
    setBubble("Nom. Tastes like silver.");
  };

  const toggleMute = () => {
    wake();
    react(muted ? "unmute" : "mute");
    if (muted) petSounds.pet();
    setPetMuted(!muted);
  };

  const sendAway = () => {
    setMenu(false);
    react("bye");
    setBubble("Bye!");
    // Wave first, then hop off.
    setTimeout(() => setPetShown(false), reduced ? 0 : 650);
  };

  const asleep = mode === "sleep";
  const walking = mode === "walk";
  const eyeShift = asleep ? 0 : look;
  const eyeShiftY = asleep ? 0 : lookY * 0.6;
  const kind = reaction?.kind;

  return (
    <motion.div
      ref={rootRef}
      style={{ x, y }}
      data-ag-pet=""
      className="pointer-events-none fixed top-0 left-0 z-[70]"
      initial="hidden"
      animate="shown"
      exit="gone"
      variants={{
        hidden: { opacity: reduced ? 0 : 1 },
        shown: { opacity: 1, transition: { duration: 0.2 } },
        gone: reduced
          ? { opacity: 0, transition: { duration: 0.2 } }
          : {
              opacity: [1, 1, 0],
              transition: { duration: 0.6, times: [0, 0.9, 1] },
            },
      }}
    >
      <motion.div
        className="relative"
        variants={
          reduced
            ? undefined
            : {
                hidden: { y: 140 },
                shown: {
                  y: [140, -18, 0],
                  transition: {
                    duration: 0.6,
                    times: [0, 0.6, 1],
                    ease: "easeOut",
                  },
                },
                gone: {
                  y: [0, -26, 180],
                  transition: {
                    duration: 0.6,
                    times: [0, 0.35, 1],
                    ease: "easeIn",
                  },
                },
              }
        }
      >
        {/* dust puff on arrival */}
        {!reduced && (
          <span aria-hidden className="absolute bottom-0 left-1/2">
            {[-1, 1].map((side) =>
              [0, 1].map((n) => (
                <motion.span
                  key={`${side}${n}`}
                  className="absolute size-1.5 bg-[#cfd3d8]"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: side * (16 + n * 12),
                    y: -4 - n * 6,
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                />
              )),
            )}
          </span>
        )}

        {/* speech bubble, with the menu under it when open */}
        <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {bubble && (
              <motion.p
                key={bubble}
                role="status"
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                className="relative w-max max-w-52 rounded-xl bg-foreground px-3 py-1.5 text-center text-body-sm text-background"
              >
                {bubble}
                {!menu && (
                  <span
                    aria-hidden
                    className="absolute top-full left-1/2 -ml-1.5 border-x-[6px] border-t-[6px] border-x-transparent border-t-foreground"
                  />
                )}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {menu && (
              <motion.div
                role="menu"
                aria-label="Ag"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-auto flex items-center gap-1 rounded-full border border-foreground/12 bg-card p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)]"
              >
                <MenuButton onClick={pet}>Pet</MenuButton>
                <MenuButton onClick={feed}>Feed</MenuButton>
                <MenuButton onClick={toggleMute}>
                  {muted ? "Sound on" : "Mute"}
                </MenuButton>
                <MenuButton onClick={sendAway}>Send away</MenuButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* zzz */}
        {asleep && (
          <span
            aria-hidden
            className="ag-zzz absolute -top-3 right-0 font-mono text-xs text-muted-foreground"
          >
            z
          </span>
        )}

        {/* reaction effects */}
        {reaction && !reduced && (
          <Effects key={reaction.id} kind={reaction.kind} seed={reaction.id} />
        )}

        <button
          ref={petRef}
          type="button"
          aria-label="Ag, the site pet"
          aria-haspopup="menu"
          aria-expanded={menu}
          onClick={() => {
            wake();
            // Opening the menu stops it mid-stride; play pauses while it's open.
            if (mode === "walk") {
              stopMoves();
              if (perch.current)
                perch.current.dx = x.get() - perchBox(perch.current.el).left;
              setMode("idle");
            }
            setMenu((m) => !m);
          }}
          className="pointer-events-auto block cursor-pointer rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground"
        >
          {/* a full Ag is a round Ag */}
          <motion.span
            className="block"
            style={{
              transformOrigin: "50% 100%",
              scaleX: rideX,
              scaleY: rideY,
            }}
          >
            <motion.span
              className="block"
              style={{ transformOrigin: "50% 100%" }}
              animate={
                mood === "full" && !reduced
                  ? { scaleX: 1.2, scaleY: 0.92 }
                  : { scaleX: 1, scaleY: 1 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
            >
              <motion.span
                key={reaction?.id ?? 0}
                className="block"
                style={{ transformOrigin: "50% 100%" }}
                animate={kind && !reduced ? REACTIONS[kind] : undefined}
              >
                <svg
                  width={WIDTH}
                  height={HEIGHT}
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  shapeRendering="crispEdges"
                  className={cn(
                    "block drop-shadow-[0_2px_0_rgb(0_0_0/0.25)]",
                    !reduced && mode === "idle" && "ag-bob",
                    mood === "annoyed" && "ag-annoyed",
                  )}
                  aria-hidden
                >
                  {BODY.flatMap((row, y) =>
                    [...row].map((ch, x) =>
                      COLORS[ch] ? (
                        <rect
                          key={`${x}-${y}`}
                          x={x * PX}
                          y={y * PX}
                          width={PX}
                          height={PX}
                          fill={COLORS[ch]}
                        />
                      ) : null,
                    ),
                  )}
                  {/* eyes: shut, happy, or open and looking */}
                  {asleep ? (
                    <g fill="#141414">
                      <rect
                        x={3 * PX}
                        y={5 * PX}
                        width={2 * PX}
                        height={PX / 2}
                      />
                      <rect
                        x={7 * PX}
                        y={5 * PX}
                        width={2 * PX}
                        height={PX / 2}
                      />
                    </g>
                  ) : mood === "annoyed" ? (
                    <g fill="#141414">
                      {/* a squint under slanted brows */}
                      <rect x={3 * PX} y={5 * PX} width={2 * PX} height={PX} />
                      <rect x={7 * PX} y={5 * PX} width={2 * PX} height={PX} />
                      <rect x={2 * PX} y={3 * PX} width={PX} height={PX} />
                      <rect
                        x={3 * PX}
                        y={3.5 * PX}
                        width={2 * PX}
                        height={PX / 2}
                      />
                      <rect x={9 * PX} y={3 * PX} width={PX} height={PX} />
                      <rect
                        x={7 * PX}
                        y={3.5 * PX}
                        width={2 * PX}
                        height={PX / 2}
                      />
                    </g>
                  ) : happy ? (
                    <g fill="#141414">
                      {[2, 3, 4, 7, 8, 9].map((ex, i) => (
                        <rect
                          key={ex}
                          x={ex * PX}
                          y={(i % 3 === 1 ? 4 : 5) * PX}
                          width={PX}
                          height={PX}
                        />
                      ))}
                    </g>
                  ) : (
                    <g
                      className={reduced ? undefined : "ag-blink"}
                      fill="#141414"
                    >
                      <rect
                        x={(3 + eyeShift) * PX}
                        y={(4 + eyeShiftY) * PX}
                        width={2 * PX}
                        height={2 * PX}
                      />
                      <rect
                        x={(7 + eyeShift) * PX}
                        y={(4 + eyeShiftY) * PX}
                        width={2 * PX}
                        height={2 * PX}
                      />
                    </g>
                  )}
                  {/* sunglasses */}
                  {shades && (
                    <g>
                      <rect
                        x={2 * PX}
                        y={4 * PX}
                        width={3 * PX}
                        height={2 * PX}
                        fill="#141414"
                      />
                      <rect
                        x={7 * PX}
                        y={4 * PX}
                        width={3 * PX}
                        height={2 * PX}
                        fill="#141414"
                      />
                      <rect
                        x={5 * PX}
                        y={4 * PX}
                        width={2 * PX}
                        height={PX / 2}
                        fill="#141414"
                      />
                      <rect
                        x={2 * PX}
                        y={4 * PX}
                        width={PX}
                        height={PX / 2}
                        fill="#ffffff"
                      />
                      <rect
                        x={7 * PX}
                        y={4 * PX}
                        width={PX}
                        height={PX / 2}
                        fill="#ffffff"
                      />
                    </g>
                  )}
                  {/* blush */}
                  {happy && (
                    <g fill="#f2a5b5">
                      <rect x={1 * PX} y={6 * PX} width={2 * PX} height={PX} />
                      <rect x={9 * PX} y={6 * PX} width={2 * PX} height={PX} />
                    </g>
                  )}
                  {/* mouth */}
                  <rect
                    className={chewing && !reduced ? "ag-chew" : undefined}
                    x={5 * PX}
                    y={7 * PX}
                    width={2 * PX}
                    height={yawning ? 2 * PX : PX}
                    fill="#2a2a2a"
                  />
                  {/* feet: two frames, alternating while walking */}
                  {FEET.map((row, frame) => (
                    <g
                      key={frame}
                      className={
                        walking
                          ? `ag-step-${frame}`
                          : frame === 1
                            ? "hidden"
                            : undefined
                      }
                      fill="#5f646c"
                    >
                      {[...row].map((ch, x) =>
                        ch === "X" ? (
                          <rect
                            key={x}
                            x={x * PX}
                            y={10 * PX}
                            width={PX}
                            height={PX}
                          />
                        ) : null,
                      )}
                    </g>
                  ))}
                </svg>
              </motion.span>
            </motion.span>
          </motion.span>
        </button>
      </motion.div>
    </motion.div>
  );
}

/** One-shot particles for a reaction, centred on Ag. */
function Effects({ kind, seed }: { kind: Reaction; seed: number }) {
  const fade = { duration: 1.1, ease: "easeOut" } as const;

  if (kind === "pet")
    return (
      <span aria-hidden className="pointer-events-none absolute top-0 left-1/2">
        {[-20, 2, 22].map((dx, i) => (
          <motion.span
            key={dx}
            className="absolute"
            initial={{ x: dx - 10, y: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: -50 - i * 6, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ ...fade, delay: i * 0.12 }}
          >
            <PixelHeart />
          </motion.span>
        ))}
      </span>
    );

  if (kind === "feed") {
    const food = FOODS[seed % FOODS.length];
    const crumb = Object.values(food.colors)[0];
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2"
        style={{ top: 7 * PX }}
      >
        {/* the snack drops into the mouth */}
        <motion.span
          className="absolute -ml-3 block"
          initial={{ y: -90, opacity: 1, scale: 1, rotate: -20 }}
          animate={{ y: -4, opacity: [1, 1, 0], scale: [1, 1, 0.4], rotate: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeIn",
            opacity: { duration: 0.45, times: [0, 0.85, 1] },
          }}
        >
          <PixelSprite rows={food.rows} colors={food.colors} />
        </motion.span>
        {/* crumbs */}
        {[-22, -12, 12, 22].map((dx, i) => (
          <motion.span
            key={dx}
            className="absolute size-1"
            style={{ background: crumb }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: dx,
              y: [0, -10 - (i % 2) * 6, 14],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay: 0.45 + i * 0.08,
              ease: "easeOut",
            }}
          />
        ))}
      </span>
    );
  }

  if (kind === "refuse")
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2"
        style={{ top: 0 }}
      >
        {/* the offered snack bonks off its head */}
        <motion.span
          className="absolute -ml-3 block"
          initial={{ x: 0, y: -80, opacity: 1, rotate: 0 }}
          animate={{
            x: [0, 0, 50],
            y: [-80, -20, 30],
            opacity: [1, 1, 0],
            rotate: 300,
          }}
          transition={{
            duration: 0.8,
            times: [0, 0.35, 1],
            ease: ["easeIn", "easeOut"],
          }}
        >
          <PixelSprite rows={FOODS[0].rows} colors={FOODS[0].colors} />
        </motion.span>
      </span>
    );

  if (kind === "huff")
    return (
      <span aria-hidden className="pointer-events-none absolute top-1 left-1/2">
        {[-1, 1].flatMap((side) =>
          [0, 1, 2].map((n) => (
            <motion.span
              key={`${side}${n}`}
              className="absolute size-2 rounded-[2px] bg-foreground/50"
              initial={{ x: side * 22 - 4, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: side * (30 + n * 6) - 4,
                y: -18 - n * 8,
                opacity: [0, 0.9, 0],
                scale: 1.2,
              }}
              transition={{ duration: 0.7, delay: n * 0.12, ease: "easeOut" }}
            />
          )),
        )}
      </span>
    );

  if (kind === "mute" || kind === "unmute") {
    const Icon = kind === "mute" ? VolumeX : Music2;
    return (
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-3 left-1/2 -ml-3.5 grid size-7 place-items-center rounded-full border border-foreground/12 bg-card text-foreground"
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{
          y: -26,
          opacity: [0, 1, 1, 0],
          scale: 1,
          rotate: kind === "unmute" ? [0, -10, 10, 0] : 0,
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Icon className="size-3.5" />
      </motion.span>
    );
  }

  if (kind === "bye")
    return (
      <span aria-hidden className="pointer-events-none absolute top-2 left-1/2">
        {[-1, 1].map((side) => (
          <motion.span
            key={side}
            className="absolute size-1.5 bg-foreground"
            initial={{ x: side * 30, y: 0, opacity: 0 }}
            animate={{ x: side * 40, y: -14, opacity: [0, 1, 0], rotate: 45 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </span>
    );

  return null;
}

function PixelSprite({
  rows,
  colors,
  px = 3,
}: {
  rows: string[];
  colors: Record<string, string>;
  px?: number;
}) {
  return (
    <svg
      width={rows[0].length * px}
      height={rows.length * px}
      shapeRendering="crispEdges"
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          colors[ch] ? (
            <rect
              key={`${x}-${y}`}
              x={x * px}
              y={y * px}
              width={px}
              height={px}
              fill={colors[ch]}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function PixelHeart() {
  const p = 3;
  return (
    <svg width={7 * p} height={6 * p} shapeRendering="crispEdges">
      {HEART.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === "X" ? (
            <rect
              key={`${x}-${y}`}
              x={x * p}
              y={y * p}
              width={p}
              height={p}
              fill="#f28ba8"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function MenuButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="h-8 cursor-pointer rounded-full px-3 text-body-sm whitespace-nowrap text-foreground transition-transform hover:bg-foreground/8 active:scale-95"
    >
      {children}
    </button>
  );
}
