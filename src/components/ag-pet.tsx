"use client";

import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { petSounds } from "@/lib/pet-sounds";
import {
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
 * and Ace's initials). Hidden until a visitor summons it with Ctrl/⌘ + . or
 * "/pet" in the chat palette; from then on it lives along the bottom of the
 * screen on every page, above everything else, until it's sent away.
 *
 * It wanders, watches the pointer, dozes when the visitor goes idle and has
 * something to say about a few pages. Clicking it opens Pet, Feed, Sound and
 * Send away. With reduced motion it stays put and fades in and out.
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
const COLORS: Record<string, string> = { X: "#5f646c", S: "#cfd3d8", H: "#ffffff" };
const WIDTH = 12 * PX;
const HEIGHT = 11 * PX;

const SLEEP_AFTER = 45_000;

const PAGE_LINES: Record<string, string> = {
  "/projects": "So many projects.",
  "/blog": "Reading time.",
  "/journey": "Ooh, the backstory.",
  "/tech-stacks": "I'm in the periodic table, not the stack.",
  "/schedule": "Book the call. I'll wait here.",
};

const PET_LINES = ["Purr.", "Ag approves.", "Again!", "Shiny and happy."];

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

type Mode = "idle" | "walk" | "sleep";

function Ag() {
  const reduced = useReducedMotion();
  const muted = useSyncExternalStore(subscribePet, isPetMuted, serverSnapshot);
  const pathname = usePathname();

  const x = useMotionValue(0);
  const petRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef(0);

  const [mode, setMode] = useState<Mode>("idle");
  const [look, setLook] = useState(0);
  const [bubble, setBubble] = useState<string | null>("Hi, I'm Ag.");
  const [menu, setMenu] = useState(false);
  const [chewing, setChewing] = useState(false);
  const [hop, setHop] = useState(0);
  /** Bumped when Ag decides to stay put, so the wander timer re-arms. */
  const [beat, setBeat] = useState(0);
  const modeRef = useRef(mode);
  useLayoutEffect(() => {
    modeRef.current = mode;
  });

  const bounds = useCallback(() => {
    // Below the desktop breakpoint, keep clear of the chat launcher on the right.
    const reserve = window.innerWidth < 1200 ? 200 : 24;
    return { min: 12, max: Math.max(12, window.innerWidth - WIDTH - reserve) };
  }, []);

  const say = useCallback((line: string) => setBubble(line), []);

  // Start somewhere along the right-hand side, and stay in bounds on resize.
  useEffect(() => {
    lastActive.current = Date.now();
    const { min, max } = bounds();
    x.set(Math.round(min + (max - min) * 0.75));
    const onResize = () => {
      const b = bounds();
      x.set(Math.min(Math.max(x.get(), b.min), b.max));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bounds, x]);

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
    const line = Object.entries(PAGE_LINES).find(([path]) => pathname.startsWith(path))?.[1];
    if (line) setBubble(line);
  }

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

  // Dozing off, and waking up.
  useEffect(() => {
    const t = setInterval(() => {
      const idle = Date.now() - lastActive.current > SLEEP_AFTER;
      const m = modeRef.current;
      if (idle && m !== "sleep" && !menu) setMode("sleep");
      else if (!idle && m === "sleep") {
        setMode("idle");
        setBubble("Oh! Hi.");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [menu]);

  // Wandering: every few seconds, maybe walk somewhere new. The walk itself
  // lives in a ref: starting it flips mode to "walk", which re-runs this
  // effect, and its cleanup must not cancel the stroll it just began.
  const walkRef = useRef<ReturnType<typeof animate>>(null);
  useEffect(() => {
    if (reduced || mode !== "idle" || menu) return;
    const t = setTimeout(
      () => {
        const { min, max } = bounds();
        const target = Math.round(min + Math.random() * (max - min));
        const distance = Math.abs(target - x.get());
        if (Math.random() < 0.25 || distance < 40) return setBeat((b) => b + 1);
        setLook(target > x.get() ? 1 : -1);
        setMode("walk");
        walkRef.current = animate(x, target, {
          duration: distance / 60,
          ease: "linear",
          onComplete: () => setMode((m) => (m === "walk" ? "idle" : m)),
        });
      },
      2500 + Math.random() * 3500,
    );
    return () => clearTimeout(t);
  }, [mode, menu, reduced, beat, bounds, x]);

  // Stop mid-stride when it dozes off or its menu opens, and on the way out.
  useEffect(() => {
    if (mode !== "walk") walkRef.current?.stop();
  }, [mode]);
  useEffect(() => () => walkRef.current?.stop(), []);

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

  const wake = () => {
    lastActive.current = Date.now();
    if (mode === "sleep") setMode("idle");
  };

  const pet = () => {
    wake();
    setHop((h) => h + 1);
    say(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    if (!muted) petSounds.pet();
  };

  const feed = () => {
    wake();
    setChewing(true);
    setTimeout(() => setChewing(false), 1100);
    say("Nom. Tastes like silver.");
    if (!muted) petSounds.feed();
  };

  const asleep = mode === "sleep";
  const walking = mode === "walk";
  const eyeShift = asleep ? 0 : look;

  return (
    <motion.div
      ref={rootRef}
      style={{ x }}
      className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 z-[70]"
      initial={reduced ? { opacity: 0 } : { y: 140, opacity: 1 }}
      animate={reduced ? { opacity: 1 } : { y: [140, -18, 0], transition: { duration: 0.6, times: [0, 0.6, 1], ease: "easeOut" } }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0.2 } }
          : { y: [0, -26, 160], transition: { duration: 0.6, times: [0, 0.35, 1], ease: "easeIn" } }
      }>
      {/* dust puff on arrival */}
      {!reduced && (
        <span aria-hidden className="absolute bottom-0 left-1/2">
          {[-1, 1].map((side) =>
            [0, 1].map((n) => (
              <motion.span
                key={`${side}${n}`}
                className="absolute size-1.5 bg-[#cfd3d8]"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: side * (16 + n * 12), y: -4 - n * 6, opacity: [0, 0.9, 0] }}
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
              className="relative w-max max-w-52 rounded-xl bg-foreground px-3 py-1.5 text-center text-body-sm text-background">
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex items-center gap-1 rounded-full border border-foreground/12 bg-card p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)]">
              <MenuButton onClick={pet}>Pet</MenuButton>
              <MenuButton onClick={feed}>Feed</MenuButton>
              <MenuButton onClick={() => setPetMuted(!muted)}>{muted ? "Sound on" : "Mute"}</MenuButton>
              <MenuButton onClick={() => setPetShown(false)}>Send away</MenuButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* zzz */}
      {asleep && (
        <span aria-hidden className="ag-zzz absolute -top-3 right-0 font-mono text-xs text-muted-foreground">
          z
        </span>
      )}

      <button
        ref={petRef}
        type="button"
        aria-label="Ag, the site pet"
        aria-haspopup="menu"
        aria-expanded={menu}
        onClick={() => {
          wake();
          // Opening the menu stops it mid-stride; the wander loop pauses while it's open.
          if (mode === "walk") setMode("idle");
          setMenu((m) => !m);
        }}
        className="pointer-events-auto block cursor-pointer rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-foreground">
        <motion.span
          key={hop}
          className="block"
          animate={hop && !reduced ? { y: [0, -16, 0] } : undefined}
          transition={{ duration: 0.4, ease: "easeOut" }}>
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          shapeRendering="crispEdges"
          className={cn("block drop-shadow-[0_2px_0_rgb(0_0_0/0.25)]", !reduced && !walking && !asleep && "ag-bob")}
          aria-hidden>
          {BODY.flatMap((row, y) =>
            [...row].map((ch, x) =>
              COLORS[ch] ? <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} fill={COLORS[ch]} /> : null,
            ),
          )}
          {/* eyes: open and looking, or shut */}
          {asleep ? (
            <g fill="#141414">
              <rect x={3 * PX} y={5 * PX} width={2 * PX} height={PX / 2} />
              <rect x={7 * PX} y={5 * PX} width={2 * PX} height={PX / 2} />
            </g>
          ) : (
            <g className={reduced ? undefined : "ag-blink"} fill="#141414">
              <rect x={(3 + eyeShift) * PX} y={4 * PX} width={2 * PX} height={2 * PX} />
              <rect x={(7 + eyeShift) * PX} y={4 * PX} width={2 * PX} height={2 * PX} />
            </g>
          )}
          {/* mouth */}
          <rect
            className={chewing && !reduced ? "ag-chew" : undefined}
            x={5 * PX}
            y={7 * PX}
            width={2 * PX}
            height={PX}
            fill="#2a2a2a"
          />
          {/* feet: two frames, alternating while walking */}
          {FEET.map((row, frame) => (
            <g key={frame} className={walking ? `ag-step-${frame}` : frame === 1 ? "hidden" : undefined} fill="#5f646c">
              {[...row].map((ch, x) => (ch === "X" ? <rect key={x} x={x * PX} y={10 * PX} width={PX} height={PX} /> : null))}
            </g>
          ))}
        </svg>
        </motion.span>
      </button>
    </motion.div>
  );
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="h-8 cursor-pointer rounded-full px-3 text-body-sm whitespace-nowrap text-foreground hover:bg-foreground/8">
      {children}
    </button>
  );
}
