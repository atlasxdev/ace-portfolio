import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { useEnter } from "../kit";
import { BODONI, Bracket, CAVEAT } from "./MarginaliaDemo";
import voice from "../../public/marginalia/vo/manifest.json";

/*
 * Marginalia, told in the margin, at full energy. One document page carries
 * the film: Ctrl+F fails, Marginalia drops in on the beat, and its answers land
 * as frosted notes in the margin, bracketed against the line they came from.
 * Keywords slam in on frosted glass as the narrator says them; the camera
 * punches in on every hit. Voice: ElevenLabs (scripts/make-marginalia-voice.mjs),
 * score: scripts/make-marginalia-beat.mjs. Ink colours, like the app.
 * 4:5 for TikTok; 16:9 for Facebook, one full-frame scene.
 */

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

const FG = "#111826", BODY = "#364050", MUTED = "#6c727e", PRIMARY = "#0152cb", BG = "#edf0f9", RED = "#df2224";
const HIGHLIGHT = "#ffe066", GRAPHITE = "#3d4452";
const SITE = "marginalia.aceguevarra.xyz";
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
const LEAD = { pain: 4, meet: 2, ask: 4, uses: 4, honest: 4, cta: 8 } as const;
const SEARCH_AT = LEAD.pain + len("pain") + 4;
const SCENES = (() => {
  const lengths = {
    pain: SEARCH_AT + len("search") + 4,
    meet: LEAD.meet + len("meet") + 26,
    ask: LEAD.ask + len("ask") + 12,
    uses: LEAD.uses + len("uses") + 14,
    honest: LEAD.honest + len("honest") + 14,
    cta: LEAD.cta + len("cta") + 70,
  };
  let t = 0;
  const s = {} as Record<keyof typeof lengths, { from: number; len: number }>;
  for (const k of Object.keys(lengths) as (keyof typeof lengths)[]) {
    s[k] = { from: t, len: lengths[k] };
    t += lengths[k];
  }
  return s;
})();
export const MARGINALIA_NOTES_DURATION = SCENES.cta.from + SCENES.cta.len;

const SPOKEN: [id: string, from: number][] = [
  ["pain", LEAD.pain],
  ["search", SEARCH_AT],
  ["meet", SCENES.meet.from + LEAD.meet],
  ["ask", SCENES.ask.from + LEAD.ask],
  ["uses", SCENES.uses.from + LEAD.uses],
  ["honest", SCENES.honest.from + LEAD.honest],
  ["cta", SCENES.cta.from + LEAD.cta],
];
/** A word's frame in its scene (pain and search share the first scene). */
const w = (id: keyof typeof LEAD | "search", word: string) => (id === "search" ? SEARCH_AT : LEAD[id]) + at(id, word);
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

/** Everything is laid out in a 1080-wide column, centred in the video. */
const COL_W = 1080;

/* ---------- the page ---------- */

const SHEET = { x: 40, w: 1000, pad: 60, col: 500 } as const;

function Sheet({ top, children, style }: { top: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", left: SHEET.x, top, width: SHEET.w, minHeight: 1400, background: "#fff", borderRadius: 12, boxShadow: "0 0 0 1px rgba(17,24,38,.08), 0 30px 60px -30px rgba(1,40,110,.3)", padding: SHEET.pad, fontFamily: INTER, color: BODY, ...style }}>
      <div style={{ width: SHEET.col }}>{children}</div>
    </div>
  );
}
const Meta = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 23, color: MUTED, marginBottom: 30 }}>{children}</div>;
const H = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", color: FG, marginBottom: 24 }}>{children}</div>;
const P = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <p style={{ position: "relative", fontSize: 29, lineHeight: 1.6, margin: "0 0 30px", ...style }}>{children}</p>;

const marked = (p: number): CSSProperties => ({
  backgroundImage: `linear-gradient(${HIGHLIGHT}, ${HIGHLIGHT})`, backgroundRepeat: "no-repeat", backgroundSize: `${p * 100}% 100%`,
  WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", borderRadius: 5, padding: "1px 3px", color: p > 0 ? FG : undefined,
});

function MarginBracket({ p }: { p: number }) {
  return (
    <div style={{ position: "absolute", left: -38, top: 4, bottom: 4, width: 22, transform: `scaleY(${p})`, transformOrigin: "top" }}>
      <svg viewBox="0 0 20 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <path d="M16 3c-5 .5-9 0-11.5.8C3.4 20 4.6 50 3.6 70c-.3 9 .6 18 .2 26 3.6.8 8 .2 12.2.6l.4-5c-2.6-.4-5.2 0-7.6-.4.5-8-.3-17 .1-25 .6-19-.3-42 .4-58 2.4-.4 5 .1 7.2-.3z" fill={PRIMARY} />
      </svg>
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

function Circled({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span style={{ position: "relative", whiteSpace: "nowrap" }}>
      {children}
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{ position: "absolute", left: -14, top: -8, width: "calc(100% + 28px)", height: "calc(100% + 16px)", overflow: "visible" }}>
        <path d="M18 34C10 14 70 4 120 6s82 12 72 30-70 22-118 20S4 44 22 20" fill="none" stroke={RED} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </span>
  );
}

type Tok = { t: string; b?: boolean; cite?: boolean };
function tokens(s: string): Tok[] {
  let bold = false;
  return s.split(" ").map((x) => {
    if (x === "[1]") return { t: "1", cite: true };
    const open = x.startsWith("**");
    if (open) bold = true;
    const tok = { t: x.replaceAll("**", ""), b: bold };
    if (x.endsWith("**") && (!open || x.length > 4)) bold = false;
    return tok;
  });
}

function Note({ q, a, enter, shown = Infinity, cited = false, source, style }: { q: string; a: string; enter: number; shown?: number; cited?: boolean; source?: string; style?: CSSProperties }) {
  const toks = tokens(a);
  return (
    <div style={{ position: "absolute", left: SHEET.col - 30, width: 440, borderRadius: 18, padding: "20px 26px 22px", ...GLASS, fontFamily: INTER, opacity: Math.min(1, enter * 1.5), transform: `translateX(${(1 - enter) * 120}px) rotate(${(1 - enter) * 6}deg) scale(${0.85 + 0.15 * enter})`, transformOrigin: "0 0", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 10 }}>
        <Bracket height={28} color={PRIMARY} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 24, color: FG, lineHeight: 1, paddingBottom: 2 }}>marginalia</span>
        <Bracket height={28} color={PRIMARY} flip />
      </div>
      <div style={{ fontSize: 23, color: MUTED, marginBottom: 8, lineHeight: 1.35 }}>{q}</div>
      <div style={{ fontSize: 30, lineHeight: 1.4, color: FG }}>
        {toks.slice(0, shown).map((tok, i) =>
          tok.cite ? (
            <span key={i} style={{ display: "inline-grid", placeItems: "center", minWidth: 32, height: 32, padding: "0 8px", borderRadius: 99, fontSize: 18, fontWeight: 600, verticalAlign: 3, color: cited ? FG : MUTED, background: cited ? HIGHLIGHT : "#e7effc", transform: cited ? "scale(1.15)" : undefined }}>1</span>
          ) : (
            <span key={i} style={{ fontWeight: tok.b ? 600 : 400 }}>{tok.t} </span>
          ),
        )}
      </div>
      {source && <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(17,24,38,.08)", fontSize: 20, color: MUTED }}>{source}</div>}
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
      <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, display: "flex", justifyContent: "center", opacity: 1 - outP }}>
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
    <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.75, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
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
        <Keyword key={i} k={k} h={h} until={Math.min(list[i + 1]?.at ?? end, k.at + 46) - 2} />
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

/* ---------- 1. Buried in a 40-page PDF; Ctrl+F fails ---------- */

const PAGE_H = 1400, PITCH = PAGE_H + 26, TARGET = 30;
const TITLES = ["Welcome", "Who we are", "Working hours", "Remote work", "Payroll", "Benefits", "Health cover", "Time off", "Expenses", "Travel", "Equipment", "IT and security", "Code of conduct", "Reviews"];
const FILLER = [
  "Employees are expected to read this handbook in full and to follow the policies it describes.",
  "Requests go through the HR portal, where your manager reviews them.",
  "Where local law differs from this policy, the law of the country you work in applies.",
  "Questions about any section can go to your People Partner at any time.",
  "Changes to this policy are announced by email and take effect on the first of the month.",
  "Part-time employees receive these benefits on a pro-rata basis.",
  "Exceptions need written approval from your manager and the People team.",
];
function FillerPage({ n }: { n: number }) {
  const ch = Math.floor(n / 3) + 1;
  return (
    <Sheet top={n * PITCH}>
      <Meta>Employee handbook, page {n + 1}</Meta>
      <H>{ch}.{(n % 3) + 1} {TITLES[(ch - 1) % TITLES.length]}</H>
      {[0, 1, 2, 3, 4].map((p) => <P key={p}>{[0, 1].map((s) => FILLER[(n * 5 + p * 2 + s) % FILLER.length]).join(" ")}</P>)}
    </Sheet>
  );
}

function LeavePage({ top, circle = 0, mark = 0, bracket = 0, children }: { top: number; circle?: number; mark?: number; bracket?: number; children?: ReactNode }) {
  return (
    <Sheet top={top}>
      <Meta>Employee handbook, page 31</Meta>
      <H>8.3 Annual leave</H>
      <P>Full-time employees receive 15 days of paid annual leave a year, credited monthly.</P>
      <P>
        <span style={marked(mark)}>
          Up to 5 unused days {circle > 0 ? <Circled p={circle}>roll over</Circled> : "roll over"} to the next year. Anything above that is forfeited on 31 December.
        </span>
        <MarginBracket p={bracket} />
        {children}
      </P>
      <P>Leave requests should be made at least 10 working days in advance.</P>
      <P>Unpaid leave can be agreed with your manager for up to three months.</P>
      <P>{FILLER[2]} {FILLER[4]}</P>
    </Sheet>
  );
}

function Pain({ h }: { h: number }) {
  const f = useCurrentFrame();
  const stop = w("search", "carry") - 6;
  const scrollAt = (x: number) => interpolate(x, [0, stop], [0, TARGET * PITCH - 40], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  const y = scrollAt(f);
  const v = Math.abs(y - scrollAt(f - 1));
  const page = Math.min(40, Math.floor((y + 500) / PITCH) + 1);
  const first = Math.max(0, Math.floor(y / PITCH) - 1);

  const open = useEnter(w("search", "ctrl") - 2, { damping: 14, stiffness: 220 });
  const typeFrom = w("search", "carry") - 2;
  const failAt = w("search", "zero");
  const query = "carry over".slice(0, Math.max(0, Math.floor((f - typeFrom) / 1.5)));
  const failed = f >= failAt;
  const circle = interpolate(f, [w("search", "roll") - 2, w("search", "roll") + 12], [0, 1], clamp);
  // Camera: jolts on "zero", pushes in on "roll over"
  const push = interpolate(f, [w("search", "because"), w("search", "roll") + 6], [1, 1.35], ease);
  const camShake = shake(f, failAt, 22, 16);
  // The page counter is the hero while it scrolls
  const counter = useEnter(w("pain", "buried") - 4, { damping: 13, stiffness: 180 });
  const counterOut = interpolate(f, [stop - 4, stop + 6], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${camShake}px) scale(${push})`, transformOrigin: "33% 40%" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 30 - y, filter: `blur(${Math.min(8, v * 0.014)}px)` }}>
          {Array.from({ length: 4 }, (_, i) => first + i).filter((n) => n <= TARGET).map((n) =>
            n === TARGET ? <LeavePage key={n} top={n * PITCH} circle={circle} /> : <FillerPage key={n} n={n} />,
          )}
        </div>
      </AbsoluteFill>
      {/* Page counter racing up */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, display: "flex", justifyContent: "center", opacity: counter * counterOut, transform: `scale(${0.6 + 0.4 * counter})` }}>
        <div style={{ ...GLASS, background: "rgba(255,255,255,.7)", borderRadius: 32, padding: "18px 44px", display: "flex", alignItems: "baseline", gap: 18, fontFamily: INTER }}>
          <span style={{ fontSize: 150, fontWeight: 900, letterSpacing: "-0.05em", color: FG, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{page}</span>
          <span style={{ fontSize: 60, fontWeight: 700, color: MUTED }}>/ 40</span>
        </div>
      </div>
      {/* Find in page */}
      <div style={{ position: "absolute", left: 200, top: 46, width: 680, height: 96, borderRadius: 18, ...GLASS, background: "rgba(255,255,255,.8)", border: `3px solid ${failed ? RED : PRIMARY}`, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", fontFamily: INTER, fontSize: 38, opacity: open, transform: `translateY(${(1 - open) * -60}px) translateX(${shake(f, failAt, 16, 12)}px) scale(${0.8 + 0.2 * open})` }}>
        <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round"><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5 21 21" /></svg>
        <span style={{ flex: 1, color: FG, fontWeight: 500 }}>
          {query}
          {!failed && <span style={{ display: "inline-block", width: 3, height: 40, marginLeft: 2, verticalAlign: -6, background: PRIMARY, opacity: Math.floor(f / 6) % 2 ? 0 : 1 }} />}
        </span>
        <span style={{ fontSize: 30, fontWeight: 700, color: RED }}>{failed ? "0 results" : ""}</span>
      </div>
      <Flash from={failAt} />
    </AbsoluteFill>
  );
}

const PAIN_KW = (h: number): Kw[] => [
  { at: w("pain", "buried"), text: "Buried.", kind: "slam", y: h * 0.62, tilt: -4 },
  { at: w("pain", "forty"), text: "40-page PDF", kind: "mark", y: h * 0.62, tilt: 2 },
  { at: w("search", "zero"), text: "0 results", kind: "red", y: h * 0.62, size: 120, tilt: -5 },
  { at: w("search", "roll"), text: "it says “roll over”", kind: "hand", y: h * 0.78, tilt: -4 },
  { at: w("search", "ugh"), text: "Ugh.", kind: "slam", y: h * 0.62, size: 130, tilt: 6 },
];

/* ---------- 2. Meet Marginalia: the drop ---------- */

function Meet({ h }: { h: number }) {
  const f = useCurrentFrame();
  const hit = w("meet", "marginalia");
  const frost = interpolate(f, [0, 8], [0, 1], ease);
  const open = usePunch(hit - 2);
  const note = interpolate(f, [hit + 10, hit + 24], [0, 1], clamp);
  const zoom = interpolate(f, [hit - 2, hit + 3, hit + 40], [1.25, 0.96, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const meet = usePunch(w("meet", "meet") - 2);
  const size = 132;
  const half = size * 2.45;
  const cy = h * 0.42;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${frost * 16}px)`, opacity: 1 - frost * 0.3 }}>
        <LeavePage top={30} circle={1} />
      </div>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", left: 50, right: 50, top: cy - 260, height: 520, borderRadius: 36, ...GLASS, opacity: frost }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - 200, textAlign: "center", fontFamily: INTER, fontWeight: 900, fontSize: 64, letterSpacing: "-0.04em", color: PRIMARY, opacity: Math.min(1, meet), transform: `scale(${0.5 + 0.5 * meet}) rotate(${(1 - meet) * -8}deg)` }}>Meet</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - size * 0.62, height: size * 1.25, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: size, color: FG, lineHeight: 1, paddingBottom: size * 0.09, clipPath: `inset(0 ${(1 - Math.min(1, open)) * 50}% 0 ${(1 - Math.min(1, open)) * 50}%)` }}>marginalia</span>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${-12 - (half + 30) * open - size * 0.25}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} /></div>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${12 + (half + 30) * open}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} flip /></div>
        </div>
        <Hand p={note} size={60} style={{ left: "50%", marginLeft: -30, top: cy + size * 0.62, transform: "rotate(-4deg)" }}>notes in the margin</Hand>
        <Burst from={hit} x={COL_W / 2} y={cy} size={720} />
      </AbsoluteFill>
      <Flash from={hit} />
    </AbsoluteFill>
  );
}

/* ---------- 3. Drop in files, ask, boom ---------- */

const ASK_Q = "Does unused leave carry over?";
const ASK_A = "Yes. Up to **5 unused days** roll over to next year. [1]";
const FILES: [string, string, string][] = [["PDF", RED, "Employee handbook.pdf"], ["DOC", PRIMARY, "Benefits guide.docx"], ["MD", MUTED, "Onboarding notes.md"]];

function FileChip({ i, from, h }: { i: number; from: number; h: number }) {
  const f = useCurrentFrame() - from - i * 4;
  if (f < 0 || f > 34) return null;
  const p = interpolate(f, [0, 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const x = interpolate(p, [0, 1], [60 + i * 300, 400]);
  const y = interpolate(p, [0, 1], [-120, h * 0.45]) - Math.sin(p * Math.PI) * 140;
  const [tag, color, name] = FILES[i];
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 16, ...GLASS, background: "rgba(255,255,255,.85)", fontFamily: INTER, fontSize: 26, fontWeight: 600, color: FG, whiteSpace: "nowrap", opacity: 1 - interpolate(f, [24, 34], [0, 1], clamp), transform: `rotate(${(1 - p) * (i - 1) * 14}deg) scale(${1 - p * 0.4})` }}>
      <span style={{ padding: "4px 10px", borderRadius: 8, background: color, color: "#fff", fontSize: 18, fontWeight: 800 }}>{tag}</span>
      {name}
    </div>
  );
}

function Ask({ h }: { h: number }) {
  const f = useCurrentFrame();
  const drop = w("ask", "drop");
  const typeFrom = w("ask", "ask") - 6, rate = 1.6;
  const boom = w("ask", "boom");
  const sendAt = boom - 3;
  const typed = ASK_Q.slice(0, Math.max(0, Math.floor((f - typeFrom) * rate)));
  const sent = f >= sendAt;
  const enter = usePunch(boom);
  const shown = Math.max(0, Math.floor((f - boom - 2) / 1.3));
  const bracket = interpolate(f, [w("ask", "margin") - 2, w("ask", "margin") + 8], [0, 1], clamp);
  const mark = interpolate(f, [w("ask", "exact"), w("ask", "exact") + 12], [0, 1], ease);
  const cited = f >= w("ask", "line");
  const hand = interpolate(f, [w("ask", "came"), w("ask", "came") + 16], [0, 1], clamp);
  const press = f >= sendAt - 3 && f < sendAt + 3;
  // Camera: punch in on the note at "boom", swing to the passage at "exact"
  const toNote = interpolate(f, [boom - 2, boom + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const toLine = interpolate(f, [w("ask", "exact") - 4, w("ask", "exact") + 10], [0, 1], ease);
  const scale = 1 + 0.18 * toNote - 0.08 * toLine;
  const ox = interpolate(toLine, [0, 1], [64, 45]);
  const composer = useEnter(w("ask", "ask") - 10, { damping: 14, stiffness: 180 });
  const composerOut = interpolate(f, [boom + 2, boom + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${shake(f, boom, 10, 10)}px)`, transformOrigin: `${ox}% 36%` }}>
        <LeavePage top={30} mark={mark} bracket={bracket}>
          <Note q={ASK_Q} a={ASK_A} enter={enter} shown={shown} cited={cited} source="Employee handbook, page 31" style={{ top: -40 }} />
          <Hand p={hand} size={48} style={{ left: SHEET.col - 20, top: 380, transform: "rotate(-4deg)" }}>“roll over” = “carry over” ✓</Hand>
        </LeavePage>
      </AbsoluteFill>
      {FILES.map((_, i) => <FileChip key={i} i={i} from={drop} h={h} />)}
      <div style={{ position: "absolute", left: 70, right: 70, top: h - 190, height: 110, borderRadius: 24, ...GLASS, display: "flex", alignItems: "center", padding: "0 16px 0 34px", fontFamily: INTER, fontSize: 36, opacity: composer * (1 - composerOut), transform: `translateY(${(1 - composer) * 120 + composerOut * 60}px)` }}>
        <span style={{ flex: 1, color: !sent && typed ? FG : MUTED }}>
          {!sent && typed ? typed : "Ask about your documents"}
          {!sent && typed && <span style={{ display: "inline-block", width: 3, height: 38, marginLeft: 2, verticalAlign: -6, background: PRIMARY }} />}
        </span>
        <div style={{ width: 78, height: 78, borderRadius: 16, background: PRIMARY, display: "grid", placeItems: "center", transform: `scale(${press ? 0.85 : 1})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.1)" }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </div>
      </div>
      <Burst from={sendAt} x={COL_W - 125} y={h - 135} size={200} />
      <Flash from={boom} />
    </AbsoluteFill>
  );
}

const ASK_KW = (h: number): Kw[] => [
  { at: w("ask", "drop"), text: "Drop in your files", kind: "slam", y: h * 0.2, tilt: -3, size: 80 },
  { at: w("ask", "normal"), text: "Ask like a normal person", kind: "blue", y: h * 0.2, tilt: 2, size: 70 },
  { at: w("ask", "boom"), text: "Boom.", kind: "mark", y: h * 0.72, tilt: -6, size: 150 },
  { at: w("ask", "margin") - 2, text: "right in the margin", kind: "hand", y: h * 0.72, tilt: -3 },
  { at: w("ask", "exact"), text: "+ the exact line", kind: "mark", y: h * 0.72, tilt: 3, size: 84 },
];

/* ---------- 4. Lecture notes, your lease, work docs, anything ---------- */

const USES = [
  { word: "lecture", meta: "ECON 101, lecture 4", h: "Why prices rise", before: "Prices rise when demand outpaces what an economy can produce.", target: "Inflation is mostly too much money chasing too few goods.", q: "What causes inflation?", a: "Too much **money chasing too few goods.** [1]", tilt: -5 },
  { word: "lease", meta: "Lease agreement, page 6", h: "12. Pets", before: "The tenant keeps the property clean and free of damage.", target: "Pets are allowed with the landlord's written permission and a $300 deposit.", q: "Can I have a cat?", a: "Yes, with **written permission** and a $300 deposit. [1]", tilt: 4 },
  { word: "work", meta: "IT onboarding, page 2", h: "Your first week", before: "Your laptop arrives set up, with your accounts ready.", target: "Install the GlobalProtect VPN from the Self Service app on day one.", q: "Which VPN do I set up?", a: "**GlobalProtect,** from the Self Service app. [1]", tilt: -3 },
];
function UseSheet({ i, from }: { i: number; from: number }) {
  const f = useCurrentFrame() - from;
  const u = USES[i];
  const land = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const mark = interpolate(f, [5, 13], [0, 1], ease);
  const bracket = interpolate(f, [6, 13], [0, 1], clamp);
  const enter = usePunch(from + 7);
  if (f < 0) return null;
  const side = i % 2 ? 1 : -1;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${(1 - land) * side * 1200}px, ${(1 - land) * 200}px) rotate(${u.tilt * (0.4 + 0.6 * land) - (1 - land) * side * 20}deg)`, transformOrigin: "50% 40%" }}>
      <Sheet top={70 + i * 20}>
        <Meta>{u.meta}</Meta>
        <H>{u.h}</H>
        <P>{u.before}</P>
        <P>
          <span style={marked(mark)}>{u.target}</span>
          <MarginBracket p={bracket} />
          <Note q={u.q} a={u.a} enter={enter} cited={f > 16} style={{ top: -30 }} />
        </P>
        <P>{FILLER[(i * 3) % FILLER.length]} {FILLER[(i * 3 + 1) % FILLER.length]}</P>
      </Sheet>
    </div>
  );
}
function Uses({ h }: { h: number }) {
  const f = useCurrentFrame();
  const hits = USES.map((u) => w("uses", u.word) - 3);
  const bump = hits.reduce((a, t) => a + (f >= t ? interpolate(f - t, [0, 3, 12], [0, 0.04, 0], clamp) : 0), 0);
  const any = w("uses", "anything");
  const pull = interpolate(f, [any - 3, any + 10], [1, 0.82], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${(1 + bump) * pull})`, transformOrigin: "50% 45%" }}>
        {USES.map((u, i) => <UseSheet key={i} i={i} from={hits[i]} />)}
      </AbsoluteFill>
      <Burst from={any} x={COL_W / 2} y={h * 0.7} size={600} />
    </AbsoluteFill>
  );
}
const USES_KW = (h: number): Kw[] => [
  { at: w("uses", "lecture") - 1, text: "Lecture notes", kind: "slam", y: h * 0.8, tilt: -4, size: 96 },
  { at: w("uses", "lease") - 1, text: "Your lease", kind: "blue", y: h * 0.8, tilt: 3, size: 96 },
  { at: w("uses", "work") - 1, text: "Work docs", kind: "slam", y: h * 0.8, tilt: -2, size: 96 },
  { at: w("uses", "anything"), text: "Anything.", kind: "mark", y: h * 0.7, tilt: -5, size: 140 },
];

/* ---------- 5. Not in there? It tells you ---------- */

function Honest() {
  const f = useCurrentFrame();
  const enter = usePunch(w("honest", "tells") - 4);
  const fake = interpolate(f, [w("honest", "no") - 2, w("honest", "no") + 4], [0, 1], clamp);
  const strike = interpolate(f, [w("honest", "made-up"), w("honest", "made-up") + 8], [0, 1], clamp);
  const zoom = interpolate(f, [w("honest", "tells") - 4, w("honest", "tells") + 8], [1, 1.1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "65% 25%" }}>
        <Sheet top={60}>
          <Meta>Employee handbook, page 33</Meta>
          <H>8.5 Sick leave</H>
          <P>
            Tell your manager before your usual start time if you're unwell and can't work.
            <Note q="What's the parental leave policy?" a="I couldn't find that in your documents." enter={enter} source="No sources" style={{ top: -30 }} />
          </P>
          <P>For absences longer than three days, a doctor's note is needed.</P>
          <P>Sick days don't count against your annual leave.</P>
          <P>{FILLER[1]} {FILLER[3]}</P>
          <P>{FILLER[5]} {FILLER[6]}</P>
        </Sheet>
        {/* The kind of answer a chatbot makes up, struck out */}
        <div style={{ position: "absolute", left: SHEET.x + SHEET.pad + SHEET.col - 20, top: 470, width: 420, opacity: fake, transform: `rotate(-3deg) scale(${0.9 + 0.1 * fake})` }}>
          <div style={{ position: "relative", display: "inline-block", fontFamily: CAVEAT, fontSize: 44, color: GRAPHITE, lineHeight: 1.1 }}>
            “16 weeks, fully paid”
            <div style={{ position: "absolute", left: -8, right: -8, top: "52%", height: 6, borderRadius: 3, background: RED, transform: `scaleX(${strike}) rotate(-2deg)`, transformOrigin: "left" }} />
          </div>
          <div style={{ fontFamily: CAVEAT, fontSize: 32, color: RED, opacity: strike, marginTop: 4 }}>made up. not in your files.</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
const HONEST_KW = (h: number): Kw[] => [
  { at: w("honest", "not"), text: "Not in there?", kind: "slam", y: h * 0.72, tilt: -3, size: 100 },
  { at: w("honest", "tells"), text: "It tells you.", kind: "blue", y: h * 0.72, tilt: 3, size: 100 },
  { at: w("honest", "made-up"), text: "No made-up answers", kind: "red", y: h * 0.82, tilt: -2, size: 76 },
];

/* ---------- 6. Try it ---------- */

function Cta({ h }: { h: number }) {
  const f = useCurrentFrame();
  const mark = usePunch(2);
  const note = interpolate(f, [16, 30], [0, 1], clamp);
  const line = usePunch(w("cta", "try") - 2);
  const arrow = usePunch(w("cta", "link") - 2);
  const url = usePunch(w("cta", "link") + 6);
  const credit = useEnter(w("cta", "link") + 22);
  const bob = Math.sin(Math.max(0, f - w("cta", "link")) / 4) * 10;
  const pulse = 1 + 0.03 * Math.max(0, Math.sin((f - w("cta", "link")) / 5));
  const top = h / 2 - 380;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: Math.min(1, mark), transform: `scale(${0.6 + 0.4 * mark})` }}>
        <Bracket height={160} color={PRIMARY} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 128, color: FG, lineHeight: 1, paddingBottom: 12 }}>marginalia</span>
        <Bracket height={160} color={PRIMARY} flip />
      </div>
      <Hand p={note} size={56} style={{ left: 500, top: top + 170, transform: "rotate(-4deg)" }}>notes in the margin</Hand>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 320, textAlign: "center", fontFamily: INTER, fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", color: FG, opacity: Math.min(1, line), transform: `scale(${0.6 + 0.4 * line}) rotate(${(1 - line) * -6}deg)` }}>
        Try it with your own docs.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 540, display: "flex", justifyContent: "center", opacity: Math.min(1, url), transform: `scale(${(0.6 + 0.4 * url) * pulse})` }}>
        <div style={{ padding: "26px 46px", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: 44, boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 20px 40px -16px rgba(1,82,203,.6)" }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 430, display: "flex", justifyContent: "center", opacity: Math.min(1, arrow), transform: `translateY(${bob + (1 - arrow) * -40}px)` }}>
        <svg width={70} height={70} viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 720, textAlign: "center", fontFamily: INTER, fontSize: 28, color: MUTED, opacity: credit }}>
        Designed and built by Ace Guevarra
      </div>
      <Burst from={w("cta", "link") + 8} x={COL_W / 2} y={top + 590} size={560} />
    </AbsoluteFill>
  );
}

/* ---------- sound ---------- */

type Cue = [frame: number, sfx: string, volume: number];
const M0 = SCENES.meet.from, A0 = SCENES.ask.from, U0 = SCENES.uses.from, H0 = SCENES.honest.from, C0 = SCENES.cta.from;
const ticks = (from: number, n: number, every: number): Cue[] => Array.from({ length: n }, (_, i) => [Math.round(from + i * every), `tick${(i % 3) + 1}`, 0.16]);
const CUES: Cue[] = [
  [w("pain", "buried"), "pop", 0.35],
  [w("pain", "forty"), "pop", 0.35],
  [w("search", "ctrl") - 2, "whoosh", 0.3],
  ...ticks(w("search", "carry") - 2, 7, 1.5 * 1.3),
  [w("search", "zero"), "alert", 0.45],
  [w("search", "roll") - 2, "pencil", 0.45],
  [w("search", "ugh"), "pop", 0.35],
  [M0 - 4, "whoosh", 0.4],
  [M0 + w("meet", "marginalia") + 10, "pencil", 0.3],
  ...FILES.map((_, i): Cue => [A0 + w("ask", "drop") + i * 4, "whoosh", 0.22]),
  ...ticks(A0 + w("ask", "ask") - 6, 12, 1.5 / 1.6),
  [A0 + w("ask", "boom") - 3, "pop", 0.45],
  [A0 + w("ask", "boom"), "paper", 0.55],
  [A0 + w("ask", "margin") - 2, "pencil", 0.35],
  [A0 + w("ask", "exact"), "pop", 0.3],
  [A0 + w("ask", "came"), "pencil", 0.3],
  ...USES.map((u): Cue => [U0 + w("uses", u.word) - 3, "paper", 0.55]),
  ...USES.map((u): Cue => [U0 + w("uses", u.word) - 3, "whoosh", 0.25]),
  [U0 + w("uses", "anything"), "pop", 0.4],
  [H0 + w("honest", "tells") - 4, "pop", 0.4],
  [H0 + w("honest", "made-up"), "pencil", 0.4],
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
        trimBefore={Math.round((MUSIC_DROP - DROP_FRAME / 30) * 30)}
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

type Key = keyof typeof SCENES;
const SCENE_EL: [Key, (h: number) => ReactNode, ((h: number) => Kw[]) | null][] = [
  ["pain", (h) => <Pain h={h} />, PAIN_KW],
  ["meet", (h) => <Meet h={h} />, null],
  ["ask", (h) => <Ask h={h} />, ASK_KW],
  ["uses", (h) => <Uses h={h} />, USES_KW],
  ["honest", () => <Honest />, HONEST_KW],
  ["cta", (h) => <Cta h={h} />, null],
];

/** Scenes whip in from the right with a little blur; Meet cuts straight in on the page. */
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

/** On 16:9 the page sits in the middle; the wash softens the bare sides. */
function WideEdges() {
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 360, background: `linear-gradient(to right, ${BG}, rgba(237,240,249,0))`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 360, background: `linear-gradient(to left, ${BG}, rgba(237,240,249,0))`, pointerEvents: "none" }} />
    </>
  );
}
