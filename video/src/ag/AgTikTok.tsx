import type { ReactNode } from "react";
import { AbsoluteFill, Html5Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/PixelifySans";
import { CLASH, GEIST, INK, INK_SOFT, PAPER, SHADOW, Soundtrack, useEnter, Words } from "../kit";
import { AG_H, AG_W, type AgLook, AgSprite, PixelApple, PixelHeart } from "./AgSprite";
import spots from "../../public/ag/bg/spots.json";

/*
 * Ag, animated frame by frame over still screenshots of the real site (2x,
 * Ag hidden, public/ag/bg). Nothing is recorded live, so nothing can lag:
 * every hop, squash, bubble and sound sits on an exact frame. Ag's look,
 * reactions, bubbles and sounds are the site's own (ag-pet.tsx, pet-sounds.ts).
 * 9:16 for TikTok.
 */

const { fontFamily: PIXEL } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const FPS = 30;
const SITE = "aceguevarra.xyz";
const PX = 5; // CSS px per art pixel, as on the site
const AW = AG_W * PX, AH = AG_H * PX;

type Pt = { x: number; y: number };
// Where Ag stands, in the backdrops' CSS px (feet centre).
const H1: Pt = { x: 900, y: spots.h1.y + 5 };
const CHIPS: Pt = { x: 1060, y: spots.chips.y };
const DIALOG: Pt = { x: 720, y: spots.dialog.y };
const FILM: Pt = { x: spots.film.x + spots.film.w / 2, y: spots.film.y };
const THEME_TOGGLE: Pt = { x: 250, y: 784 };

/* ---------- motion helpers ---------- */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** A jump from a to b, peaking `h` above the higher end. */
function arc(u: number, a: Pt, b: Pt, h = 50): Pt {
  u = clamp(u, 0, 1);
  const peak = Math.min(a.y, b.y) - h;
  const c = 2 * peak - (a.y + b.y) / 2;
  return { x: lerp(a.x, b.x, u), y: (1 - u) ** 2 * a.y + 2 * u * (1 - u) * c + u * u * b.y };
}
/** Falling from above onto `to`, landing at frame `len`. */
const drop = (f: number, len: number, to: Pt): Pt => ({ x: to.x, y: lerp(to.y - 520, to.y, clamp(f / len, 0, 1) ** 2) });

// The site's reaction keyframes (ag-pet.tsx REACTIONS).
type Pose = { sx: number; sy: number; y: number; rot: number };
const REACT: Record<string, { sx?: number[]; sy?: number[]; y?: number[]; rot?: number[]; times?: number[]; dur: number }> = {
  pet: { sy: [1, 0.8, 1.12, 1], sx: [1, 1.12, 0.92, 1], y: [0, 0, -18, 0], times: [0, 0.2, 0.55, 1], dur: 0.6 },
  feed: { sy: [1, 0.9, 1, 0.9, 1, 0.9, 1], sx: [1, 1.06, 1, 1.06, 1, 1.06, 1], dur: 1.1 },
  wave: { rot: [0, -10, 10, -10, 10, 0], y: [0, -8, 0, -8, 0, 0], dur: 0.8 },
  land: { sy: [0.78, 1.06, 1], sx: [1.15, 0.97, 1], dur: 0.3 },
  hic: { y: [0, -12, 0], sy: [1, 1.15, 1], dur: 0.28 },
  startle: { y: [0, -22, 0], sy: [1, 1.2, 1], dur: 0.35 },
  nod: { y: [0, 4, 0], dur: 0.25 },
  yawn: { sy: [1, 1.14, 1.14, 1], sx: [1, 0.94, 0.94, 1], times: [0, 0.35, 0.7, 1], dur: 1.3 },
};

const REST: Pose = { sx: 1, sy: 1, y: 0, rot: 0 };
function react(kind: keyof typeof REACT, f: number): Pose {
  const r = REACT[kind];
  const u = f / (r.dur * FPS);
  if (u < 0 || u > 1) return REST;
  const at = (vals: number[] | undefined, rest: number) => {
    if (!vals) return rest;
    const times = r.times ?? vals.map((_, i) => i / (vals.length - 1));
    return interpolate(u, times, vals);
  };
  return { sx: at(r.sx, 1), sy: at(r.sy, 1), y: at(r.y, 0), rot: at(r.rot, 0) };
}
/** Combine poses: scales multiply, offsets add. */
const pose = (...ps: Pose[]): Pose => ps.reduce((a, b) => ({ sx: a.sx * b.sx, sy: a.sy * b.sy, y: a.y + b.y, rot: a.rot + b.rot }), REST);
const bob = (f: number): Pose => ({ ...REST, y: Math.round(Math.sin((f / (2.4 * FPS)) * 2 * Math.PI) * 1.5) });

/* ---------- one moment of a scene ---------- */

type Bg = "light" | "strip" | "chat" | "projects";
type State = {
  bg: Bg;
  scrollY?: number;
  /** Dark theme reveal, 0..1, as a circle growing from the theme toggle. */
  dark?: number;
  pos: Pt;
  pose: Pose;
  look: AgLook;
  bubble?: { text: string; from: number };
  /** The open menu and its highlighted item (-1: none). */
  menu?: number;
  fx?: ReactNode;
};
const between = (f: number, a: number, b: number) => f >= a && f < b;
const say = (f: number, lines: [from: number, to: number, text: string][]) => {
  const l = lines.find(([a, b]) => between(f, a, b));
  return l ? { text: l[2], from: l[0] } : undefined;
};

/* ---------- effects, in world px relative to Ag's feet ---------- */

function Dust({ t }: { t: number }) {
  if (t < 0 || t > 14) return null;
  const u = t / 14;
  return (
    <>
      {[-1, 1].flatMap((s) => [8, 18].map((d) => (
        <div key={`${s}${d}`} style={{ position: "absolute", left: s * (AW / 2 - 4 + d * u * 1.6) - 3, top: -6 - d * u * 0.4, width: 6, height: 6, background: "#b8bcc3", opacity: 1 - u }} />
      )))}
    </>
  );
}
function Hearts({ t }: { t: number }) {
  if (t < 0 || t > 32) return null;
  return (
    <>
      {[-22, 2, 26].map((dx, i) => {
        const u = clamp((t - i * 3) / 26, 0, 1);
        return <div key={dx} style={{ position: "absolute", left: dx - 10, top: -AH - 10 - u * 46, opacity: u > 0 ? 1 - u ** 2 : 0, transform: `scale(${0.6 + u * 0.5})` }}><PixelHeart px={3} /></div>;
      })}
    </>
  );
}
function Apple({ t }: { t: number }) {
  if (t < 0 || t > 14) return null;
  const u = t / 14;
  return <div style={{ position: "absolute", left: -12, top: lerp(-AH - 120, -AH * 0.45, u ** 2), opacity: u > 0.9 ? 0 : 1 }}><PixelApple px={3} /></div>;
}
function Crumbs({ t }: { t: number }) {
  if (t < 0 || t > 16) return null;
  const u = t / 16;
  return <>{[-1, -0.4, 0.5, 1].map((s) => <div key={s} style={{ position: "absolute", left: s * 26 * u - 2, top: -AH * 0.35 - 14 * u + 30 * u * u, width: 4, height: 4, background: "#d9a441", opacity: 1 - u }} />)}</>;
}
function Air({ v }: { v: number }) {
  if (v < 6) return null;
  return <>{[-14, -8, 8, 14].map((d, i) => (
    <div key={d} style={{ position: "absolute", left: (d < 0 ? -AW / 2 : AW / 2) + d - 1, top: -AH - 10 + ((i * 17) % 30), width: 2, height: 18 + (i % 2) * 14, background: "#9aa0a8", opacity: 0.7 }} />
  ))}</>;
}
function Sparkles({ t }: { t: number }) {
  if (t < 0 || t > 20) return null;
  const u = t / 20;
  return <>{[0, 60, 120, 180, 240, 300].map((a) => {
    const r = 30 + u * 34, rad = (a * Math.PI) / 180;
    return <div key={a} style={{ position: "absolute", left: Math.cos(rad) * r - 4, top: -AH / 2 + Math.sin(rad) * r - 4, width: 8, height: 8, background: "#f2c94c", opacity: 1 - u, clipPath: "polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)" }} />;
  })}</>;
}

/* ---------- the scenes ---------- */

type Scene = { len: number; caption: string; then?: [at: number, caption: string]; state: (f: number) => State; cues: [at: number, sfx: string][] };

const SCENES: Scene[] = [
  {
    len: 100,
    caption: "My portfolio has a pet.",
    state: (f) => {
      const landed = f >= 18;
      return {
        bg: "light",
        pos: landed ? H1 : drop(f, 18, H1),
        pose: pose(landed ? react("land", f - 18) : { ...REST, sy: 1.12, sx: 0.92 }, react("wave", f - 26), f > 52 ? bob(f) : REST),
        look: { eyes: between(f, 26, 52) ? "happy" : "open", blush: between(f, 26, 52) },
        bubble: say(f, [[26, 64, "Hi, I'm Ag!"], [68, 100, "Click me to play."]]),
        fx: <Dust t={f - 18} />,
      };
    },
    cues: [[18, "land"], [26, "chirp"], [26, "wave"], [68, "chirp"]],
  },
  {
    len: 80,
    caption: "It hops on everything.",
    state: (f) => {
      const walk = clamp((f - 34) / 30, 0, 1);
      const pos = f < 6 ? H1 : f < 22 ? arc((f - 6) / 16, H1, CHIPS, 60) : { x: lerp(CHIPS.x, CHIPS.x + 160, walk), y: CHIPS.y };
      const walking = between(f, 34, 64);
      return {
        bg: "light",
        pos,
        pose: pose(f >= 22 ? react("land", f - 22) : between(f, 6, 22) ? { ...REST, sy: 1.08, sx: 0.94 } : REST, f > 64 ? bob(f) : REST),
        look: { lookX: walking ? 1 : 0, foot: walking ? ((Math.floor(f / 4) % 2) as 0 | 1) : 0 },
        fx: <Dust t={f - 22} />,
      };
    },
    cues: [[6, "hop"], [22, "land"], [34, "steps"], [48, "steps"]],
  },
  {
    len: 85,
    caption: "It rides along when you scroll.",
    state: (f) => {
      const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
      const s = (g: number) => 1300 * ease(clamp((g - 8) / 44, 0, 1));
      const scrollY = s(f), v = s(f) - s(f - 1); // px per frame
      return {
        bg: "strip",
        scrollY,
        pos: { x: 1180, y: scrollY + 893 },
        pose: pose({ sx: 1 - Math.min(0.2, v * 0.006), sy: 1 + Math.min(0.32, v * 0.01), y: -Math.min(26, v * 0.8), rot: 0 }, react("land", f - 56)),
        look: { eyes: between(f, 10, 50) ? "happy" : "open", lookY: v > 4 ? -1 : 0 },
        bubble: say(f, [[12, 50, "Wheee!"]]),
        fx: <Air v={v} />,
      };
    },
    cues: [[10, "hop"], [12, "chirp"], [56, "land"]],
  },
  {
    len: 150,
    caption: "Pet it. Feed it.",
    then: [98, "Just not too much."],
    state: (f) => {
      const full = interpolate(f, [100, 106, 110], [0, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const chewing = between(f, 72, 100);
      return {
        bg: "light",
        pos: CHIPS,
        pose: pose(react("pet", f - 18), react("feed", f - 72), react("hic", f - 126), { sx: 1 + 0.2 * full, sy: 1 - 0.08 * full, y: 0, rot: 0 }, bob(f)),
        look: { eyes: between(f, 18, 50) ? "happy" : between(f, 126, 136) ? "shut" : "open", blush: between(f, 18, 50), mouth: chewing ? (Math.floor(f / 3) % 2 ? 0.5 : 1) : 1 },
        menu: between(f, 4, 88) ? (f < 10 ? -1 : f < 50 ? 1 : 2) : undefined,
        bubble: say(f, [[20, 48, "Purr."], [72, 98, "Nom. Tastes like silver."], [102, 124, "So full…"], [126, 150, "*hic*"]]),
        fx: <><Hearts t={f - 18} /><Apple t={f - 58} /><Crumbs t={f - 72} /></>,
      };
    },
    cues: [[18, "pet"], [20, "chirp"], [58, "feed"], [72, "chirp"], [102, "chirp"], [126, "hic"]],
  },
  {
    len: 95,
    caption: "It hates light mode.",
    state: (f) => ({
      bg: "light",
      dark: interpolate(f, [6, 24, 60, 72], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      pos: CHIPS,
      pose: pose(react("yawn", f - 20), react("startle", f - 66), f > 80 ? bob(f) : REST),
      look: { eyes: between(f, 28, 54) ? "shut" : "open", mouth: between(f, 24, 56) ? 2 : 1, shades: f >= 66 },
      bubble: say(f, [[22, 58, "Lights out. *yawn*"], [68, 95, "Too bright!"]]),
    }),
    cues: [[20, "yawn"], [22, "chirp"], [66, "startle"]],
  },
  {
    len: 130,
    caption: "It knows my whole portfolio.",
    state: (f) => {
      const onChat = f < 74;
      const pos = onChat
        ? f < 14 ? drop(f, 14, DIALOG) : f < 66 ? DIALOG : arc((f - 66) / 8, DIALOG, { x: 1050, y: -120 }, 30)
        : f < 92 ? arc((f - 74) / 18, { x: 1250, y: -120 }, FILM, 10) : FILM;
      return {
        bg: onChat ? "chat" : "projects",
        pos,
        pose: pose(react("land", f - 14), react("nod", f - 56), react("land", f - 92), react("wave", f - 94), bob(f)),
        look: between(f, 20, 54) ? { lookX: 1, lookY: -1 } : { eyes: between(f, 56, 72) || f >= 94 ? "happy" : "open", blush: f >= 94 },
        bubble: say(f, [[20, 52, "Hmm, let me think."], [60, 74, "Follow me!"], [94, 130, "Here it is!"]]),
        fx: <><Dust t={f - 14} /><Dust t={f - 92} /><Sparkles t={f - 94} /></>,
      };
    },
    cues: [[14, "land"], [20, "think"], [56, "answer"], [60, "chirp"], [66, "hop"], [92, "land"], [94, "tada"]],
  },
];
const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + SCENES[i - 1].len : 0], []);
const END_AT = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].len;
const END_LEN = 80;
export const AG_TIKTOK_DURATION = END_AT + END_LEN;

/* ---------- drawing ---------- */

const BG: Record<Bg, { src: string; w: number; h: number }> = {
  light: { src: "ag/bg/hero-light.png", w: 1440, h: 900 },
  strip: { src: "ag/bg/strip.png", w: 1440, h: 2700 },
  chat: { src: "ag/bg/chat.png", w: 1440, h: 900 },
  projects: { src: "ag/bg/projects.png", w: 1440, h: 900 },
};
// Ag's pixel window, from globals.css .ag-box.
const BOX = {
  background: "#f4f5f7",
  color: "#141414",
  boxShadow: "0 -3px 0 0 #2a2d33, 0 3px 0 0 #2a2d33, -3px 0 0 0 #2a2d33, 3px 0 0 0 #2a2d33, inset 0 -3px 0 0 #cfd3d8, inset 3px 3px 0 0 #ffffff",
  filter: "drop-shadow(3px 3px 0 rgb(0 0 0 / 0.3))",
  fontFamily: PIXEL,
  fontSize: 14,
  lineHeight: 1.25,
} as const;
const MENU = ["Ask me", "Pet", "Feed", "Mute", "Send away"];

/** A speech bubble; it pops in over two frames like the site's stepped ease. */
function Bubble({ text, age }: { text: string; age: number }) {
  const shown = age >= 2;
  return (
    <div style={{ ...BOX, position: "relative", padding: "6px 10px", whiteSpace: "nowrap", opacity: shown ? 1 : 0, transform: `translateY(${shown ? 0 : 6}px)` }}>
      {text}
      <svg width={15} height={9} shapeRendering="crispEdges" style={{ position: "absolute", top: "100%", left: "50%", marginLeft: -7.5 }}>
        {["XFFFX", ".XFX.", "..X.."].flatMap((row, y) => [...row].map((ch, x) => (ch === "." ? null : <rect key={`${x}-${y}`} x={x * 3} y={y * 3} width={3} height={3} fill={ch === "X" ? "#2a2d33" : "#f4f5f7"} />)))}
      </svg>
    </div>
  );
}
function Menu({ active }: { active: number }) {
  return (
    <div style={{ ...BOX, display: "flex", padding: 3 }}>
      {MENU.map((m, i) => (
        <div key={m} style={{ position: "relative", height: 32, lineHeight: "32px", padding: "0 10px 0 16px", whiteSpace: "nowrap", background: i === active ? "#dfe2e6" : undefined }}>
          {i === active && <div style={{ position: "absolute", left: 3, top: 11, width: 6, height: 10, background: "#2a2d33", clipPath: "polygon(0 0,100% 50%,0 100%)" }} />}
          {m}
        </div>
      ))}
    </div>
  );
}

/** The site with Ag on it, in CSS px. */
function World({ s, f }: { s: State; f: number }) {
  const bg = BG[s.bg];
  const { pos, pose: p } = s;
  return (
    <div style={{ position: "relative", width: bg.w, height: bg.h }}>
      <Img src={staticFile(bg.src)} style={{ position: "absolute", left: 0, top: 0, width: bg.w, height: bg.h }} />
      {!!s.dark && (
        <Img
          src={staticFile("ag/bg/hero-dark.png")}
          style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, clipPath: `circle(${s.dark * 1500}px at ${THEME_TOGGLE.x}px ${THEME_TOGGLE.y}px)` }}
        />
      )}
      <div style={{ position: "absolute", left: pos.x, top: pos.y }}>
        {s.fx}
        {/* bubble over menu, stacked above Ag like the site */}
        <div style={{ position: "absolute", left: 0, bottom: AH + 14 - p.y, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {s.bubble && <Bubble key={s.bubble.text} text={s.bubble.text} age={f - s.bubble.from} />}
          {s.menu !== undefined && <Menu active={s.menu} />}
        </div>
        <div style={{ position: "absolute", left: -AW / 2, top: -AH, width: AW, transformOrigin: "50% 100%", transform: `translateY(${p.y}px) rotate(${p.rot}deg) scale(${p.sx}, ${p.sy})` }}>
          <AgSprite px={PX} {...s.look} />
        </div>
      </div>
    </div>
  );
}

// The footage window, and how far it zooms (screen px per CSS px; the stills are 2x).
const WIN = { x: 40, y: 470, w: 1000, h: 1100 };
const ZOOM = 2;

function SceneView({ scene }: { scene: Scene }) {
  const f = useCurrentFrame();
  const s = scene.state(f);
  // Camera on Ag, with room above for the bubble, eased over the last few frames.
  const bg = BG[s.bg];
  let cx = 0, cy = 0, n = 0;
  for (let k = 0; k < 8; k++) {
    const t = scene.state(Math.max(0, f - k));
    if (t.bg !== s.bg) break;
    cx += t.pos.x; cy += t.pos.y - 80; n++;
  }
  const vw = WIN.w / ZOOM, vh = WIN.h / ZOOM;
  cx = clamp(cx / n, vw / 2, bg.w - vw / 2);
  cy = clamp(cy / n, vh / 2, bg.h - vh / 2);
  const pop = useEnter(0, { damping: 16, stiffness: 200 });
  const switchAt = scene.then?.[0] ?? Infinity;
  const caption = f >= switchAt ? scene.then![1] : scene.caption;
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 190 }}>
        <Sequence key={caption} from={f >= switchAt ? switchAt : 0} layout="none">
          <Words text={caption} stagger={2} style={{ fontSize: 78, color: INK, lineHeight: 1.05 }} />
        </Sequence>
      </div>
      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 40, overflow: "hidden", boxShadow: SHADOW, border: "1px solid #e4e4e2", background: "#fff", transform: `scale(${0.96 + 0.04 * pop})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `scale(${ZOOM}) translate(${-(cx - vw / 2)}px, ${-(cy - vh / 2)}px)` }}>
          <World s={s} f={f} />
        </div>
      </div>
      {scene.cues.map(([at, sfx], i) => (
        <Sequence key={i} from={at} durationInFrames={45} layout="none">
          <Html5Audio src={staticFile(`ag/sfx/${sfx}.wav`)} volume={0.9} />
        </Sequence>
      ))}
    </>
  );
}

/** Pinned for the whole video: where to find Ag. */
function SiteTag() {
  return (
    <div style={{ position: "absolute", top: 80, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: INK, color: "#fff", fontFamily: GEIST, fontWeight: 500, fontSize: 34 }}>
        <span style={{ width: 14, height: 14, borderRadius: 99, background: "#4ade80" }} />
        {SITE}
      </div>
    </div>
  );
}

/** Ag, big, waving, with the address. */
function EndCard() {
  const f = useCurrentFrame();
  const p = useEnter(0, { damping: 13, stiffness: 120 });
  const url = useEnter(16, { damping: 12, stiffness: 160 });
  const w = pose(react("wave", (f - 8) % 40), bob(f));
  const big = 24;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: "absolute", left: 540, top: 1010, transform: `scale(${p})`, transformOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", left: 0, bottom: AG_H * big + 40, transform: "translateX(-50%) scale(3)", transformOrigin: "50% 100%" }}>
          <Bubble text="Come say hi!" age={f - 10} />
        </div>
        <div style={{ position: "absolute", left: (-AG_W * big) / 2, top: -AG_H * big, transformOrigin: "50% 100%", transform: `translateY(${w.y * 4}px) rotate(${w.rot}deg)` }}>
          <AgSprite px={big} eyes="happy" blush />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center" }}>
        <Words text="Meet Ag." style={{ fontSize: 120, color: INK, display: "inline-block" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center", transform: `scale(${0.8 + 0.2 * url})`, opacity: url }}>
        <div style={{ padding: "22px 44px", borderRadius: 999, background: INK, color: "#fff", fontFamily: CLASH, fontWeight: 600, fontSize: 60 }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1430, textAlign: "center", fontFamily: GEIST, fontSize: 32, color: INK_SOFT, opacity: interpolate(f, [26, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Ace Guevarra, full-stack and automation engineer
      </div>
    </AbsoluteFill>
  );
}

export function AgTikTok() {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: CLASH }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={s.len}>
          <SceneView scene={s} />
        </Sequence>
      ))}
      <Sequence from={END_AT} durationInFrames={END_LEN}>
        <EndCard />
        <Sequence from={10} layout="none"><Html5Audio src={staticFile("ag/sfx/wave.wav")} volume={0.9} /></Sequence>
        <Sequence from={10} layout="none"><Html5Audio src={staticFile("ag/sfx/chirp.wav")} volume={0.9} /></Sequence>
      </Sequence>
      <SiteTag />
      {/* Music well under Ag: Ag's sounds are the point. */}
      <Soundtrack dropAt={STARTS[1]} duration={AG_TIKTOK_DURATION} cues={STARTS.slice(1).map((s): [number, string, number] => [s - 4, "whoosh", 0.2])} musicVolume={0.08} />
    </AbsoluteFill>
  );
}
