import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { type Cue, Soundtrack, useEnter } from "../kit";
import { BLUE, BODONI, Bracket, CAVEAT } from "./MarginaliaDemo";

/*
 * A problem-first TikTok: hunting a 40-page handbook with Ctrl+F finds nothing,
 * because the handbook says "roll over", not "carry over". Marginalia answers
 * the question by meaning and shows the line it came from. Everything is drawn
 * here, in Marginalia's own type and colours, so it reads on a phone.
 * 9:16, white, with TikTok-style caption boxes; nothing important in the top
 * 220px or the bottom ~300px, where TikTok's UI sits.
 */

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const SITE = "marginalia.aceguevarra.xyz";
const INK = "#1d1d1f", MUTED = "#6e6e73", RED = "#ff3b30";
const HIGHLIGHT = "#ffe066";
const WASH = `radial-gradient(60% 50% at 0% 0%, rgba(0,122,255,.14), transparent 60%), radial-gradient(50% 40% at 100% 10%, rgba(175,82,222,.12), transparent 60%), radial-gradient(60% 40% at 50% 105%, rgba(90,200,250,.16), transparent 60%), #f2f3f7`;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

// The phone-sized "screen" every scene plays in.
const CARD = { x: 60, y: 560, w: 960, h: 1060 } as const;

const T = {
  scroll: 75, // pages fly by
  find: 140, // Ctrl+F opens
  typed: 150, // "carry over", a letter every 3 frames
  fail: 192, // 0 results
  switch: 250, // over to Marginalia
  send: 318,
  stream: 332,
  sources: 410,
  tap: 468, // open the source
  outro: 560,
} as const;
export const MARGINALIA_TIKTOK_DURATION = 650;

/* ---------- captions: TikTok's own boxed text ---------- */

function Caption({ lines }: { lines: [delay: number, text: string][] }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {lines.map(([delay, text]) => {
        const p = interpolate(frame - delay, [0, 4, 7], [0, 1.06, 1], clamp);
        return (
          <div
            key={text}
            style={{ fontFamily: INTER, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em", lineHeight: 1.15, color: "#fff", background: INK, padding: "10px 22px", borderRadius: 18, opacity: p > 0 ? 1 : 0, transform: `scale(${p})` }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- the handbook, as a PDF viewer ---------- */

const PAGES = 40;
const PAGE_W = 780, PAGE_H = 1010, GAP = 28, PITCH = PAGE_H + GAP;
const TITLES = ["Welcome", "Who we are", "Working hours", "Remote work", "Payroll", "Benefits", "Health cover", "Time off", "Expenses", "Travel", "Equipment", "IT and security", "Code of conduct", "Performance reviews", "Learning budget", "Leaving us"];
const LINES = [
  "Employees are expected to read this handbook in full and to follow the policies it describes.",
  "Requests should be submitted through the HR portal, where your manager will review them.",
  "Where local law differs from this policy, the law of the country you work in applies.",
  "Questions about any section can be raised with your People Partner at any time.",
  "Changes to this policy are announced by email and take effect on the first of the month.",
  "Records are kept for seven years in line with our data retention schedule.",
  "Part-time employees receive the benefits described here on a pro-rata basis.",
  "Approval is not automatic, and requests may be declined during busy periods.",
  "Managers are responsible for making sure their teams know where to find this policy.",
  "Exceptions require written approval from both your manager and the People team.",
];
function Page({ n }: { n: number }) {
  const chapter = Math.floor(n / 3) + 1;
  const title = TITLES[(chapter - 1) % TITLES.length];
  return (
    <div style={{ position: "relative", width: PAGE_W, height: PAGE_H, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.12)", padding: 70, fontFamily: INTER, color: "#3a3a3c", overflow: "hidden" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: INK, marginBottom: 26 }}>{chapter}.{(n % 3) + 1} {title}</div>
      {[0, 1, 2, 3, 4].map((p) => (
        <p key={p} style={{ fontSize: 19, lineHeight: 1.65, margin: "0 0 22px" }}>
          {[0, 1, 2].map((s) => LINES[(n * 7 + p * 3 + s) % LINES.length]).join(" ")}
        </p>
      ))}
      <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center", fontSize: 16, color: MUTED }}>{n + 1}</div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round">
      <circle cx={10.5} cy={10.5} r={6.5} />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

const SCROLL_END = 17 * PITCH + 60;
const scrollAt = (f: number) => interpolate(f, [T.scroll, T.find - 6], [0, SCROLL_END], ease);

function Handbook() {
  const f = useCurrentFrame();
  const scrollY = scrollAt(f);
  const v = Math.abs(scrollY - scrollAt(f - 1));
  const page = Math.min(PAGES, Math.floor((scrollY + 400) / PITCH) + 1);
  const find = useEnter(T.find, { damping: 18, stiffness: 200 });
  const query = "carry over".slice(0, Math.max(0, Math.floor((f - T.typed) / 3)));
  const failed = f >= T.fail;
  const shake = failed ? Math.sin((f - T.fail) * 2.2) * interpolate(f - T.fail, [0, 14], [14, 0], clamp) : 0;
  const first = Math.max(0, Math.floor(scrollY / PITCH) - 1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e5e5ea" }}>
      {/* Pages */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 84, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: (CARD.w - PAGE_W) / 2, top: 28 - scrollY, filter: `blur(${Math.min(5, v * 0.025)}px)` }}>
          {Array.from({ length: 4 }, (_, i) => first + i).filter((n) => n < PAGES).map((n) => (
            <div key={n} style={{ position: "absolute", top: n * PITCH }}>
              <Page n={n} />
            </div>
          ))}
        </div>
      </div>
      {/* Toolbar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 84, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", background: "#f9f9fb", borderBottom: "1px solid #dcdce0", fontFamily: INTER, fontSize: 26 }}>
        <span style={{ fontWeight: 600, color: INK }}>Employee handbook.pdf</span>
        <span style={{ color: MUTED, fontVariantNumeric: "tabular-nums" }}>{page} / {PAGES}</span>
      </div>
      {/* Find bar */}
      <div
        style={{
          position: "absolute", right: 24, top: 104, width: 560, height: 80, borderRadius: 20, background: "#fff",
          boxShadow: "0 12px 30px -10px rgba(0,0,0,.3)", border: `2px solid ${failed ? RED : BLUE}`,
          display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontFamily: INTER, fontSize: 32,
          opacity: find, transform: `translateY(${(1 - find) * -30}px) translateX(${shake}px)`,
        }}
      >
        <SearchIcon />
        <span style={{ flex: 1, color: INK }}>
          {query}
          {!failed && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, verticalAlign: -5, background: BLUE, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />}
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: RED }}>{failed ? "0 results" : ""}</span>
      </div>
    </div>
  );
}

/* ---------- Marginalia ---------- */

type Tok = { t: string; b?: boolean; cite?: boolean };
const words = (s: string, b?: boolean): Tok[] => s.split(" ").map((t) => ({ t, b }));
const ANSWER: Tok[] = [
  ...words("Yes. Up to"),
  ...words("5 unused days", true),
  ...words("roll over to the next year."),
  { t: "1", cite: true },
  ...words("Anything above that is forfeited on 31 December."),
  { t: "1", cite: true },
];
const QUESTION = "Does unused leave carry over?";

function Cite({ active }: { active: boolean }) {
  return (
    <span style={{ display: "inline-grid", placeItems: "center", minWidth: 34, height: 34, padding: "0 8px", margin: "0 8px 0 0", borderRadius: 999, fontSize: 19, fontWeight: 600, verticalAlign: 4, color: active ? INK : MUTED, background: active ? HIGHLIGHT : "#e6e6eb" }}>
      1
    </span>
  );
}

const glassBox: CSSProperties = { background: "rgba(255,255,255,.82)", border: "1px solid rgba(255,255,255,.95)", boxShadow: "0 8px 24px -12px rgba(20,20,40,.25)" };

function Chat() {
  const f = useCurrentFrame() + T.switch; // film time
  const typed = QUESTION.slice(0, Math.max(0, Math.floor((f - (T.switch + 36)) * 1.2)));
  const sent = f >= T.send;
  const bubble = useEnter(T.send - T.switch, { damping: 16, stiffness: 180 });
  const shown = Math.max(0, Math.floor((f - T.stream) / 2.2));
  const streaming = f >= T.stream && shown < ANSWER.length;
  const sources = useEnter(T.sources - T.switch, { damping: 18, stiffness: 160 });
  const tapped = f >= T.tap + 4;
  const tap = interpolate(f, [T.tap, T.tap + 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, background: WASH, fontFamily: INTER, color: INK }}>
      {/* Wordmark */}
      <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 4 }}>
        <Bracket height={46} color={BLUE} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 38, lineHeight: 1, paddingBottom: 4 }}>marginalia</span>
        <Bracket height={46} color={BLUE} flip />
      </div>
      {/* Question */}
      {sent && (
        <div style={{ position: "absolute", right: 40, top: 130, ...glassBox, background: "#fff", borderRadius: 30, padding: "18px 28px", fontSize: 32, opacity: bubble, transform: `translateY(${(1 - bubble) * 60}px) scale(${0.9 + 0.1 * bubble})`, transformOrigin: "100% 100%" }}>
          {QUESTION}
        </div>
      )}
      {/* Answer, streaming in word by word */}
      <div style={{ position: "absolute", left: 48, right: 56, top: 260, fontSize: 38, lineHeight: 1.55 }}>
        {ANSWER.slice(0, shown).map((tok, i) =>
          tok.cite ? <Cite key={i} active={tapped} /> : <span key={i} style={{ fontWeight: tok.b ? 600 : 400 }}>{tok.t} </span>,
        )}
        {streaming && <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 99, background: MUTED, marginLeft: 4, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 6)) }} />}
      </div>
      {/* Sources */}
      <div style={{ position: "absolute", left: 48, right: 56, top: 560, height: 84, borderRadius: 26, ...glassBox, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 28, opacity: sources, transform: `translateY(${(1 - sources) * 30}px) scale(${1 - 0.03 * Math.sin(Math.PI * tap)})` }}>
        <span style={{ fontWeight: 600 }}>1 source</span>
        <span style={{ color: MUTED, flex: 1 }}>Employee handbook, page 31</span>
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${tapped ? 180 : 0}deg)` }}><path d="m6 9 6 6 6-6" /></svg>
        {/* the tap */}
        {f >= T.tap && tap < 1 && (
          <div style={{ position: "absolute", left: 430, top: 2, width: 80, height: 80, borderRadius: 99, background: "rgba(0,0,0,.18)", transform: `scale(${0.4 + tap})`, opacity: 1 - tap }} />
        )}
      </div>
      {/* Input */}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, height: 96, borderRadius: 48, ...glassBox, display: "flex", alignItems: "center", padding: "0 14px 0 34px", fontSize: 32 }}>
        <span style={{ flex: 1, color: !sent && typed ? INK : MUTED }}>{!sent && typed ? typed : "Ask about your documents"}</span>
        <div style={{ width: 66, height: 66, borderRadius: 99, background: BLUE, display: "grid", placeItems: "center" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </div>
      </div>
      <Source />
    </div>
  );
}

/* The cited page rises over the chat: the line highlighted, a bracket in the margin. */
function Source() {
  const f = useCurrentFrame() + T.switch;
  const rise = interpolate(f, [T.tap + 6, T.tap + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const mark = interpolate(f, [T.tap + 30, T.tap + 46], [0, 1], ease);
  const bracket = interpolate(f, [T.tap + 44, T.tap + 56], [0, 1], clamp);
  const note = interpolate(f, [T.tap + 54, T.tap + 72], [0, 1], clamp);
  if (rise === 0) return null;
  const marked: CSSProperties = {
    backgroundImage: `linear-gradient(${HIGHLIGHT}, ${HIGHLIGHT})`, backgroundRepeat: "no-repeat", backgroundSize: `${mark * 100}% 100%`,
    WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", borderRadius: 6, padding: "1px 3px",
  };
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 380, bottom: -40, transform: `translateY(${(1 - rise) * 800}px)`, background: "#fff", borderRadius: "36px 36px 0 0", boxShadow: "0 -20px 60px -20px rgba(20,20,40,.35)", padding: "40px 64px 0 84px", fontFamily: INTER, color: "#3a3a3c" }}>
      <div style={{ fontSize: 24, color: MUTED, marginBottom: 26 }}><b style={{ color: INK, fontWeight: 600 }}>Employee handbook</b>  ·  Page 31</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: INK, marginBottom: 20 }}>8.3 Annual leave</div>
      <p style={{ fontSize: 28, lineHeight: 1.6, margin: "0 0 22px" }}>Full-time employees receive 15 days of paid annual leave per year, credited monthly.</p>
      <p style={{ position: "relative", fontSize: 28, lineHeight: 1.6, margin: "0 0 22px", color: INK }}>
        {/* A note in the margin */}
        <svg viewBox="0 0 20 100" preserveAspectRatio="none" style={{ position: "absolute", left: -52, top: 4, height: "calc(100% - 8px)", width: 22, transform: `scaleY(${bracket})`, transformOrigin: "top" }}>
          <path d="M16 3c-5 .5-9 0-11.5.8C3.4 20 4.6 50 3.6 70c-.3 9 .6 18 .2 26 3.6.8 8 .2 12.2.6l.4-5c-2.6-.4-5.2 0-7.6-.4.5-8-.3-17 .1-25 .6-19-.3-42 .4-58 2.4-.4 5 .1 7.2-.3z" fill={BLUE} />
        </svg>
        <span style={marked}>Up to 5 unused days roll over to the next year. Anything above that is forfeited on 31 December.</span>
      </p>
      <div style={{ fontFamily: CAVEAT, fontSize: 50, color: BLUE, transform: "rotate(-3deg)", transformOrigin: "left", marginLeft: 10, clipPath: `inset(0 ${(1 - note) * 100}% 0 0)` }}>
        “roll over” = “carry over” ✓
      </div>
      <p style={{ fontSize: 28, lineHeight: 1.6, margin: "22px 0 0" }}>Leave requests should be submitted at least 10 working days in advance.</p>
    </div>
  );
}

/* ---------- outro ---------- */

function Outro() {
  const frame = useCurrentFrame();
  const mark = useEnter(4, { damping: 16, stiffness: 120 });
  const note = interpolate(frame, [20, 34], [0, 1], clamp);
  const url = useEnter(32, { damping: 12, stiffness: 160 });
  const credit = useEnter(44);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: mark, transform: `translateY(${(1 - mark) * 40}px)` }}>
        <Bracket height={170} color={BLUE} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 138, color: INK, lineHeight: 1, paddingBottom: 12 }}>marginalia</span>
        <Bracket height={170} color={BLUE} flip />
      </div>
      <div style={{ position: "absolute", left: 470, top: 880, fontFamily: CAVEAT, fontSize: 60, color: BLUE, transform: "rotate(-3deg)", clipPath: `inset(0 ${(1 - note) * 100}% 0 0)` }}>
        notes in the margin
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: INTER, fontSize: 38, color: MUTED, opacity: url }}>
        Ask your documents. Get the line it came from.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", opacity: url, transform: `scale(${0.8 + 0.2 * url})` }}>
        <div style={{ padding: "20px 40px", borderRadius: 999, background: BLUE, color: "#fff", fontFamily: INTER, fontWeight: 600, fontSize: 42 }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center", fontFamily: INTER, fontSize: 30, color: MUTED, opacity: credit }}>
        Designed and built by Ace Guevarra
      </div>
    </AbsoluteFill>
  );
}

/* ---------- the film ---------- */

function Screen({ children }: { children: ReactNode }) {
  const f = useCurrentFrame();
  const enter = useEnter(0, { damping: 18, stiffness: 120 });
  // The handbook slides away left as Marginalia comes in from the right.
  const swap = interpolate(f, [T.switch, T.switch + 22], [0, 1], ease);
  const out = interpolate(f, [T.outro - 10, T.outro + 4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 48, overflow: "hidden", border: "1px solid #e3e3e8", boxShadow: "0 40px 90px -40px rgba(20,20,40,.45)", transform: `translateY(${(1 - enter) * 200 + out * 120}px) scale(${0.96 + 0.04 * enter})`, opacity: (1 - out) * Math.min(1, enter * 2) }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-swap * 100}%)` }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - swap) * 100}%)` }}>
        <Sequence from={T.switch} layout="none"><Chat /></Sequence>
      </div>
    </div>
  );
}

const CAPTIONS: [from: number, to: number, lines: [number, string][]][] = [
  [0, T.find, [[2, "POV: your boss asks if"], [8, "unused leave carries over"], [40, "…and the handbook is 40 pages"]]],
  [T.find, T.switch, [[4, "Ctrl+F “carry over”"], [T.fail - T.find, "0 results."], [T.fail - T.find + 22, "(page 31 calls it “roll over”)"]]],
  [T.switch, T.stream, [[6, "So I asked Marginalia instead"]]],
  [T.stream, T.tap, [[4, "It gets what you mean,"], [12, "not just the words you typed"]]],
  [T.tap, T.outro, [[8, "…and shows the exact line"], [14, "it came from"]]],
];

const typing = (from: number, n: number, every: number): Cue[] => Array.from({ length: n }, (_, i) => [from + i * every, `tick${(i % 3) + 1}`, 0.22]);
const CUES: Cue[] = [
  [2, "pop", 0.4],
  [42, "pop", 0.4],
  [T.scroll, "whoosh", 0.5],
  [T.find, "pop", 0.4],
  ...typing(T.typed + 3, 10, 3),
  [T.fail, "alert", 0.55],
  [T.switch, "whoosh", 0.5],
  ...typing(T.switch + 36, 10, 3),
  [T.send, "pop", 0.5],
  [T.sources, "paper", 0.6],
  [T.tap, "tick2", 0.5],
  [T.tap + 8, "paper", 0.8],
  [T.tap + 30, "tick1", 0.4],
  [T.tap + 54, "tick3", 0.4],
  [T.outro - 8, "whoosh", 0.5],
  [T.outro + 4, "chime", 0.7],
];

export function MarginaliaTikTok() {
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Sequence durationInFrames={T.outro + 4} layout="none">
        <Screen><Handbook /></Screen>
      </Sequence>
      {CAPTIONS.map(([from, to, lines]) => (
        <Sequence key={from} from={from} durationInFrames={to - from} layout="none">
          <Caption lines={lines} />
        </Sequence>
      ))}
      <Sequence from={T.outro}><Outro /></Sequence>
      {/* The drop lands when the question goes to Marginalia. */}
      <Soundtrack dropAt={T.send} duration={MARGINALIA_TIKTOK_DURATION} cues={CUES} musicVolume={0.4} />
    </AbsoluteFill>
  );
}
