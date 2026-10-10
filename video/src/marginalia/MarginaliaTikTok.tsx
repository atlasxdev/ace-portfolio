import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { type Cue, Soundtrack, useEnter } from "../kit";
import { BLUE, BODONI, Bracket, CAVEAT } from "./MarginaliaDemo";

/*
 * A TikTok that sells Marginalia to people who'd use it: the pain (an answer
 * buried in a 40-page PDF that Ctrl+F can't find), the fix (ask in plain words,
 * get a cited answer), what they could use it for, the doc builder, that it
 * won't make things up, and how to start. Everything is drawn here in
 * Marginalia's own type and colours so it reads on a phone.
 * 9:16, white, with TikTok-style caption boxes; nothing important in the top
 * 220px or the bottom ~300px, where TikTok's UI sits.
 */

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });
const SITE = "marginalia.aceguevarra.xyz";
const INK = "#1d1d1f", MUTED = "#6e6e73", RED = "#ff3b30", GREEN = "#34c759", AMBER = "#ff9f0a";
const HIGHLIGHT = "#ffe066";
const WASH = `radial-gradient(60% 50% at 0% 0%, rgba(0,122,255,.14), transparent 60%), radial-gradient(50% 40% at 100% 10%, rgba(175,82,222,.12), transparent 60%), radial-gradient(60% 40% at 50% 105%, rgba(90,200,250,.16), transparent 60%), #f2f3f7`;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const glassBox: CSSProperties = { background: "rgba(255,255,255,.82)", border: "1px solid rgba(255,255,255,.95)", boxShadow: "0 8px 24px -12px rgba(20,20,40,.25)" };

// The phone-sized "screen" the story plays in.
const CARD = { x: 60, y: 560, w: 960, h: 1060 } as const;

/* Film timeline, in frames at 30fps. */
const T = {
  find: 150, // Ctrl+F
  ask: 270, // over to Marginalia
  uses: 660, // three things to use it for, 85 frames each
  build: 915, // the doc builder
  honest: 1125,
  steps: 1245, // how to start
  cta: 1375,
} as const;
const USE_LEN = 85;
export const MARGINALIA_TIKTOK_DURATION = 1500;

/* ---------- captions: TikTok's own boxed text ---------- */

function Caption({ lines, wide }: { lines: [delay: number, text: string][]; wide: boolean }) {
  const frame = useCurrentFrame();
  return (
    <div style={wide ? { position: "absolute", left: 100, width: 880, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 8 } : { position: "absolute", left: 0, right: 0, top: 290, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {lines.map(([delay, text]) => {
        const p = interpolate(frame - delay, [0, 4, 7], [0, 1.06, 1], clamp);
        return (
          <div
            key={text}
            style={{ fontFamily: INTER, fontWeight: 700, fontSize: wide ? 48 : 54, whiteSpace: "nowrap", letterSpacing: "-0.01em", lineHeight: 1.15, color: "#fff", background: INK, padding: "10px 24px", borderRadius: 18, opacity: p > 0 ? 1 : 0, transform: `scale(${p})`, transformOrigin: wide ? "left center" : "center" }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 1. The handbook, as a PDF viewer ---------- */

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
  return (
    <div style={{ position: "relative", width: PAGE_W, height: PAGE_H, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.12)", padding: 70, fontFamily: INTER, color: "#3a3a3c", overflow: "hidden" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: INK, marginBottom: 26 }}>{chapter}.{(n % 3) + 1} {TITLES[(chapter - 1) % TITLES.length]}</div>
      {[0, 1, 2, 3, 4].map((p) => (
        <p key={p} style={{ fontSize: 19, lineHeight: 1.65, margin: "0 0 22px" }}>
          {[0, 1, 2].map((s) => LINES[(n * 7 + p * 3 + s) % LINES.length]).join(" ")}
        </p>
      ))}
      <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center", fontSize: 16, color: MUTED }}>{n + 1}</div>
    </div>
  );
}

const SCROLL_END = 17 * PITCH + 60;
const scrollAt = (f: number) => interpolate(f, [16, 140], [0, SCROLL_END], ease);
const FIND = { open: T.find + 4, type: T.find + 14, fail: T.find + 48 };

function Handbook() {
  const f = useCurrentFrame();
  const scrollY = scrollAt(f);
  const v = Math.abs(scrollY - scrollAt(f - 1));
  const page = Math.min(PAGES, Math.floor((scrollY + 400) / PITCH) + 1);
  const find = useEnter(FIND.open, { damping: 18, stiffness: 200 });
  const query = "carry over".slice(0, Math.max(0, Math.floor((f - FIND.type) / 3)));
  const failed = f >= FIND.fail;
  const shake = failed ? Math.sin((f - FIND.fail) * 2.2) * interpolate(f - FIND.fail, [0, 14], [14, 0], clamp) : 0;
  const first = Math.max(0, Math.floor(scrollY / PITCH) - 1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e5e5ea" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 84, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: (CARD.w - PAGE_W) / 2, top: 28 - scrollY, filter: `blur(${Math.min(4, v * 0.02)}px)` }}>
          {Array.from({ length: 4 }, (_, i) => first + i).filter((n) => n < PAGES).map((n) => (
            <div key={n} style={{ position: "absolute", top: n * PITCH }}>
              <Page n={n} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 84, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", background: "#f9f9fb", borderBottom: "1px solid #dcdce0", fontFamily: INTER, fontSize: 26 }}>
        <span style={{ fontWeight: 600, color: INK }}>Employee handbook.pdf</span>
        <span style={{ color: MUTED, fontVariantNumeric: "tabular-nums" }}>{page} / {PAGES}</span>
      </div>
      <div
        style={{
          position: "absolute", right: 24, top: 104, width: 560, height: 80, borderRadius: 20, background: "#fff",
          boxShadow: "0 12px 30px -10px rgba(0,0,0,.3)", border: `2px solid ${failed ? RED : BLUE}`,
          display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontFamily: INTER, fontSize: 32,
          opacity: find, transform: `translateY(${(1 - find) * -30}px) translateX(${shake}px)`,
        }}
      >
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round"><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5 21 21" /></svg>
        <span style={{ flex: 1, color: INK }}>
          {query}
          {!failed && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, verticalAlign: -5, background: BLUE, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />}
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: RED }}>{failed ? "0 results" : ""}</span>
      </div>
    </div>
  );
}

/* ---------- Marginalia's chat ---------- */

type Tok = { t: string; b?: boolean; cite?: boolean };
/** "**bold**" spans and "[1]" citations, word by word. */
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

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Bracket height={46} color={BLUE} />
      <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 38, lineHeight: 1, paddingBottom: 4, color: INK }}>marginalia</span>
      <Bracket height={46} color={BLUE} flip />
    </div>
  );
}

function DocIcon({ color = BLUE }: { color?: string }) {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />
    </svg>
  );
}

type ChatProps = {
  q: string;
  a: string;
  /** Frame the question starts being typed; without it, it's already sent. */
  typeAt?: number;
  sendAt: number;
  streamAt: number;
  perTok: number;
  source?: string;
  /** When the citations light up (the source is open). */
  activeAt?: number;
  file?: string;
  tapAt?: number;
  children?: ReactNode;
};

function Chat({ q, a, typeAt, sendAt, streamAt, perTok, source, activeAt = Infinity, file, tapAt, children }: ChatProps) {
  const f = useCurrentFrame();
  const answer = tokens(a);
  const typed = typeAt === undefined ? "" : q.slice(0, Math.max(0, Math.floor((f - typeAt) * 0.7)));
  const sent = f >= sendAt;
  const bubble = useEnter(sendAt, { damping: 16, stiffness: 180 });
  const shown = Math.max(0, Math.floor((f - streamAt) / perTok));
  const streaming = f >= streamAt && shown < answer.length;
  const sourcesAt = streamAt + answer.length * perTok + 8;
  const sources = useEnter(sourcesAt, { damping: 18, stiffness: 160 });
  const active = f >= activeAt;
  const tap = tapAt === undefined ? 1 : interpolate(f, [tapAt, tapAt + 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, background: WASH, fontFamily: INTER, color: INK }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark />
        {file && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, ...glassBox, fontSize: 24, fontWeight: 500 }}>
            <DocIcon />
            {file}
          </div>
        )}
      </div>
      {sent && (
        <div style={{ position: "absolute", right: 40, top: 140, maxWidth: 760, ...glassBox, background: "#fff", borderRadius: 30, padding: "18px 28px", fontSize: 34, opacity: bubble, transform: `translateY(${(1 - bubble) * 60}px) scale(${0.9 + 0.1 * bubble})`, transformOrigin: "100% 100%" }}>
          {q}
        </div>
      )}
      <div style={{ position: "absolute", left: 48, right: 56, top: 270, fontSize: 40, lineHeight: 1.55 }}>
        {answer.slice(0, shown).map((tok, i) =>
          tok.cite ? (
            <span key={i} style={{ display: "inline-grid", placeItems: "center", minWidth: 36, height: 36, padding: "0 8px", marginRight: 10, borderRadius: 999, fontSize: 20, fontWeight: 600, verticalAlign: 5, color: active ? INK : MUTED, background: active ? HIGHLIGHT : "#e6e6eb" }}>1</span>
          ) : (
            <span key={i} style={{ fontWeight: tok.b ? 600 : 400 }}>{tok.t} </span>
          ),
        )}
        {streaming && <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 99, background: MUTED, marginLeft: 4, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 6)) }} />}
      </div>
      {source && (
        <div style={{ position: "absolute", left: 48, right: 56, top: 600, height: 84, borderRadius: 26, ...glassBox, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 28, opacity: sources, transform: `translateY(${(1 - sources) * 30}px) scale(${1 - 0.03 * Math.sin(Math.PI * tap)})` }}>
          <span style={{ fontWeight: 600 }}>1 source</span>
          <span style={{ color: MUTED, flex: 1 }}>{source}</span>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${active ? 180 : 0}deg)` }}><path d="m6 9 6 6 6-6" /></svg>
          {tap > 0 && tap < 1 && (
            <div style={{ position: "absolute", left: 430, top: 2, width: 80, height: 80, borderRadius: 99, background: "rgba(0,0,0,.18)", transform: `scale(${0.4 + tap})`, opacity: 1 - tap }} />
          )}
        </div>
      )}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, height: 96, borderRadius: 48, ...glassBox, display: "flex", alignItems: "center", padding: "0 14px 0 34px", fontSize: 32 }}>
        <span style={{ flex: 1, color: !sent && typed ? INK : MUTED }}>
          {!sent && typed ? typed : "Ask about your documents"}
          {!sent && typed && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, verticalAlign: -5, background: BLUE }} />}
        </span>
        <div style={{ width: 66, height: 66, borderRadius: 99, background: BLUE, display: "grid", placeItems: "center", transform: `scale(${f >= sendAt - 3 && f < sendAt + 3 ? 0.88 : 1})` }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </div>
      </div>
      {children}
    </div>
  );
}

/* 2. The fix, then the source: page 31 rises, the line highlighted, a bracket in the margin. */
const ASK = { typeAt: 30, sendAt: 80, streamAt: 96, perTok: 3, tapAt: 240 };
function SourceSheet() {
  const f = useCurrentFrame();
  const at = ASK.tapAt;
  const rise = interpolate(f, [at + 6, at + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const mark = interpolate(f, [at + 30, at + 48], [0, 1], ease);
  const bracket = interpolate(f, [at + 46, at + 58], [0, 1], clamp);
  const note = interpolate(f, [at + 58, at + 78], [0, 1], clamp);
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

const Ask = () => (
  <Chat
    q="Does unused leave carry over?"
    a="Yes. Up to **5 unused days** roll over to the next year. [1] Anything above that is forfeited on 31 December. [1]"
    {...ASK}
    source="Employee handbook, page 31"
    activeAt={ASK.tapAt + 4}
  >
    <SourceSheet />
  </Chat>
);

/* 3. What you could use it for. */
const USES: { file: string; q: string; a: string; source: string }[] = [
  { file: "ECON 101 – Lecture 4.pdf", q: "What causes inflation?", a: "Mostly **too much money chasing too few goods,** [1] or rising costs like wages and energy passed on in prices. [1]", source: "ECON 101 – Lecture 4, slide 12" },
  { file: "Lease agreement.pdf", q: "Can I have a cat?", a: "Yes, with your **landlord's written permission.** [1] A one-time pet deposit of $300 applies. [1]", source: "Lease agreement, page 6" },
  { file: "IT onboarding.docx", q: "Which VPN do I set up in week one?", a: "**GlobalProtect.** Install it from the Self Service app on your first day. [1]", source: "IT onboarding, page 2" },
];
const Use = ({ i }: { i: number }) => {
  const u = USES[i];
  const n = tokens(u.a).length;
  return <Chat {...u} sendAt={2} streamAt={12} perTok={1.7} activeAt={12 + n * 1.7 + 12} />;
};

/* 4. The doc builder: write Markdown, watch it render, save, and it's searchable. */
const NOTE = "# Team offsite\n\nThe bus leaves at **7:00** on the 14th.\n\n## Bring\n- [ ] Laptop and charger\n- [ ] Something warm\n- [ ] Your Q4 goals";
const BUILD = { type: 24, rate: 1.4, save: 132, ready: 166 };
const CHECKLIST_AT = BUILD.type + NOTE.indexOf("- [ ]") / BUILD.rate;
const ICONS: (string | null)[] = [
  "H", "B", "I", "S", null,
  "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  "m16 18 6-6-6-6 M8 6l-6 6 6 6", null,
  "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  "m3 17 2 2 4-4 M3 7l2 2 4-4 M13 6h8 M13 12h8 M13 18h8", null,
  "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18",
];
const CHECK_ICON = 9;

function Rich({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/).map((s, i) => (s.startsWith("**") && s.endsWith("**") && s.length > 4 ? <b key={i} style={{ fontWeight: 600 }}>{s.slice(2, -2)}</b> : s))}</>;
}
function Preview({ md }: { md: string }) {
  return (
    <>
      {md.split("\n").map((l, i) => {
        if (l.startsWith("# ")) return <div key={i} style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px" }}>{l.slice(2)}</div>;
        if (l.startsWith("## ")) return <div key={i} style={{ fontSize: 31, fontWeight: 600, margin: "18px 0 10px" }}>{l.slice(3)}</div>;
        if (l.startsWith("- [ ]")) return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 27, margin: "6px 0" }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid #c7c7cc", flexShrink: 0 }} />
            {l.slice(6)}
          </div>
        );
        if (!l.trim() || l.startsWith("#") || l.startsWith("-")) return null;
        return <div key={i} style={{ fontSize: 27, lineHeight: 1.5 }}><Rich text={l} /></div>;
      })}
    </>
  );
}

function Builder() {
  const f = useCurrentFrame();
  const typed = NOTE.slice(0, Math.max(0, Math.floor((f - BUILD.type) * BUILD.rate)));
  const pressed = (at: number) => f >= at && f < at + 8;
  const saving = f >= BUILD.save && f < BUILD.ready;
  const ready = f >= BUILD.ready;
  const readyPop = useEnter(BUILD.ready, { damping: 12, stiffness: 200 });
  return (
    <div style={{ position: "absolute", inset: 0, background: WASH, fontFamily: INTER, color: INK }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 34, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
        <span style={{ color: BLUE, fontWeight: 500 }}>‹ Library</span>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: ready ? GREEN : MUTED, fontWeight: ready ? 600 : 400, transform: ready ? `scale(${0.8 + 0.2 * readyPop})` : undefined }}>
            {saving && <span style={{ width: 14, height: 14, borderRadius: 99, background: AMBER, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 5)) }} />}
            {ready ? "✓ Ready to ask" : saving ? "Indexing…" : typed ? "Unsaved changes" : ""}
          </span>
          <span style={{ padding: "12px 30px", borderRadius: 999, background: BLUE, color: "#fff", fontWeight: 600, transform: `scale(${pressed(BUILD.save - 4) ? 0.9 : 1})` }}>Save</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: 118, fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em" }}>Team offsite</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 200, bottom: 30, borderRadius: 32, background: "rgba(255,255,255,.88)", border: `2px solid ${BLUE}`, overflow: "hidden", boxShadow: "0 0 0 6px rgba(0,122,255,.12)" }}>
        {/* Toolbar */}
        <div style={{ height: 72, display: "flex", alignItems: "center", gap: 6, padding: "0 20px", borderBottom: "1px solid #e5e5ea" }}>
          {ICONS.map((d, i) =>
            d === null ? (
              <span key={i} style={{ width: 1, height: 30, background: "#e5e5ea", margin: "0 8px" }} />
            ) : (
              <span key={i} style={{ width: 50, height: 50, borderRadius: 12, display: "grid", placeItems: "center", background: i === CHECK_ICON && pressed(CHECKLIST_AT - 4) ? "rgba(0,122,255,.15)" : undefined, color: "#48484a", fontSize: 26, fontWeight: d === "B" ? 800 : 600, fontStyle: d === "I" ? "italic" : undefined, textDecoration: d === "S" ? "line-through" : undefined }}>
                {d.length === 1 ? d : <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={i === CHECK_ICON && pressed(CHECKLIST_AT - 4) ? BLUE : "#48484a"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>}
              </span>
            ),
          )}
        </div>
        {/* Markdown */}
        <div style={{ height: 330, padding: "22px 30px", fontFamily: MONO, fontSize: 22, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "#3a3a3c", borderBottom: "1px solid #e5e5ea" }}>
          {typed}
          {!ready && <span style={{ display: "inline-block", width: 3, height: 28, verticalAlign: -6, background: BLUE, opacity: f > BUILD.save || Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} />}
        </div>
        {/* Live preview */}
        <div style={{ padding: "24px 30px" }}>
          <Preview md={typed} />
        </div>
      </div>
    </div>
  );
}

/* 5. Honesty. */
const Honest = () => <Chat q="What's the parental leave policy?" a="I couldn't find it in your documents." sendAt={4} streamAt={20} perTok={3} />;

/* ---------- 6. How to start, and the call to action ---------- */

const STEPS: [string, string][] = [
  ["Sign up", "Just an email and a password"],
  ["Add your files", "PDFs, Word docs or your own notes"],
  ["Ask anything", "Every answer shows its source"],
];
function Steps({ wide }: { wide: boolean }) {
  const head = useEnter(0, { damping: 18, stiffness: 140 });
  const p = [useEnter(14, { damping: 16, stiffness: 140 }), useEnter(28, { damping: 16, stiffness: 140 }), useEnter(42, { damping: 16, stiffness: 140 })];
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: INTER, color: INK }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: wide ? 190 : 420, textAlign: "center", fontSize: 70, fontWeight: 700, letterSpacing: "-0.02em", opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        Start in under a minute.
      </div>
      {STEPS.map(([title, sub], i) => (
        <div key={title} style={{ position: "absolute", left: wide ? 600 : 130, right: 100, top: (wide ? 370 : 640) + i * (wide ? 180 : 200), display: "flex", alignItems: "center", gap: 36, opacity: p[i], transform: `translateX(${(1 - p[i]) * 160}px)` }}>
          <div style={{ width: 104, height: 104, borderRadius: 99, background: BLUE, color: "#fff", display: "grid", placeItems: "center", fontSize: 50, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
          <div>
            <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</div>
            <div style={{ fontSize: 32, color: MUTED, marginTop: 6 }}>{sub}</div>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
}

function Cta({ wide }: { wide: boolean }) {
  const frame = useCurrentFrame();
  const mark = useEnter(4, { damping: 16, stiffness: 120 });
  const note = interpolate(frame, [20, 34], [0, 1], clamp);
  const line = useEnter(30);
  const url = useEnter(40, { damping: 12, stiffness: 160 });
  const credit = useEnter(54);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: wide ? 250 : 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: mark, transform: `translateY(${(1 - mark) * 40}px)` }}>
        <Bracket height={170} color={BLUE} />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 138, color: INK, lineHeight: 1, paddingBottom: 12 }}>marginalia</span>
        <Bracket height={170} color={BLUE} flip />
      </div>
      <div style={{ position: "absolute", left: wide ? 900 : 470, top: wide ? 430 : 820, fontFamily: CAVEAT, fontSize: 60, color: BLUE, transform: "rotate(-3deg)", clipPath: `inset(0 ${(1 - note) * 100}% 0 0)` }}>
        notes in the margin
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wide ? 600 : 1010, textAlign: "center", fontFamily: INTER, fontSize: 50, fontWeight: 700, letterSpacing: "-0.01em", color: INK, opacity: line, transform: `translateY(${(1 - line) * 20}px)` }}>
        Try it with your own documents.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wide ? 700 : 1110, display: "flex", justifyContent: "center", opacity: url, transform: `scale(${0.8 + 0.2 * url})` }}>
        <div style={{ padding: "24px 46px", borderRadius: 999, background: BLUE, color: "#fff", fontFamily: INTER, fontWeight: 600, fontSize: 46, boxShadow: "0 20px 40px -16px rgba(0,122,255,.6)" }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wide ? 860 : 1260, textAlign: "center", fontFamily: INTER, fontSize: 30, color: MUTED, opacity: credit }}>
        Designed and built by Ace Guevarra
      </div>
    </AbsoluteFill>
  );
}

/* ---------- the film ---------- */

const SLIDE = 18;
const SLIDES: [from: number, el: () => ReactNode][] = [
  [0, () => <Handbook />],
  [T.ask, () => <Ask />],
  [T.uses, () => <Use i={0} />],
  [T.uses + USE_LEN, () => <Use i={1} />],
  [T.uses + USE_LEN * 2, () => <Use i={2} />],
  [T.build, () => <Builder />],
  [T.honest, () => <Honest />],
];

/** The screen: each scene slides in from the right as the last slides off left. */
function Screen({ wide }: { wide: boolean }) {
  const f = useCurrentFrame();
  const enter = useEnter(0, { damping: 18, stiffness: 120 });
  const out = interpolate(f, [T.steps - 12, T.steps + 2], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: wide ? 1010 : CARD.x, top: wide ? 70 : CARD.y, scale: wide ? 0.885 : 1, transformOrigin: "0 0", width: CARD.w, height: CARD.h, borderRadius: 48, overflow: "hidden", border: "1px solid #e3e3e8", background: "#fff", boxShadow: "0 40px 90px -40px rgba(20,20,40,.45)", transform: `translateY(${(1 - enter) * 200 + out * 120}px) scale(${0.96 + 0.04 * enter})`, opacity: (1 - out) * Math.min(1, enter * 2) }}>
      {SLIDES.map(([from, el], i) => {
        const to = SLIDES[i + 1]?.[0] ?? T.steps;
        const x = interpolate(f, [from, from + SLIDE], [from ? 100 : 0, 0], ease) + interpolate(f, [to, to + SLIDE], [0, -100], ease);
        return (
          <Sequence key={from} from={from} durationInFrames={to - from + SLIDE} layout="none">
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${x}%)` }}>{el()}</div>
          </Sequence>
        );
      })}
    </div>
  );
}

const CAPTIONS: [from: number, to: number, lines: [number, string][]][] = [
  [0, T.find, [[6, "That one answer you need"], [14, "is buried in a 40-page PDF."]]],
  [T.find, T.ask, [[14, "Ctrl+F “carry over”"], [FIND.fail - T.find, "0 results."], [FIND.fail - T.find + 26, "(the handbook says “roll over”)"]]],
  [T.ask, T.ask + 96, [[8, "Just ask it,"], [16, "like you'd ask a person."]]],
  [T.ask + 96, T.ask + ASK.tapAt, [[6, "Marginalia gets what you mean,"], [14, "not just the words you typed."]]],
  [T.ask + ASK.tapAt, T.uses, [[6, "And every answer shows"], [12, "exactly where it came from."]]],
  [T.uses, T.uses + USE_LEN, [[4, "Use it on your lecture notes."]]],
  [T.uses + USE_LEN, T.uses + USE_LEN * 2, [[4, "Your lease."]]],
  [T.uses + USE_LEN * 2, T.build, [[4, "Your work docs."]]],
  [T.build, T.build + BUILD.save - 10, [[6, "Or write your own docs"], [12, "right inside it."]]],
  [T.build + BUILD.save - 10, T.honest, [[4, "Hit save, and you can"], [10, "ask it straight away."]]],
  [T.honest, T.steps, [[6, "Not in your files?"], [40, "It tells you."], [56, "No made-up answers."]]],
];

const ticks = (from: number, n: number, every: number, volume = 0.22): Cue[] => Array.from({ length: n }, (_, i) => [Math.round(from + i * every), `tick${(i % 3) + 1}`, volume]);
const CUES: Cue[] = [
  [6, "pop", 0.4],
  [14, "pop", 0.35],
  [20, "whoosh", 0.35],
  [FIND.open, "pop", 0.4],
  ...ticks(FIND.type + 3, 10, 3),
  [FIND.fail, "alert", 0.55],
  [T.ask, "whoosh", 0.5],
  ...ticks(T.ask + ASK.typeAt, 10, 4.2),
  [T.ask + ASK.sendAt, "pop", 0.5],
  [T.ask + ASK.tapAt, "tick2", 0.5],
  [T.ask + ASK.tapAt + 8, "paper", 0.8],
  [T.ask + ASK.tapAt + 30, "tick1", 0.4],
  [T.ask + ASK.tapAt + 58, "tick3", 0.4],
  ...[0, 1, 2].flatMap((i): Cue[] => [[T.uses + i * USE_LEN, "whoosh", 0.4], [T.uses + i * USE_LEN + 4, "pop", 0.4]]),
  [T.build, "whoosh", 0.45],
  ...ticks(T.build + BUILD.type, 20, 4, 0.15),
  [T.build + CHECKLIST_AT - 4, "pop", 0.35],
  [T.build + BUILD.save - 4, "pop", 0.5],
  [T.build + BUILD.ready, "tick3", 0.6],
  [T.honest, "whoosh", 0.45],
  [T.honest + 4, "pop", 0.4],
  [T.honest + 20, "paper", 0.5],
  [T.steps - 8, "whoosh", 0.5],
  [T.steps + 14, "pop", 0.45],
  [T.steps + 28, "pop", 0.45],
  [T.steps + 42, "pop", 0.45],
  [T.cta - 4, "whoosh", 0.45],
  [T.cta + 4, "chime", 0.7],
];

/** `wide`: the 16:9 cut for Facebook, with captions left of the screen. */
export function MarginaliaTikTok({ wide = false }: { wide?: boolean }) {
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Sequence durationInFrames={T.steps + 2} layout="none">
        <Screen wide={wide} />
      </Sequence>
      {CAPTIONS.map(([from, to, lines]) => (
        <Sequence key={from} from={from} durationInFrames={to - from} layout="none">
          <Caption lines={lines} wide={wide} />
        </Sequence>
      ))}
      <Sequence from={T.steps} durationInFrames={T.cta - T.steps}><Steps wide={wide} /></Sequence>
      <Sequence from={T.cta}><Cta wide={wide} /></Sequence>
      {/* The drop lands as the question goes to Marginalia. */}
      <Soundtrack dropAt={T.ask + ASK.sendAt} duration={MARGINALIA_TIKTOK_DURATION} cues={CUES} musicVolume={0.4} />
    </AbsoluteFill>
  );
}
