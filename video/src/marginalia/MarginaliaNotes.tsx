import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { BODONI, Bracket, CAVEAT } from "./MarginaliaDemo";
import { PetSprite, type Face } from "./pet/pet-sprite";
import type { PetLook } from "./pet/pet-art";
import voice from "../../public/marginalia/vo/manifest.json";

/*
 * Marginalia, the study buddy, at full energy. An exam is coming and the notes
 * pile up; Marginalia drops in on the beat with Mochi, its pixel buddy. Notes
 * turn into flashcards, Mochi studies with you and explains what you miss, and
 * practice exams, weak topics and your own music land as a fanned stack.
 * Keywords slam in on frosted glass as the narrator says them. Voice:
 * ElevenLabs (scripts/make-marginalia-voice.mjs), score:
 * scripts/make-marginalia-beat.mjs. Ink colours, like the app.
 * 4:5 for TikTok; 16:9 for Facebook, one full-frame scene.
 */

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

const FG = "#111826", BODY = "#364050", MUTED = "#6c727e", PRIMARY = "#0152cb", BG = "#edf0f9", RED = "#df2224";
const HIGHLIGHT = "#ffe066", GREEN = "#16a34a", AMBER = "#f59e0b", BORDER = "rgba(17,24,38,.1)";
const SITE = "marginalia.aceguevarra.xyz";
const MOCHI: PetLook = { species: "cat", color: "#4d9cff", eyes: "dot", accessory: "glasses" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const WASH = `radial-gradient(60% 45% at 0% 0%, rgba(1,82,203,.18), transparent 70%), radial-gradient(55% 40% at 100% 100%, rgba(77,156,255,.2), transparent 70%), ${BG}`;

/** The app's glass (globals.css `glass bg-glass`), at video scale. */
const GLASS: CSSProperties = {
  background: "rgba(246,248,254,.58)",
  backdropFilter: "blur(14px) saturate(170%)",
  WebkitBackdropFilter: "blur(14px) saturate(170%)",
  border: "1px solid rgba(255,255,255,.75)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 1px rgba(17,24,38,.09), 0 18px 36px -16px rgba(1,40,110,.32)",
};
/** The app's cards (`bg-card` with a ring and a soft shadow). */
const CARD: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  boxShadow: "0 0 0 1px rgba(17,24,38,.08), 0 30px 60px -24px rgba(1,40,110,.35)",
  fontFamily: INTER,
  color: FG,
};

/* ---------- timeline, from the voice-over ---------- */

type Line = { text: string; file: string | null; duration: number; words: { t: string; s: number; e: number }[] };
const VO = voice as Record<string, Line>;
const fr = (s: number) => Math.round(s * 30);
const len = (id: string) => fr(VO[id].duration);
/** Frame, within its line, at which the first word starting with `w` is spoken. */
const at = (id: string, w: string) => {
  const word = VO[id].words.find((x) => x.t.toLowerCase().replace(/[^a-z0-9$-]/g, "").startsWith(w));
  if (!word) throw new Error(`"${w}" not in ${id}`);
  return fr(word.s);
};

// Where each line starts within its scene
const LEAD = { pain: 4, meet: 2, cards: 4, session: 4, exam: 4, cta: 6 } as const;
type Key = keyof typeof LEAD;
const SCENES = (() => {
  const lengths: Record<Key, number> = {
    pain: LEAD.pain + len("pain") + 6,
    meet: LEAD.meet + len("meet") + 14,
    cards: LEAD.cards + len("cards") + 14,
    session: LEAD.session + len("session") + 12,
    exam: LEAD.exam + len("exam") + 10,
    cta: LEAD.cta + len("cta") + 50,
  };
  let t = 0;
  const s = {} as Record<Key, { from: number; len: number }>;
  for (const k of Object.keys(lengths) as Key[]) {
    s[k] = { from: t, len: lengths[k] };
    t += lengths[k];
  }
  return s;
})();
export const MARGINALIA_NOTES_DURATION = SCENES.cta.from + SCENES.cta.len;

const SPOKEN = (Object.keys(LEAD) as Key[]).map((k): [Key, number] => [k, SCENES[k].from + LEAD[k]]);
/** A word's frame in its scene. */
const w = (id: Key, word: string) => LEAD[id] + at(id, word);
/** The music's drop lands as the narrator says "Marginalia". */
const DROP_FRAME = SCENES.meet.from + w("meet", "marginalia");
const MUSIC_DROP = 12.414;

/* ---------- motion helpers ---------- */

/** Decaying shake, `amp` px, starting at `from`. */
const shake = (f: number, from: number, amp = 18, dur = 14) =>
  f < from ? 0 : Math.sin((f - from) * 2.6) * interpolate(f - from, [0, dur], [amp, 0], clamp);
/** A springy punch from 0 that overshoots and settles on 1. */
function usePunch(from: number) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - from, fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
}
/** A calmer spring, for things settling into place. */
function useSettle(from: number) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - from, fps, config: { damping: 15, stiffness: 160 } });
}

/** Everything is laid out in a 1080-wide column, centred in the video. */
const COL_W = 1080;

function Wordmark({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.1, ...style }}>
      <Bracket height={size * 1.23} color={PRIMARY} />
      <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: size, color: FG, lineHeight: 1, paddingBottom: size * 0.09 }}>marginalia</span>
      <Bracket height={size * 1.23} color={PRIMARY} flip />
    </div>
  );
}

function Hand({ p, children, color = PRIMARY, size = 40, style }: { p: number; children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", fontFamily: CAVEAT, fontSize: size, color, whiteSpace: "nowrap", lineHeight: 1.1, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`, ...style }}>
      {children}
    </div>
  );
}

/* ---------- Mochi ---------- */

/**
 * Mochi, the study buddy, in its pixel art. `hop` and `squash` are the frames
 * a reaction starts on: a hop springs it up and lands it with a squash; a
 * squash slumps it (got one wrong). Reading, it bobs over its book.
 */
function Mochi({ size, face = "open", book = false, hop, squash, read = false, style }: { size: number; face?: Face; book?: boolean; hop?: number; squash?: number; read?: boolean; style?: CSSProperties }) {
  const f = useCurrentFrame();
  let y = 0, sx = 1, sy = 1;
  if (hop !== undefined && f >= hop) {
    const t = f - hop;
    y = -Math.max(0, Math.sin((Math.min(t, 12) / 12) * Math.PI)) * size * 0.32;
    const land = interpolate(t, [11, 14, 19], [0, 1, 0], clamp);
    const lift = interpolate(t, [0, 3, 6], [0, 1, 0], clamp);
    sx = 1 + 0.16 * land - 0.08 * lift;
    sy = 1 - 0.18 * land + 0.12 * lift;
  }
  if (squash !== undefined && f >= squash) {
    const p = interpolate(f - squash, [0, 4, 10, 16], [0, 1, 0.6, 0.7], clamp);
    sx *= 1 + 0.14 * p;
    sy *= 1 - 0.16 * p;
  }
  if (read) y += Math.sin(f / 9) * size * 0.02;
  return (
    <div style={{ width: size, height: size * (17 / 16), transform: `translateY(${y}px) scale(${sx}, ${sy})`, transformOrigin: "50% 100%", ...style }}>
      <PetSprite look={MOCHI} face={face} book={book} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/** A speech bubble, as Mochi talks in the app. */
function Bubble({ p, children, style }: { p: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", ...CARD, borderRadius: 24, borderBottomRightRadius: 6, padding: "14px 22px", fontSize: 28, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 14}px) scale(${0.8 + 0.2 * p})`, transformOrigin: "100% 100%", ...style }}>
      {children}
    </div>
  );
}

/** Rings and sparks bursting from a point: the hit on a beat. */
function Burst({ from, x, y, color = PRIMARY, size = 260 }: { from: number; x: number; y: number; color?: string; size?: number }) {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > 24) return null;
  return (
    <>
      {[0, 5].map((d) => {
        const p = interpolate(f - d, [0, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return <div key={d} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: 999, border: `${6 * (1 - p) + 1}px solid ${color}`, opacity: (1 - p) * (f >= d ? 1 : 0), transform: `scale(${0.2 + p})` }} />;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const p = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
        const r = size * 0.35 + p * size * 0.45;
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * r - 4, top: y + Math.sin(a) * r - 14, width: 8, height: 28, borderRadius: 4, background: i % 2 ? HIGHLIGHT : color, opacity: 1 - p, transform: `rotate(${(a * 180) / Math.PI + 90}deg) scaleY(${1 - p * 0.6})` }} />;
      })}
    </>
  );
}

/** Pixel sparkles around a point, like Mochi's in the app. */
function Sparkles({ from, x, y, spread = 160 }: { from: number; x: number; y: number; spread?: number }) {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > 40) return null;
  const spots: [number, number, string][] = [[-1, -0.6, "#f5a524"], [1, -0.8, PRIMARY], [1.1, 0.3, "#f472b6"], [-1.2, 0.4, "#22c55e"]];
  return (
    <>
      {spots.map(([dx, dy, c], i) => {
        const p = interpolate(f - i * 2, [0, 10, 30], [0, 1, 0], clamp);
        const s = 14 + 10 * p;
        return (
          <svg key={i} viewBox="0 0 3 3" shapeRendering="crispEdges" style={{ position: "absolute", left: x + dx * spread - s / 2, top: y + dy * spread - s / 2 - p * 20, width: s * 1.6, height: s * 1.6, opacity: p }}>
            <rect x={1} y={0} width={1} height={3} fill={c} />
            <rect x={0} y={1} width={3} height={1} fill={c} />
          </svg>
        );
      })}
    </>
  );
}

/* ---------- keywords: slammed onto glass as they're said ---------- */

type Kw = { at: number; text: string; kind?: "slam" | "blue" | "red" | "hand" | "mark"; y?: number; tilt?: number; size?: number };

function Keyword({ k, until, h }: { k: Kw; until: number; h: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < k.at - 1 || f > until + 6) return null;
  const inP = spring({ frame: f - k.at, fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  const outP = interpolate(f, [until, until + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const tilt = k.tilt ?? -3;
  const y = k.y ?? h * 0.7;
  const size = k.size ?? 92;
  if (k.kind === "hand") {
    const p = interpolate(f - k.at, [0, 12], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, display: "flex", justifyContent: "center", opacity: 1 - outP, zIndex: 20 }}>
        <div style={{ ...GLASS, background: "rgba(255,255,255,.72)", borderRadius: 26, padding: `${size * 0.1}px ${size * 0.4}px`, transform: `rotate(${tilt}deg) scale(${0.9 + 0.1 * Math.min(1, p * 2)})`, opacity: Math.min(1, p * 4) }}>
          <div style={{ fontFamily: CAVEAT, fontWeight: 600, fontSize: size * 1.3, lineHeight: 1.15, color: PRIMARY, clipPath: `inset(-30% ${(1 - p) * 100}% -30% -5%)`, whiteSpace: "nowrap" }}>{k.text}</div>
        </div>
      </div>
    );
  }
  const color = k.kind === "blue" ? PRIMARY : k.kind === "red" ? RED : FG;
  const sweep = interpolate(f - k.at, [3, 11], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const jolt = k.kind === "red" ? shake(f, k.at, 14, 12) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.75, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 20 }}>
      <div
        style={{
          ...GLASS, background: "rgba(255,255,255,.66)", borderRadius: 26, padding: `${size * 0.16}px ${size * 0.38}px`,
          transform: `translateX(${jolt}px) translateY(${(1 - inP) * 40 + outP * -30}px) rotate(${tilt * inP}deg) scale(${(1.6 - 0.6 * inP) * (1 - 0.25 * outP)})`,
          opacity: Math.min(1, inP * 2) * (1 - outP),
        }}
      >
        <div style={{ position: "relative", fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.045em", color, whiteSpace: "nowrap" }}>
          {k.kind === "mark" && (
            <span style={{ position: "absolute", left: -10, right: -10, top: "18%", bottom: "6%", background: HIGHLIGHT, borderRadius: 8, transform: `scaleX(${sweep})`, transformOrigin: "left" }} />
          )}
          <span style={{ position: "relative" }}>{k.text}</span>
        </div>
      </div>
    </div>
  );
}

function Keywords({ list, h, end }: { list: Kw[]; h: number; end: number }) {
  return (
    <>
      {list.map((k, i) => (
        <Keyword key={i} k={k} h={h} until={Math.min(list[i + 1]?.at ?? end, k.at + 50) - 2} />
      ))}
    </>
  );
}

/** A white flash on a hit. */
const Flash = ({ from }: { from: number }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 1, from + 7], [0, 0.75, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} /> : null;
};

/* ---------- 1. The exam is in three days; the notes pile up ---------- */

const SHEET_W = 700, SHEET_H = 900;
const TOPICS = ["Cell structure", "Membranes", "Enzymes", "Glycolysis", "Krebs cycle", "Electron transport", "Fermentation", "Photosynthesis", "DNA replication", "Transcription", "Translation", "Mitosis", "Meiosis", "Genetics", "Evolution", "Ecology"];
const NOTES = [
  "Enzymes lower the activation energy of a reaction without being used up.",
  "Glycolysis splits one glucose into two pyruvate in the cytoplasm.",
  "Each turn of the Krebs cycle gives off two molecules of carbon dioxide.",
  "Most ATP is made by the electron transport chain in the inner membrane.",
  "Without oxygen, cells fall back on fermentation to regenerate NAD+.",
  "Active transport moves substances against their gradient, using ATP.",
];
const SHEETS = 16;
const sheetAt = (i: number) => 3 + Math.round(i * 3.1);

function NoteSheet({ i }: { i: number }) {
  return (
    <div style={{ width: SHEET_W, height: SHEET_H, background: "#fff", borderRadius: 14, padding: 52, boxShadow: "0 0 0 1px rgba(17,24,38,.08), 0 30px 60px -30px rgba(1,40,110,.35)", fontFamily: INTER, color: BODY, overflow: "hidden" }}>
      <div style={{ fontSize: 22, color: MUTED, marginBottom: 26 }}>Biology notes, page {Math.round((i + 1) * 3.1)}</div>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", color: FG, marginBottom: 22 }}>{TOPICS[i % TOPICS.length]}</div>
      {[0, 1, 2, 3, 4].map((p) => (
        <p key={p} style={{ fontSize: 27, lineHeight: 1.55, margin: "0 0 24px" }}>{NOTES[(i + p) % NOTES.length]}</p>
      ))}
    </div>
  );
}

function Pain({ h }: { h: number }) {
  const f = useCurrentFrame();
  const where = w("pain", "where");
  const landed = Array.from({ length: SHEETS }, (_, i) => i).filter((i) => f >= sheetAt(i)).length;
  const top = h * 0.52 - SHEET_H / 2 + 30;
  // The pile wobbles on "where", and the camera leans in as it grows
  const wobble = shake(f, where, 16, 18);
  const lean = interpolate(f, [0, w("pain", "notes") + 8], [1.08, 1], ease);
  const chip = usePunch(w("pain", "three") - 2);
  const pages = Math.min(50, Math.round((50 * landed) / SHEETS));
  const counter = usePunch(sheetAt(0));
  const counterOut = interpolate(f, [where - 4, where + 2], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${lean}) translateX(${wobble}px)`, transformOrigin: "50% 55%" }}>
        {Array.from({ length: SHEETS }, (_, i) => i)
          .filter((i) => f >= sheetAt(i) - 8 && i >= landed - 6)
          .map((i) => {
            const p = interpolate(f, [sheetAt(i) - 8, sheetAt(i)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
            const rot = ((i * 37) % 17) - 8;
            const dx = ((i * 53) % 60) - 30;
            const settle = f >= sheetAt(i) ? interpolate(f - sheetAt(i), [0, 3, 8], [0, 1, 0], clamp) : 0;
            return (
              <div key={i} style={{ position: "absolute", left: (COL_W - SHEET_W) / 2 + dx, top: top + (1 - p) * -h * 1.1, transform: `rotate(${rot + (1 - p) * 18 * (i % 2 ? 1 : -1)}deg) scale(${1 + 0.03 * settle})`, opacity: Math.min(1, p * 3) }}>
                <NoteSheet i={i} />
              </div>
            );
          })}
      </AbsoluteFill>
      {/* The exam, three days out */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.08, display: "flex", justifyContent: "center", zIndex: 10 }}>
        <div style={{ ...GLASS, background: "rgba(255,255,255,.82)", borderRadius: 30, padding: "18px 34px", display: "flex", alignItems: "center", gap: 22, fontFamily: INTER, opacity: Math.min(1, chip * 2), transform: `scale(${(0.5 + 0.5 * chip) * 1.35}) rotate(${(1 - chip) * -8 - 2}deg) translateX(${shake(f, w("pain", "three"), 12, 12)}px)` }}>
          <div style={{ width: 84, borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 2px rgba(17,24,38,.1)", textAlign: "center", background: "#fff" }}>
            <div style={{ background: RED, color: "#fff", fontSize: 18, fontWeight: 800, padding: "4px 0" }}>EXAM</div>
            <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.2, color: FG }}>3</div>
          </div>
          <div>
            <div style={{ fontSize: 28, color: MUTED, fontWeight: 600 }}>Biology final</div>
            <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: "-0.04em", color: RED, lineHeight: 1 }}>in 3 days</div>
          </div>
        </div>
      </div>
      {/* Pages piling up */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.76, display: "flex", justifyContent: "center", zIndex: 10, opacity: Math.min(1, counter) * counterOut, transform: `scale(${(0.6 + 0.4 * counter) * (f >= w("pain", "fifty") ? 1 + interpolate(f - w("pain", "fifty"), [0, 3, 10], [0, 0.12, 0], clamp) : 1)})` }}>
        <div style={{ ...GLASS, background: "rgba(255,255,255,.75)", borderRadius: 32, padding: "14px 40px", display: "flex", alignItems: "baseline", gap: 16, fontFamily: INTER }}>
          <span style={{ fontSize: 130, fontWeight: 900, letterSpacing: "-0.05em", color: FG, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{pages}</span>
          <span style={{ fontSize: 54, fontWeight: 700, color: MUTED }}>pages of notes</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

const PAIN_KW = (h: number): Kw[] => [{ at: w("pain", "where"), text: "Where do I even start?", kind: "hand", y: h * 0.82, tilt: -4, size: 70 }];

/* ---------- 2. Meet Marginalia, and Mochi: the drop ---------- */

function Meet({ h }: { h: number }) {
  const f = useCurrentFrame();
  const hit = w("meet", "marginalia");
  const frost = interpolate(f, [0, 8], [0, 1], ease);
  const open = usePunch(hit - 2);
  const zoom = interpolate(f, [hit - 2, hit + 3, hit + 40], [1.25, 0.96, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const meet = usePunch(w("meet", "meet") - 2);
  const buddyAt = w("meet", "new") - 2;
  const buddy = usePunch(buddyAt);
  const note = interpolate(f, [w("meet", "study"), w("meet", "buddy") + 10], [0, 1], clamp);
  const size = 132;
  const half = size * 2.45;
  const cy = h * 0.38;
  const petSize = 210;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${frost * 16}px)`, opacity: 1 - frost * 0.3 }}>
        <div style={{ position: "absolute", left: (COL_W - SHEET_W) / 2, top: h * 0.52 - SHEET_H / 2 + 30, transform: "rotate(-3deg)" }}>
          <NoteSheet i={15} />
        </div>
      </div>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", left: 50, right: 50, top: cy - 250, height: 640, borderRadius: 36, ...GLASS, opacity: frost }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - 190, textAlign: "center", fontFamily: INTER, fontWeight: 900, fontSize: 64, letterSpacing: "-0.04em", color: PRIMARY, opacity: Math.min(1, meet), transform: `scale(${0.5 + 0.5 * meet}) rotate(${(1 - meet) * -8}deg)` }}>Meet</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - size * 0.62, height: size * 1.25, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: size, color: FG, lineHeight: 1, paddingBottom: size * 0.09, clipPath: `inset(0 ${(1 - Math.min(1, open)) * 50}% 0 ${(1 - Math.min(1, open)) * 50}%)` }}>marginalia</span>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${-12 - (half + 30) * open - size * 0.25}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} /></div>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${12 + (half + 30) * open}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} flip /></div>
        </div>
        {/* Mochi pops up under the wordmark */}
        <div style={{ position: "absolute", left: COL_W / 2 - petSize / 2 - 120, top: cy + 120, opacity: Math.min(1, buddy * 2), transform: `translateY(${(1 - buddy) * 160}px) scale(${0.4 + 0.6 * buddy})`, transformOrigin: "50% 100%" }}>
          <Mochi size={petSize} face={f >= buddyAt + 6 ? "happy" : "open"} hop={buddyAt + 14} />
        </div>
        <Hand p={note} size={64} style={{ left: COL_W / 2 + 10, top: cy + 230, transform: "rotate(-5deg)" }}>your study buddy</Hand>
        <Sparkles from={buddyAt + 4} x={COL_W / 2 - 120} y={cy + 230} spread={150} />
        <Burst from={hit} x={COL_W / 2} y={cy} size={720} />
      </AbsoluteFill>
      <Flash from={hit} />
    </AbsoluteFill>
  );
}

/* ---------- 3. Notes in, flashcards out ---------- */

const CARD_QS = ["Where does glycolysis happen?", "What does the Krebs cycle release?", "What makes most of the ATP?", "What happens without oxygen?"];

function Flashcard({ q, n, style }: { q: string; n: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 600, height: 360, ...CARD, padding: "28px 34px", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 600, color: MUTED }}>
        <span>Biology</span>
        <span style={{ background: "rgba(17,24,38,.05)", borderRadius: 99, padding: "4px 14px" }}>Card {n}</span>
      </div>
      <div style={{ margin: "auto 0", textAlign: "center", fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{q}</div>
      <div style={{ fontSize: 20, color: MUTED }}>From Lecture 3, respiration.pdf</div>
    </div>
  );
}

function Cards({ h }: { h: number }) {
  const f = useCurrentFrame();
  const drop = w("cards", "drop");
  const made = w("cards", "flashcards") - 2;
  const panel = useSettle(0);
  // The PDF arcs in from the top and lands in the subject
  const fly = interpolate(f, [drop - 2, drop + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const landed = f >= drop + 12;
  const reading = landed && f < made;
  const top = Math.max(140, h * 0.1);
  const panelH = 300;
  const fanTop = top + panelH + (h > 1200 ? 120 : 50);
  return (
    <AbsoluteFill>
      {/* The subject, as in the app */}
      <div style={{ position: "absolute", left: 130, width: 820, top, height: panelH, ...CARD, padding: "34px 40px", opacity: panel, transform: `translateY(${(1 - panel) * 60}px) scale(${1 + interpolate(f, [drop + 12, drop + 15, drop + 22], [0, 0.03, 0], clamp)})` }}>
        <div style={{ fontSize: 36, fontWeight: 700 }}>Biology</div>
        <div style={{ fontSize: 26, color: MUTED, marginTop: 4 }}>Notes</div>
        <div style={{ marginTop: 28, height: 104, borderRadius: 20, border: `2px solid ${landed ? BORDER : "rgba(1,82,203,.35)"}`, borderStyle: landed ? "solid" : "dashed", background: landed ? "#fff" : "rgba(1,82,203,.04)", display: "flex", alignItems: "center", gap: 20, padding: "0 26px" }}>
          {landed ? (
            <>
              <span style={{ width: 62, height: 62, borderRadius: 14, background: RED, color: "#fff", fontSize: 18, fontWeight: 800, display: "grid", placeItems: "center" }}>PDF</span>
              <span style={{ flex: 1, fontSize: 30, fontWeight: 600 }}>Lecture 3, respiration.pdf</span>
              <span style={{ fontSize: 24, fontWeight: 600, color: reading ? MUTED : PRIMARY }}>{reading ? `Reading${".".repeat(1 + (Math.floor(f / 5) % 3))}` : "12 flashcards"}</span>
            </>
          ) : (
            <span style={{ flex: 1, textAlign: "center", fontSize: 26, color: PRIMARY, fontWeight: 600 }}>Drop your notes here</span>
          )}
        </div>
        {/* Mochi, reading along on the corner of the card */}
        <div style={{ position: "absolute", right: 36, top: -112 }}>
          <Mochi size={110} face={f >= made + 4 ? "happy" : "side"} book={f < made + 4} read={f < made + 4} hop={made + 4} />
        </div>
      </div>
      {f < drop + 13 && f >= drop - 2 && (
        <div style={{ position: "absolute", left: interpolate(fly, [0, 1], [700, 330]), top: interpolate(fly, [0, 1], [-140, top + 120]) - Math.sin(fly * Math.PI) * 120, display: "flex", alignItems: "center", gap: 16, padding: "16px 26px", borderRadius: 18, ...GLASS, background: "rgba(255,255,255,.9)", fontFamily: INTER, fontSize: 28, fontWeight: 600, color: FG, whiteSpace: "nowrap", transform: `rotate(${(1 - fly) * 16}deg) scale(${1 - fly * 0.15})` }}>
          <span style={{ padding: "4px 10px", borderRadius: 8, background: RED, color: "#fff", fontSize: 18, fontWeight: 800 }}>PDF</span>
          Lecture 3, respiration.pdf
        </div>
      )}
      {/* The flashcards fan out of it */}
      {CARD_QS.map((q, i) => {
        const p = spring({ frame: f - made - i * 3, fps: 30, config: { damping: 12, stiffness: 170, mass: 0.7 } });
        const spread = [-1.5, -0.5, 0.5, 1.5][i];
        return (
          <Flashcard
            key={q}
            q={q}
            n={i + 1}
            style={{
              left: (COL_W - 600) / 2 + spread * 130 * p,
              top: fanTop + Math.abs(spread) * 26 * p + (1 - p) * -200,
              transform: `rotate(${spread * 7 * p}deg) scale(${0.5 + 0.5 * p})`,
              opacity: Math.min(1, p * 3),
              zIndex: 4 - Math.abs(Math.round(spread)),
            }}
          />
        );
      })}
      <Burst from={made} x={COL_W / 2} y={fanTop + 180} size={560} />
    </AbsoluteFill>
  );
}

const CARDS_KW = (h: number): Kw[] => [
  { at: w("cards", "drop"), text: "Drop in your notes", kind: "slam", y: h * 0.88, tilt: -3, size: 84 },
  { at: w("cards", "make"), text: "Flashcards: done.", kind: "mark", y: h * 0.88, tilt: 3, size: 96 },
];

/* ---------- 4. Study together; it explains what you miss ---------- */

const SESSION_Q = "What does each turn of the Krebs cycle release?";
const EXPLAINED = "Each turn breaks carbon down, so it gives off two CO₂, and loads NADH and FADH₂ with electrons.";

function Session({ h }: { h: number }) {
  const f = useCurrentFrame();
  const enter = useSettle(0);
  const together = w("session", "together");
  const typeFrom = w("session", "get") - 6;
  const wrong = w("session", "wrong");
  const explainAt = w("session", "explains") - 4;
  const typed = "oxygen".slice(0, Math.max(0, Math.floor((f - typeFrom) / 2)));
  const missed = f >= wrong;
  const explaining = f >= explainAt;
  const flip = interpolate(f, [explainAt, explainAt + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const shown = Math.max(0, Math.floor((f - explainAt - 6) * 2.2));
  const seconds = 18 * 60 + 42 - Math.floor(f / 30);
  const ringC = 2 * Math.PI * 22;
  const face: Face = explaining ? "happy" : missed ? "flat" : f >= together ? "side" : "open";
  const line = explaining ? null : missed ? "Not quite. Want me to explain it?" : null;
  const bubble = interpolate(f, [wrong + 2, wrong + 8], [0, 1], clamp) * (1 - interpolate(f, [explainAt + 2, explainAt + 6], [0, 1], clamp));
  const press = f >= explainAt - 3 && f < explainAt + 2;
  const top = h * 0.13;
  const W = 900;
  const x = (COL_W - W) / 2;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: x, top, width: W, ...CARD, overflow: "visible", opacity: enter, transform: `translateY(${(1 - enter) * 80}px) translateX(${shake(f, wrong, 12, 12)}px)` }}>
        {/* The top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 32px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>Biology</div>
            <div style={{ fontSize: 21, color: MUTED }}>Pomodoro, block 1</div>
          </div>
          <div style={{ width: 220, textAlign: "center" }}>
            <div style={{ fontSize: 20, color: MUTED }}>3 of 12</div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(17,24,38,.08)", marginTop: 8 }}>
              <div style={{ width: "25%", height: "100%", borderRadius: 3, background: PRIMARY }} />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={26} cy={26} r={22} fill="none" strokeWidth={5} stroke="rgba(17,24,38,.08)" />
              <circle cx={26} cy={26} r={22} fill="none" strokeWidth={5} strokeLinecap="round" stroke={PRIMARY} strokeDasharray={ringC} strokeDashoffset={ringC * (1 - seconds / 1500)} />
            </svg>
            <span style={{ fontSize: 34, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
          </div>
        </div>

        <div style={{ position: "relative", padding: "150px 60px 46px" }}>
          {/* Mochi perched on the card */}
          <div style={{ position: "absolute", right: 96, top: 42, display: "flex", alignItems: "flex-end", gap: 16, zIndex: 3 }}>
            <Mochi size={110} face={face} book={face === "side"} read={face === "side"} squash={missed && !explaining ? wrong : undefined} hop={explaining ? explainAt : undefined} />
          </div>
          {line && (
            <Bubble p={bubble} style={{ right: 226, top: 30 }}>
              {line}
              <span style={{ background: PRIMARY, color: "#fff", borderRadius: 99, padding: "6px 16px", fontSize: 22, transform: `scale(${press ? 0.88 : 1})` }}>Explain it</span>
            </Bubble>
          )}
          {/* The card, which turns over to the explanation */}
          <div style={{ perspective: 1600 }}>
            <div style={{ position: "relative", height: 300, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 28, border: `1px solid ${BORDER}`, background: "#fff", boxShadow: "0 24px 40px -24px rgba(1,40,110,.3)", padding: "26px 34px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 600, color: MUTED }}>
                  <span>Krebs cycle</span>
                  <span style={{ background: "rgba(17,24,38,.05)", borderRadius: 99, padding: "4px 14px" }}>Weak topic</span>
                </div>
                <div style={{ margin: "auto 0", textAlign: "center", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{SESSION_Q}</div>
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 28, border: "1px solid rgba(1,82,203,.2)", background: "#f2f6fe", padding: "26px 34px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY }}>Here’s the idea</div>
                <div style={{ marginTop: 14, fontSize: 34, lineHeight: 1.4, fontWeight: 500 }}>{EXPLAINED.slice(0, shown)}</div>
                <div style={{ position: "absolute", left: 34, bottom: 22, fontSize: 20, color: MUTED }}>From Lecture 3, respiration.pdf</div>
              </div>
            </div>
          </div>
          {/* Your answer */}
          <div style={{ marginTop: 26, height: 84, borderRadius: 20, border: `2px solid ${missed ? "rgba(223,34,36,.6)" : BORDER}`, display: "flex", alignItems: "center", padding: "0 26px", fontSize: 30, background: "#fff" }}>
            <span style={{ flex: 1, color: typed ? FG : MUTED }}>
              {typed || "Your answer"}
              {!missed && typed && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, verticalAlign: -6, background: PRIMARY }} />}
            </span>
            {missed && <span style={{ fontSize: 24, fontWeight: 700, color: RED }}>Not quite</span>}
          </div>
        </div>
      </div>
      <Burst from={explainAt} x={x + W - 150} y={top + 150} size={300} />
    </AbsoluteFill>
  );
}

const SESSION_KW = (h: number): Kw[] => [
  { at: w("session", "study"), text: "Study together", kind: "blue", y: h * 0.9, tilt: -3, size: 90 },
  { at: w("session", "wrong"), text: "Wrong?", kind: "red", y: h * 0.9, tilt: 4, size: 110 },
  { at: w("session", "explains"), text: "It explains why.", kind: "mark", y: h * 0.9, tilt: -3, size: 96 },
];

/* ---------- 5. Practice exams, weak topics, your own music ---------- */

const EXAM_TOPICS: [string, number, number][] = [["Glycolysis", 4, 4], ["Krebs cycle", 3, 4], ["Electron transport chain", 2, 3], ["Fermentation", 1, 3]];

function ExamCard() {
  const f = useCurrentFrame();
  const p = interpolate(f, [w("exam", "practice"), w("exam", "exams") + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <>
      <div style={{ fontSize: 24, color: MUTED }}>Practice exam: Biology</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(71 * p)}%</span>
        <span style={{ fontSize: 24, color: MUTED, paddingBottom: 10 }}>10 of 14 right in 12:40</span>
      </div>
      <div style={{ marginTop: 30, display: "grid", gap: 22 }}>
        {EXAM_TOPICS.map(([t, r, n], i) => {
          const share = r / n;
          return (
            <div key={t}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25 }}>
                <span style={{ fontWeight: 600 }}>{t}</span>
                <span style={{ color: MUTED }}>{r} of {n}</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "rgba(17,24,38,.08)", marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, width: `${Math.max(3, share * 100 * Math.min(1, Math.max(0, p * 1.4 - i * 0.1)))}%`, background: share >= 0.7 ? GREEN : share >= 0.4 ? AMBER : RED }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function WeakCard() {
  const rows: [string, string, number, string][] = [["Fermentation", "0% right in your last 3 tries", 0.04, RED], ["Electron transport chain", "30% right in your last 10 tries", 0.3, AMBER], ["Krebs cycle", "55% right in your last 9 tries", 0.55, AMBER]];
  return (
    <>
      <div style={{ fontSize: 36, fontWeight: 700 }}>Needs work</div>
      <div style={{ fontSize: 24, color: MUTED, marginTop: 4 }}>Biology</div>
      <div style={{ marginTop: 22, display: "grid" }}>
        {rows.map(([t, s, p, c], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderTop: i ? `1px solid ${BORDER}` : undefined }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 22, color: MUTED, marginTop: 4 }}>{s}</div>
              <div style={{ width: 220, height: 7, borderRadius: 4, background: "rgba(17,24,38,.08)", marginTop: 12 }}>
                <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 4, background: c }} />
              </div>
            </div>
            <span style={{ border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 20px", fontSize: 23, fontWeight: 600 }}>Practice</span>
          </div>
        ))}
      </div>
    </>
  );
}

const TRACKS = ["Rain on a window", "Lo-fi for Biology", "Forest at dawn", "Late night piano"];
function MusicCard() {
  const f = useCurrentFrame();
  const playing = 1;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 36, fontWeight: 700 }}>Rainy focus</span>
        <span style={{ fontSize: 24, color: MUTED }}>{TRACKS.length} songs</span>
      </div>
      <div style={{ marginTop: 22, display: "grid", gap: 6 }}>
        {TRACKS.map((t, i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 20px", borderRadius: 18, fontSize: 28, background: i === playing ? "rgba(1,82,203,.1)" : undefined, color: i === playing ? PRIMARY : FG, fontWeight: i === playing ? 600 : 400 }}>
            <span style={{ width: 24, textAlign: "center", color: i === playing ? PRIMARY : MUTED }}>{i === playing ? "♪" : i + 1}</span>
            <span style={{ flex: 1 }}>{t}</span>
            {i === playing && (
              <span style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 28 }}>
                {[0, 1, 2].map((b) => <span key={b} style={{ width: 6, borderRadius: 3, background: PRIMARY, height: 8 + Math.abs(Math.sin(f / 4 + b * 1.7)) * 20 }} />)}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderRadius: 99, background: FG, color: "#fff", fontSize: 24, fontWeight: 600 }}>
        <span style={{ width: 40, height: 40, borderRadius: 99, background: "#fff", color: FG, display: "grid", placeItems: "center", fontSize: 18 }}>❚❚</span>
        Lo-fi for Biology
        <span style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.25)", marginLeft: 8 }}>
          <span style={{ display: "block", width: `${30 + (f % 300) / 10}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
        </span>
      </div>
    </>
  );
}

const STACK: { word: string; el: () => ReactNode }[] = [
  { word: "practice", el: () => <ExamCard /> },
  { word: "weak", el: () => <WeakCard /> },
  { word: "even", el: () => <MusicCard /> },
];

function Exam({ h }: { h: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardW = 720;
  const top = h * 0.13;
  return (
    <AbsoluteFill>
      {STACK.map((s, i) => {
        const from = w("exam", s.word) - 3;
        const inP = spring({ frame: f - from, fps, config: { damping: 13, stiffness: 190, mass: 0.7 } });
        // How far later cards have pushed this one back into the fan
        const back = STACK.slice(i + 1).reduce((a, n) => a + spring({ frame: f - (w("exam", n.word) - 3), fps, config: { damping: 15, stiffness: 170 } }), 0);
        if (f < from - 1) return null;
        const side = i % 2 ? 1 : -1;
        return (
          <div
            key={s.word}
            style={{
              position: "absolute", left: (COL_W - cardW) / 2, top, width: cardW, minHeight: 640, ...CARD, padding: "40px 46px",
              zIndex: i,
              opacity: Math.min(1, inP * 2),
              transform: `translateX(${(1 - inP) * side * 900 - back * 150}px) translateY(${back * 24}px) rotate(${(1 - inP) * side * 18 - back * 7 + (i === 2 ? 2 : i === 1 ? -2 : 0) * inP}deg) scale(${1 - back * 0.08})`,
              filter: back > 0.3 ? `saturate(${1 - back * 0.4})` : undefined,
            }}
          >
            {s.el()}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

const EXAM_KW = (h: number): Kw[] => [
  { at: w("exam", "practice"), text: "Practice exams", kind: "slam", y: h * 0.9, tilt: -3, size: 92 },
  { at: w("exam", "weak"), text: "Your weak topics", kind: "red", y: h * 0.9, tilt: 3, size: 88 },
  { at: w("exam", "music"), text: "Your own music", kind: "blue", y: h * 0.9, tilt: -3, size: 92 },
];

/* ---------- 6. Try it ---------- */

function Cta({ h }: { h: number }) {
  const f = useCurrentFrame();
  const mark = usePunch(2);
  const pet = usePunch(10);
  const line = usePunch(w("cta", "study") - 2);
  const link = w("cta", "link");
  const arrow = usePunch(link - 2);
  const url = usePunch(link + 6);
  const bob = Math.sin(Math.max(0, f - link) / 4) * 10;
  const pulse = 1 + 0.03 * Math.max(0, Math.sin((f - link) / 5));
  const top = h / 2 - 330;
  return (
    <AbsoluteFill>
      {/* Mochi on top of the wordmark's right bracket */}
      <div style={{ position: "absolute", left: COL_W / 2 + 270, top: top - 132, opacity: Math.min(1, pet * 2), transform: `translateY(${(1 - pet) * -200}px)` }}>
        <Mochi size={120} face="happy" hop={link} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: Math.min(1, mark), transform: `scale(${0.6 + 0.4 * mark})` }}>
        <Wordmark size={128} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 230, textAlign: "center", fontFamily: INTER, fontSize: 66, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: FG, opacity: Math.min(1, line), transform: `scale(${0.6 + 0.4 * line}) rotate(${(1 - line) * -6}deg)` }}>
        Study smarter,
        <br />
        with your own notes.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 410, display: "flex", justifyContent: "center", opacity: Math.min(1, arrow), transform: `translateY(${bob + (1 - arrow) * -40}px)` }}>
        <svg width={70} height={70} viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 510, display: "flex", justifyContent: "center", opacity: Math.min(1, url), transform: `scale(${(0.6 + 0.4 * url) * pulse})` }}>
        <div style={{ padding: "26px 46px", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: 44, boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 20px 40px -16px rgba(1,82,203,.6)" }}>{SITE}</div>
      </div>
      <Sparkles from={link} x={COL_W / 2 + 330} y={top - 70} spread={110} />
      <Burst from={link + 8} x={COL_W / 2} y={top + 560} size={560} />
    </AbsoluteFill>
  );
}

/* ---------- sound ---------- */

type Cue = [frame: number, sfx: string, volume: number];
const M0 = SCENES.meet.from, K0 = SCENES.cards.from, S0 = SCENES.session.from, E0 = SCENES.exam.from, C0 = SCENES.cta.from;
const ticks = (from: number, n: number, every: number): Cue[] => Array.from({ length: n }, (_, i) => [Math.round(from + i * every), `tick${(i % 3) + 1}`, 0.16]);
const CUES: Cue[] = [
  ...[0, 3, 6, 9, 12, 15].map((i): Cue => [sheetAt(i), "paper", 0.3]),
  [w("pain", "three") - 2, "alert", 0.35],
  [w("pain", "fifty"), "pop", 0.35],
  [w("pain", "where"), "pencil", 0.4],
  [M0 - 4, "whoosh", 0.4],
  [M0 + w("meet", "new") - 2, "pop", 0.4],
  [M0 + w("meet", "study"), "pencil", 0.3],
  [K0, "whoosh", 0.3],
  [K0 + w("cards", "drop") - 2, "whoosh", 0.3],
  [K0 + w("cards", "drop") + 12, "paper", 0.5],
  ...CARD_QS.map((_, i): Cue => [K0 + w("cards", "flashcards") - 2 + i * 3, "pop", 0.3]),
  [S0, "whoosh", 0.3],
  ...ticks(S0 + w("session", "get") - 6, 6, 2),
  [S0 + w("session", "wrong"), "alert", 0.4],
  [S0 + w("session", "explains") - 4, "pop", 0.4],
  [S0 + w("session", "explains"), "paper", 0.4],
  ...STACK.map((s): Cue => [E0 + w("exam", s.word) - 3, "whoosh", 0.3]),
  ...STACK.map((s): Cue => [E0 + w("exam", s.word), "paper", 0.45]),
  [C0, "whoosh", 0.35],
  [C0 + w("cta", "link") - 2, "chime", 0.45],
];

/** The voice is on: the music ducks under it. */
const speaking = (f: number) => SPOKEN.some(([id, from]) => f >= from - 3 && f < from + len(id) + 3);

function Sound() {
  const end = MARGINALIA_NOTES_DURATION;
  return (
    <>
      <Html5Audio
        src={staticFile("music/margin-beat.wav")}
        trimBefore={Math.max(0, Math.round((MUSIC_DROP - DROP_FRAME / 30) * 30))}
        volume={(f) => interpolate(f, [0, 6, end - 40, end], [0, 1, 1, 0], clamp) * (speaking(f) ? 0.06 : 0.14)}
      />
      {SPOKEN.map(([id, from]) =>
        VO[id].file ? (
          <Sequence key={id} from={from} durationInFrames={len(id) + 20} layout="none">
            <Html5Audio src={staticFile(VO[id].file!)} />
          </Sequence>
        ) : null,
      )}
      {CUES.map(([from, sfx, volume], i) => (
        <Sequence key={i} from={Math.max(0, from)} durationInFrames={45} layout="none">
          <Html5Audio src={staticFile(`sfx/${sfx}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

/* ---------- the film ---------- */

const SCENE_EL: [Key, (h: number) => ReactNode, ((h: number) => Kw[]) | null][] = [
  ["pain", (h) => <Pain h={h} />, PAIN_KW],
  ["meet", (h) => <Meet h={h} />, null],
  ["cards", (h) => <Cards h={h} />, CARDS_KW],
  ["session", (h) => <Session h={h} />, SESSION_KW],
  ["exam", (h) => <Exam h={h} />, EXAM_KW],
  ["cta", (h) => <Cta h={h} />, null],
];

/** Scenes whip in from the right with a little blur; Meet cuts straight in. */
function Scene({ k, children }: { k: Key; children: ReactNode }) {
  const f = useCurrentFrame();
  if (k === "pain" || k === "meet") return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{children}</AbsoluteFill>;
}

/** `wide`: the 16:9 cut for Facebook, one full-frame scene. */
export function MarginaliaNotes({ wide = false }: { wide?: boolean }) {
  const { width, height: h } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: WASH, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: (width - COL_W) / 2, top: 0, width: COL_W, height: h }}>
        {SCENE_EL.map(([key, el, kws]) => (
          <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].len + (key === "cta" ? 0 : 10)} layout="none">
            <Scene k={key}>
              {el(h)}
              {kws && <Keywords list={kws(h)} h={h} end={SCENES[key].len} />}
            </Scene>
          </Sequence>
        ))}
      </div>
      {wide && <WideEdges />}
      <Sound />
    </AbsoluteFill>
  );
}

/** On 16:9 the column sits in the middle; the wash softens the bare sides. */
function WideEdges() {
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 360, background: `linear-gradient(to right, ${BG}, rgba(237,240,249,0))`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 360, background: `linear-gradient(to left, ${BG}, rgba(237,240,249,0))`, pointerEvents: "none" }} />
    </>
  );
}
