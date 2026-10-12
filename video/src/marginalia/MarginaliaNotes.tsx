import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { useEnter } from "../kit";
import { BODONI, Bracket, CAVEAT } from "./MarginaliaDemo";
import voice from "../../public/marginalia/vo/manifest.json";

/*
 * Marginalia, told in the margin. One document page carries the whole film:
 * the reader's own pencil notes when Ctrl+F fails, then Marginalia's answers
 * as frosted notes in the margin, bracketed against the passage they came
 * from. Narrated (ElevenLabs, scripts/make-marginalia-voice.mjs), with its
 * own quiet score and pencil sounds (scripts/make-marginalia-audio.mjs).
 * Colours follow the app's Ink theme. 4:5 for TikTok, 16:9 for Facebook.
 */

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const FG = "#111826", BODY = "#364050", MUTED = "#6c727e", PRIMARY = "#0152cb", BG = "#edf0f9", RED = "#df2224";
const HIGHLIGHT = "#ffe066", GRAPHITE = "#3d4452";
const SITE = "marginalia.aceguevarra.xyz";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const WASH = `radial-gradient(60% 45% at 0% 0%, rgba(1,82,203,.16), transparent 70%), radial-gradient(55% 40% at 100% 100%, rgba(77,156,255,.18), transparent 70%), ${BG}`;

/** The app's glass (globals.css `glass bg-glass`), at video scale. */
const GLASS: CSSProperties = {
  background: "rgba(246,248,254,.58)",
  backdropFilter: "blur(12px) saturate(170%)",
  WebkitBackdropFilter: "blur(12px) saturate(170%)",
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

const PAIN = { pain: 10, search: 10 + len("pain") + 8 };
const SCENES = (() => {
  const lengths = {
    pain: PAIN.search + len("search") + 14,
    meet: Math.max(84, 16 + len("meet") + 46),
    ask: 12 + len("ask") + 34,
    uses: 8 + len("uses") + 40,
    honest: 10 + len("honest") + 26,
    cta: 24 + len("cta") + 66,
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

/** Where each line is spoken, in film frames. */
const SPOKEN: [id: string, from: number][] = [
  ["pain", PAIN.pain],
  ["search", PAIN.search],
  ["meet", SCENES.meet.from + 16],
  ["ask", SCENES.ask.from + 12],
  ["uses", SCENES.uses.from + 8],
  ["honest", SCENES.honest.from + 10],
  ["cta", SCENES.cta.from + 24],
];

/* ---------- the page ---------- */

// Stage: 1080 wide; the document viewport is the top 1120px, subtitles below it (on TikTok).
const VIEW_H = 1120;
const SHEET = { x: 40, w: 1000, pad: 60, col: 500 } as const;

function Sheet({ top, children, style }: { top: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", left: SHEET.x, top, width: SHEET.w, minHeight: 1240, background: "#fff", borderRadius: 12, boxShadow: "0 0 0 1px rgba(17,24,38,.08), 0 30px 60px -30px rgba(1,40,110,.3)", padding: SHEET.pad, fontFamily: INTER, color: BODY, ...style }}>
      <div style={{ width: SHEET.col }}>{children}</div>
    </div>
  );
}
const Meta = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 23, color: MUTED, marginBottom: 30 }}>{children}</div>;
const H = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", color: FG, marginBottom: 24 }}>{children}</div>;
const P = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <p style={{ position: "relative", fontSize: 29, lineHeight: 1.6, margin: "0 0 30px", ...style }}>{children}</p>;

/** Yellow highlight sweeping across a passage, like the app's cited passages. */
const marked = (p: number): CSSProperties => ({
  backgroundImage: `linear-gradient(${HIGHLIGHT}, ${HIGHLIGHT})`, backgroundRepeat: "no-repeat", backgroundSize: `${p * 100}% 100%`,
  WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", borderRadius: 5, padding: "1px 3px", color: p > 0 ? FG : undefined,
});

/** The logo's bracket, drawn down the left of a passage, in the page margin. */
function MarginBracket({ p }: { p: number }) {
  return (
    <div style={{ position: "absolute", left: -38, top: 4, bottom: 4, width: 22, transform: `scaleY(${p})`, transformOrigin: "top" }}>
      <svg viewBox="0 0 20 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <path d="M16 3c-5 .5-9 0-11.5.8C3.4 20 4.6 50 3.6 70c-.3 9 .6 18 .2 26 3.6.8 8 .2 12.2.6l.4-5c-2.6-.4-5.2 0-7.6-.4.5-8-.3-17 .1-25 .6-19-.3-42 .4-58 2.4-.4 5 .1 7.2-.3z" fill={PRIMARY} />
      </svg>
    </div>
  );
}

/** Handwriting that writes itself left to right. */
function Hand({ p, children, color = PRIMARY, size = 40, style }: { p: number; children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", fontFamily: CAVEAT, fontSize: size, color, whiteSpace: "nowrap", lineHeight: 1.1, clipPath: `inset(-10% ${(1 - p) * 100}% -10% 0)`, ...style }}>
      {children}
    </div>
  );
}

/** A pencil loop drawn around a phrase. */
function Circled({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span style={{ position: "relative", whiteSpace: "nowrap" }}>
      {children}
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{ position: "absolute", left: -14, top: -8, width: "calc(100% + 28px)", height: "calc(100% + 16px)", overflow: "visible" }}>
        <path d="M18 34C10 14 70 4 120 6s82 12 72 30-70 22-118 20S4 44 22 20" fill="none" stroke={GRAPHITE} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </span>
  );
}

type Tok = { t: string; b?: boolean; cite?: boolean };
function tokens(s: string): Tok[] {
  let bold = false;
  return s.split(" ").map((w) => {
    if (w === "[1]") return { t: "1", cite: true };
    const open = w.startsWith("**");
    if (open) bold = true;
    const tok = { t: w.replaceAll("**", ""), b: bold };
    if (w.endsWith("**") && (!open || w.length > 4)) bold = false;
    return tok;
  });
}

/** Marginalia's answer, as a frosted note in the margin. */
function Note({ q, a, enter, shown = Infinity, cited = false, source, style }: { q: string; a: string; enter: number; shown?: number; cited?: boolean; source?: string; style?: CSSProperties }) {
  const toks = tokens(a);
  return (
    <div style={{ position: "absolute", left: SHEET.col - 30, width: 440, borderRadius: 18, padding: "20px 26px 22px", ...GLASS, fontFamily: INTER, opacity: Math.min(1, enter * 1.5), transform: `translateX(${(1 - enter) * 60}px) scale(${0.94 + 0.06 * enter})`, transformOrigin: "0 0", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 10 }}>
        <Bracket height={28} color={PRIMARY} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 24, color: FG, lineHeight: 1, paddingBottom: 2 }}>marginalia</span>
        <Bracket height={28} color={PRIMARY} flip />
      </div>
      <div style={{ fontSize: 23, color: MUTED, marginBottom: 8, lineHeight: 1.35 }}>{q}</div>
      <div style={{ fontSize: 30, lineHeight: 1.4, color: FG }}>
        {toks.slice(0, shown).map((tok, i) =>
          tok.cite ? (
            <span key={i} style={{ display: "inline-grid", placeItems: "center", minWidth: 32, height: 32, padding: "0 8px", borderRadius: 99, fontSize: 18, fontWeight: 600, verticalAlign: 3, color: cited ? FG : MUTED, background: cited ? HIGHLIGHT : "#e7effc" }}>1</span>
          ) : (
            <span key={i} style={{ fontWeight: tok.b ? 600 : 400 }}>{tok.t} </span>
          ),
        )}
      </div>
      {source && <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(17,24,38,.08)", fontSize: 20, color: MUTED }}>{source}</div>}
    </div>
  );
}

/* ---------- 1. Somewhere in a 40-page handbook ---------- */

const PAGE_H = 1240, PITCH = PAGE_H + 26, TARGET = 30;
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
      {[0, 1, 2, 3].map((p) => <P key={p}>{[0, 1].map((s) => FILLER[(n * 5 + p * 2 + s) % FILLER.length]).join(" ")}</P>)}
    </Sheet>
  );
}

/** Page 31, where the answer is. Shared by the search and the answer. */
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
    </Sheet>
  );
}

function Pain() {
  const f = useCurrentFrame();
  const stop = PAIN.search - 4;
  const scrollAt = (x: number) => interpolate(x, [4, stop], [0, TARGET * PITCH - 40], ease);
  const y = scrollAt(f);
  const v = Math.abs(y - scrollAt(f - 1));
  const page = Math.min(40, Math.floor((y + 500) / PITCH) + 1);
  const first = Math.max(0, Math.floor(y / PITCH) - 1);

  const scribble = interpolate(f, [PAIN.pain + at("pain", "somewhere"), PAIN.pain + at("pain", "somewhere") + 16], [0, 1], clamp);
  const open = useEnter(PAIN.search + at("search", "search") - 6, { damping: 18, stiffness: 200 });
  const typeFrom = PAIN.search + at("search", "carry") - 2;
  const failAt = PAIN.search + at("search", "nothing");
  const query = "carry over".slice(0, Math.max(0, Math.floor((f - typeFrom) / 1.8)));
  const failed = f >= failAt;
  const shake = failed ? Math.sin((f - failAt) * 2.2) * interpolate(f - failAt, [0, 14], [12, 0], clamp) : 0;
  const circle = interpolate(f, [PAIN.search + at("search", "roll") - 2, PAIN.search + at("search", "roll") + 14], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 30 - y, filter: `blur(${Math.min(5, v * 0.012)}px)` }}>
        {Array.from({ length: 4 }, (_, i) => first + i).filter((n) => n <= TARGET).map((n) =>
          n === TARGET ? <LeavePage key={n} top={n * PITCH} circle={circle} /> : <FillerPage key={n} n={n} />,
        )}
      </div>
      {/* The reader's own note, in pencil */}
      <Hand p={scribble} color={GRAPHITE} size={64} style={{ left: 640, top: 200, transform: "rotate(-7deg)" }}>where is it??</Hand>
      {/* Find in page */}
      <div style={{ position: "absolute", left: 250, top: 40, width: 580, height: 84, borderRadius: 16, ...GLASS, background: "rgba(255,255,255,.78)", border: `2px solid ${failed ? RED : PRIMARY}`, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", fontFamily: INTER, fontSize: 32, opacity: open, transform: `translateY(${(1 - open) * -30}px) translateX(${shake}px)` }}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round"><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5 21 21" /></svg>
        <span style={{ flex: 1, color: FG }}>
          {query}
          {!failed && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, verticalAlign: -5, background: PRIMARY, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />}
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: RED }}>{failed ? "0 results" : ""}</span>
      </div>
      <div style={{ position: "absolute", right: 90, top: VIEW_H - 110, display: "flex", gap: 18, padding: "12px 22px", borderRadius: 999, ...GLASS, fontFamily: INTER, fontSize: 22, color: FG }}>
        <span style={{ fontWeight: 600 }}>Employee handbook.pdf</span>
        <span style={{ color: MUTED, fontVariantNumeric: "tabular-nums" }}>{page} / 40</span>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 2. Meet Marginalia: the page frosts over, the brackets open ---------- */

function Meet() {
  const f = useCurrentFrame();
  const frost = interpolate(f, [0, 14], [0, 1], ease);
  const open = useEnter(10, { damping: 15, stiffness: 110 });
  const note = interpolate(f, [30, 46], [0, 1], clamp);
  const sub = useEnter(40);
  const size = 132;
  const half = size * 2.45;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${frost * 14}px)`, opacity: 1 - frost * 0.3 }}>
        <LeavePage top={30} circle={1} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300, height: 420, borderRadius: 28, ...GLASS, opacity: frost, transform: `scale(${0.96 + 0.04 * frost})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380 }}>
        <div style={{ position: "relative", height: size * 1.25, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: size, color: FG, lineHeight: 1, paddingBottom: size * 0.09, clipPath: `inset(0 ${(1 - open) * 50}% 0 ${(1 - open) * 50}%)` }}>marginalia</span>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${-12 - (half + 30) * open - size * 0.25}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} /></div>
          <div style={{ position: "absolute", left: "50%", transform: `translateX(${12 + (half + 30) * open}px)`, opacity: frost }}><Bracket height={size * 1.23} color={PRIMARY} flip /></div>
        </div>
        <Hand p={note} size={56} style={{ left: "50%", marginLeft: -40, top: size * 1.25 + 4, transform: "rotate(-3deg)" }}>notes in the margin</Hand>
        <div style={{ position: "absolute", left: 0, right: 0, top: size * 1.25 + 110, textAlign: "center", fontFamily: INTER, fontSize: 30, color: MUTED, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
          Ask your documents. See where every answer came from.
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 3. Ask, and the answer lands in the margin ---------- */

const ASK_Q = "Does unused leave carry over?";
const ASK_A = "Yes. Up to **5 unused days** roll over to next year. [1]";
function Ask() {
  const f = useCurrentFrame();
  const vo = 12;
  const typeFrom = 10, sendAt = typeFrom + Math.ceil(ASK_Q.length / 0.75) + 6;
  const typed = ASK_Q.slice(0, Math.max(0, Math.floor((f - typeFrom) * 0.75)));
  const sent = f >= sendAt;
  const noteAt = vo + at("ask", "answer");
  const enter = useEnter(noteAt, { damping: 17, stiffness: 150 });
  const shown = Math.max(0, Math.floor((f - noteAt - 6) / 2.4));
  const bracket = interpolate(f, [vo + at("ask", "margin"), vo + at("ask", "margin") + 12], [0, 1], clamp);
  const mark = interpolate(f, [vo + at("ask", "right"), vo + at("ask", "right") + 18], [0, 1], ease);
  const cited = f >= vo + at("ask", "came");
  const hand = interpolate(f, [vo + at("ask", "came") + 8, vo + at("ask", "came") + 28], [0, 1], clamp);
  const drift = interpolate(f, [0, SCENES.ask.len], [0, -40]);
  const press = f >= sendAt - 3 && f < sendAt + 3;
  return (
    <AbsoluteFill>
      <LeavePage top={30 + drift} mark={mark} bracket={bracket}>
        <Note q={ASK_Q} a={ASK_A} enter={enter} shown={shown} cited={cited} source="Employee handbook, page 31" style={{ top: -36 }} />
        <Hand p={hand} size={46} style={{ left: SHEET.col - 10, top: 400, transform: "rotate(-4deg)" }}>“roll over” = “carry over” ✓</Hand>
      </LeavePage>
      {/* The composer, frosted over the page */}
      <div style={{ position: "absolute", left: 90, right: 90, top: VIEW_H - 150, height: 92, borderRadius: 20, ...GLASS, display: "flex", alignItems: "center", padding: "0 14px 0 30px", fontFamily: INTER, fontSize: 30 }}>
        <span style={{ flex: 1, color: !sent && typed ? FG : MUTED }}>
          {!sent && typed ? typed : "Ask about your documents"}
          {!sent && typed && <span style={{ display: "inline-block", width: 3, height: 32, marginLeft: 2, verticalAlign: -5, background: PRIMARY }} />}
        </span>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: PRIMARY, display: "grid", placeItems: "center", transform: `scale(${press ? 0.88 : 1})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.1)" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4. Lecture notes, a lease, work docs ---------- */

const USES = [
  { word: "lecture", meta: "ECON 101, lecture 4", h: "Why prices rise", before: "Prices rise when demand outpaces what an economy can produce.", target: "Inflation is mostly too much money chasing too few goods.", q: "What causes inflation?", a: "Too much **money chasing too few goods.** [1]", tilt: -1.4 },
  { word: "lease", meta: "Lease agreement, page 6", h: "12. Pets", before: "The tenant keeps the property clean and free of damage.", target: "Pets are allowed with the landlord's written permission and a $300 deposit.", q: "Can I have a cat?", a: "Yes, with **written permission** and a $300 deposit. [1]", tilt: 1.2 },
  { word: "work", meta: "IT onboarding, page 2", h: "Your first week", before: "Your laptop arrives set up, with your accounts ready.", target: "Install the GlobalProtect VPN from the Self Service app on day one.", q: "Which VPN do I set up?", a: "**GlobalProtect,** from the Self Service app. [1]", tilt: -0.8 },
];
function UseSheet({ i, from }: { i: number; from: number }) {
  const f = useCurrentFrame() - from;
  const u = USES[i];
  const land = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const mark = interpolate(f, [8, 20], [0, 1], ease);
  const bracket = interpolate(f, [10, 20], [0, 1], clamp);
  const enter = useEnter(from + 12, { damping: 17, stiffness: 170 });
  if (f < 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - land) * 900}px) rotate(${u.tilt * land}deg)` }}>
      <Sheet top={60 + i * 26}>
        <Meta>{u.meta}</Meta>
        <H>{u.h}</H>
        <P>{u.before}</P>
        <P>
          <span style={marked(mark)}>{u.target}</span>
          <MarginBracket p={bracket} />
          <Note q={u.q} a={u.a} enter={enter} cited={f > 26} style={{ top: -30 }} />
        </P>
        <P>{FILLER[(i * 3) % FILLER.length]} {FILLER[(i * 3 + 1) % FILLER.length]}</P>
      </Sheet>
    </div>
  );
}
function Uses() {
  return (
    <AbsoluteFill>
      {USES.map((u, i) => <UseSheet key={i} i={i} from={8 + at("uses", u.word) - 6} />)}
    </AbsoluteFill>
  );
}

/* ---------- 5. Not in your files? It says so ---------- */

function Honest() {
  const f = useCurrentFrame();
  const enter = useEnter(10 + at("honest", "tells") - 8, { damping: 17, stiffness: 150 });
  const hand = interpolate(f, [10 + at("honest", "made-up"), 10 + at("honest", "made-up") + 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
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
      </Sheet>
      <Hand p={hand} size={50} style={{ left: SHEET.x + SHEET.pad + SHEET.col + 20, top: 560, transform: "rotate(-4deg)" }}>no guessing ✓</Hand>
    </AbsoluteFill>
  );
}

/* ---------- 6. Try it ---------- */

function Cta() {
  const f = useCurrentFrame();
  const mark = useEnter(4, { damping: 16, stiffness: 120 });
  const note = interpolate(f, [20, 36], [0, 1], clamp);
  const line = useEnter(24 + at("cta", "try") - 4);
  const url = useEnter(24 + at("cta", "link") - 4, { damping: 13, stiffness: 160 });
  const credit = useEnter(24 + at("cta", "link") + 14);
  return (
    <AbsoluteFill style={{ background: WASH }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: mark, transform: `translateY(${(1 - mark) * 40}px)` }}>
        <Bracket height={160} color={PRIMARY} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 128, color: FG, lineHeight: 1, paddingBottom: 12 }}>marginalia</span>
        <Bracket height={160} color={PRIMARY} flip />
      </div>
      <Hand p={note} size={54} style={{ left: 500, top: 470, transform: "rotate(-3deg)" }}>notes in the margin</Hand>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: INTER, fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", color: FG, opacity: line, transform: `translateY(${(1 - line) * 20}px)` }}>
        Try it with your own documents.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center", opacity: url, transform: `scale(${0.85 + 0.15 * url})` }}>
        <div style={{ padding: "22px 40px", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: INTER, fontWeight: 600, fontSize: 40, boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.1)" }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: INTER, fontSize: 28, color: MUTED, opacity: credit }}>
        Designed and built by Ace Guevarra
      </div>
    </AbsoluteFill>
  );
}

/* ---------- subtitles: the line being spoken, word by word ---------- */

function Subtitles({ wide }: { wide: boolean }) {
  const f = useCurrentFrame();
  const cur = [...SPOKEN].reverse().find(([id, from]) => f >= from - 4 && f < from + len(id) + 12);
  if (!cur) return null;
  const [id, from] = cur;
  const t = (f - from) / 30;
  // One sentence at a time
  const sentences: Line["words"][] = [[]];
  VO[id].words.forEach((w) => {
    sentences.at(-1)!.push(w);
    if (/[.!?]["”]?$/.test(w.t)) sentences.push([]);
  });
  const groups = sentences.filter((s) => s.length);
  const group = groups.find((g, i) => t < (groups[i + 1]?.[0].s ?? Infinity) - 0.05) ?? groups.at(-1)!;
  const appear = interpolate(f - from - fr(group[0].s), [-4, 2], [0, 1], clamp);
  return (
    <div style={wide ? { position: "absolute", left: 110, width: 640, top: 0, bottom: 0, display: "flex", alignItems: "center" } : { position: "absolute", left: 60, right: 60, top: VIEW_H + 24, height: 190, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: wide ? 62 : 50, lineHeight: 1.2, letterSpacing: "-0.02em", opacity: appear, transform: `translateY(${(1 - appear) * 10}px)` }}>
        {group.map((w, i) => (
          <span key={i} style={{ color: t >= w.s - 0.04 ? FG : "rgba(17,24,38,.22)" }}>{w.t} </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- sound ---------- */

type Cue = [frame: number, sfx: string, volume: number];
const ticks = (from: number, n: number, every: number): Cue[] => Array.from({ length: n }, (_, i) => [Math.round(from + i * every), `tick${(i % 3) + 1}`, 0.14]);
const A = SCENES.ask.from, U = SCENES.uses.from, Hn = SCENES.honest.from;
const CUES: Cue[] = [
  [4, "paper", 0.5],
  [PAIN.pain + at("pain", "somewhere"), "pencil", 0.45],
  [PAIN.search + at("search", "search") - 6, "pop", 0.3],
  ...ticks(PAIN.search + at("search", "carry"), 6, 3),
  [PAIN.search + at("search", "nothing"), "alert", 0.35],
  [PAIN.search + at("search", "roll") - 2, "pencil", 0.4],
  [SCENES.meet.from, "whoosh", 0.3],
  [SCENES.meet.from + 30, "pencil", 0.3],
  [A, "whoosh", 0.25],
  ...ticks(A + 10, 10, 4),
  [A + 10 + Math.ceil(ASK_Q.length / 0.75) + 6, "pop", 0.35],
  [A + 12 + at("ask", "answer"), "paper", 0.4],
  [A + 12 + at("ask", "margin"), "pencil", 0.35],
  [A + 12 + at("ask", "came") + 8, "pencil", 0.35],
  ...USES.map((u): Cue => [U + 8 + at("uses", u.word) - 6, "paper", 0.5]),
  [Hn, "paper", 0.45],
  [Hn + 10 + at("honest", "made-up"), "pencil", 0.35],
  [SCENES.cta.from, "whoosh", 0.3],
  [SCENES.cta.from + 6, "chime", 0.45],
];

function Sound() {
  const end = MARGINALIA_NOTES_DURATION;
  return (
    <>
      <Html5Audio
        src={staticFile("music/margin-notes.wav")}
        volume={(f) => interpolate(f, [0, 20, end - 50, end], [0, 0.08, 0.08, 0], clamp)}
      />
      {SPOKEN.map(([id, from]) =>
        VO[id].file ? (
          <Sequence key={id} from={from} durationInFrames={len(id) + 20} layout="none">
            <Html5Audio src={staticFile(VO[id].file!)} />
          </Sequence>
        ) : null,
      )}
      {CUES.map(([from, sfx, volume], i) => (
        <Sequence key={i} from={from} durationInFrames={45} layout="none">
          <Html5Audio src={staticFile(`sfx/${sfx}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

/* ---------- the film ---------- */

const SCENE_EL: [keyof typeof SCENES, () => ReactNode][] = [
  ["pain", () => <Pain />],
  ["meet", () => <Meet />],
  ["ask", () => <Ask />],
  ["uses", () => <Uses />],
  ["honest", () => <Honest />],
  ["cta", () => <Cta />],
];

/** Each scene comes in as a new sheet laid on top; Meet and Ask share the page, so they cut. */
function Scene({ k, children }: { k: keyof typeof SCENES; children: ReactNode }) {
  const f = useCurrentFrame();
  const slide = k === "honest" || k === "cta";
  const p = slide ? interpolate(f, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const fade = k === "ask" ? interpolate(f, [0, 10], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 1100}px)`, opacity: fade }}>{children}</AbsoluteFill>;
}

/** `wide`: the 16:9 cut for Facebook, subtitles left of the page. */
export function MarginaliaNotes({ wide = false }: { wide?: boolean }) {
  const k = wide ? 1080 / VIEW_H : 1;
  return (
    <AbsoluteFill style={{ background: wide ? "#fff" : WASH }}>
      <div style={{ position: "absolute", left: wide ? 1920 - 1080 * k - 70 : 0, top: 0, width: 1080, height: VIEW_H, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "hidden", background: WASH, borderRadius: wide ? 0 : undefined }}>
        {SCENE_EL.map(([key, el]) => (
          <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].len + (key === "cta" ? 0 : 18)} layout="none">
            <Scene k={key}>{el()}</Scene>
          </Sequence>
        ))}
        {/* The page fades into the subtitles below it */}
        {!wide && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: `linear-gradient(to bottom, rgba(237,240,249,0), ${BG})` }} />}
      </div>
      <Subtitles wide={wide} />
      <Sound />
    </AbsoluteFill>
  );
}
