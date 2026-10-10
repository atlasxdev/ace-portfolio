import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { type Cue, GEIST, Soundtrack, useEnter, Words } from "../kit";
import { BACKDROP, BLUE, BODONI, Bracket, CAVEAT, Shot } from "./MarginaliaDemo";

/*
 * The Marginalia film, recut 9:16 for TikTok from the same footage and stills.
 * Dark around the footage so TikTok's white overlay text stays readable, and
 * nothing important in the top 220px or the bottom ~260px, where its UI sits.
 */

const SITE = "marginalia.aceguevarra.xyz";
const NIGHT = "#121214";
const FG = "#f5f5f4", FG_SOFT = "#a3a3a3";
// Captions sit above a 1000px-wide window of footage.
const CAPTION_TOP = 340;
const WIN = { x: 40, y: 600, w: 1000 } as const;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const S = {
  ask: [0, 180],
  sources: [180, 120],
  edit: [300, 130],
  honest: [430, 100],
  outro: [530, 100],
} as const;
export const MARGINALIA_TIKTOK_DURATION = 630;

function Caption({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: CAPTION_TOP }}>
      <Words text={text} delay={delay} stagger={2} style={{ fontSize: 78, color: FG, lineHeight: 1.05 }} />
    </div>
  );
}

const glass = { position: "absolute", borderRadius: 40, overflow: "hidden", border: "1px solid #2e2e33", boxShadow: "0 40px 90px -30px rgba(0,0,0,.8)" } as const;

/* 1. Live: ask in plain words, the answer streams in, the source opens. Cropped to the chat column. */
const COL = { x: 440, w: 820, y: 20 }; // CSS px of the 1440x900 recording
function Ask() {
  const pop = useEnter(0, { damping: 16, stiffness: 200 });
  const k = WIN.w / COL.w;
  return (
    <>
      <Caption text="Ask your documents anything." />
      <div style={{ ...glass, left: WIN.x, top: WIN.y, width: WIN.w, height: 1060, background: BACKDROP, transform: `scale(${0.96 + 0.04 * pop})` }}>
        <OffthreadVideo
          src={staticFile("marginalia/footage/ask.webm")}
          trimBefore={60}
          playbackRate={1.9}
          muted
          style={{ position: "absolute", width: 1440 * k, left: -COL.x * k, top: -COL.y * k }}
        />
      </div>
    </>
  );
}

/* 2. The answer, then its source rising underneath, with the logo's bracket drawn beside the cited passage. */
const ANSWER: [number, number, number, number] = [930, 470, 1540, 235];
const SOURCE: [number, number, number, number] = [960, 745, 1480, 400];
const CARD_W = 1000;
function Sources() {
  const frame = useCurrentFrame();
  const a = useEnter(2, { damping: 20, stiffness: 90 });
  const s = useEnter(14, { damping: 20, stiffness: 90 });
  const ka = CARD_W / ANSWER[2], ks = CARD_W / SOURCE[2];
  const bracket = interpolate(frame, [44, 60], [0, 1], clamp);
  // Citation chips in the answer, in screenshot px
  const chips: [number, number][] = [[1137, 570], [2337, 654]];
  return (
    <>
      <Caption text="Every answer shows its source." />
      <Shot file="sources" crop={ANSWER} width={CARD_W} style={{ left: WIN.x, top: 640, borderRadius: 32, transform: `translateY(${(1 - a) * 900}px)` }}>
        {chips.map(([x, y], i) => {
          const p = interpolate(frame, [30 + i * 10, 54 + i * 10], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{ position: "absolute", left: (x - ANSWER[0]) * ka - 30, top: (y - ANSWER[1]) * ka - 30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${BLUE}`, opacity: p > 0 ? 1 - p : 0, transform: `scale(${0.5 + p})` }}
            />
          );
        })}
      </Shot>
      <Shot file="sources" crop={SOURCE} width={CARD_W} style={{ left: WIN.x, top: 640 + ANSWER[3] * ka + 40, borderRadius: 32, transform: `translateY(${(1 - s) * 900}px)` }}>
        {/* A note in the margin, beside the highlighted passage */}
        <div style={{ position: "absolute", left: 14, top: (915 - SOURCE[1]) * ks, transform: `scaleY(${bracket})`, transformOrigin: "top" }}>
          <Bracket height={180 * ks} color={BLUE} />
        </div>
      </Shot>
    </>
  );
}

/* 3. The editor: the camera pans from the Markdown to its preview. */
function Edit() {
  const frame = useCurrentFrame();
  const pop = useEnter(0, { damping: 16, stiffness: 200 });
  const H = 1020;
  const k = WIN.w / 1100; // screen px per screenshot px
  const x = interpolate(frame, [34, 84], [600, 1690], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <Caption key={frame < 60 ? 0 : 1} text={frame < 60 ? "Write notes in Markdown." : "Save, and search keeps up."} delay={frame < 60 ? 0 : 60} />
      <div style={{ ...glass, left: WIN.x, top: WIN.y, width: WIN.w, height: H, background: BACKDROP, transform: `scale(${0.96 + 0.04 * pop})` }}>
        <Img src={staticFile("marginalia/ui/editor.png")} style={{ position: "absolute", width: 2880 * k, left: -x * k, top: -270 * k }} />
      </div>
    </>
  );
}

/* 4. Honesty: no answer in the documents, no made-up answer. */
function Honest() {
  const ask = useEnter(4, { damping: 18, stiffness: 90 });
  const rise = useEnter(16, { damping: 18, stiffness: 90 });
  const note = useEnter(38);
  return (
    <>
      <Caption text="And when it doesn't know, it says so." />
      {/* The question and the reply, as two bubbles of the real chat */}
      <Shot file="partial" crop={[1866, 222, 543, 78]} width={640} style={{ right: 40, top: 712, borderRadius: 46, transform: `translateX(${(1 - ask) * 800}px)` }} />
      <Shot file="partial" crop={[945, 345, 620, 105]} width={680} style={{ left: 40, top: 880, borderRadius: 32, transform: `translateY(${(1 - rise) * 900}px)` }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1060, fontFamily: GEIST, fontSize: 40, lineHeight: 1.3, color: FG_SOFT, opacity: note, transform: `translateY(${(1 - note) * 20}px)` }}>
        Answers come only from your files. No guessing.
      </div>
    </>
  );
}

/* 5. The wordmark, in white on the app's blue. */
function Outro() {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 10], [0, 1], clamp);
  const mark = useEnter(4, { damping: 16, stiffness: 120 });
  const note = interpolate(frame, [20, 34], [0, 1], clamp);
  const url = useEnter(32, { damping: 12, stiffness: 160 });
  const credit = useEnter(44);
  return (
    <AbsoluteFill style={{ background: BLUE, clipPath: `circle(${bg * 150}% at 50% 50%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: mark, transform: `translateY(${(1 - mark) * 40}px)` }}>
        <Bracket height={170} color="#fff" />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 138, color: "#fff", lineHeight: 1, paddingBottom: 12 }}>marginalia</span>
        <Bracket height={170} color="#fff" flip />
      </div>
      <div style={{ position: "absolute", left: 470, top: 900, fontFamily: CAVEAT, fontSize: 60, color: "rgba(255,255,255,.9)", transform: "rotate(-3deg)", clipPath: `inset(0 ${(1 - note) * 100}% 0 0)` }}>
        notes in the margin
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", justifyContent: "center", opacity: url, transform: `scale(${0.8 + 0.2 * url})` }}>
        <div style={{ padding: "20px 40px", borderRadius: 999, background: "#fff", color: BLUE, fontFamily: GEIST, fontWeight: 600, fontSize: 44 }}>{SITE}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1220, textAlign: "center", fontFamily: GEIST, fontSize: 32, color: "rgba(255,255,255,.7)", opacity: credit }}>
        Designed and built by Ace Guevarra
      </div>
    </AbsoluteFill>
  );
}

/** Pinned until the outro: where to find it. */
function SiteTag() {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 220, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(frame, [S.outro[0], S.outro[0] + 8], [1, 0], clamp) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: "#26262b", color: FG, fontFamily: GEIST, fontWeight: 500, fontSize: 34 }}>
        <span style={{ width: 14, height: 14, borderRadius: 99, background: BLUE }} />
        {SITE}
      </div>
    </div>
  );
}

const CUES: Cue[] = [
  [40, "pop", 0.45],
  [S.sources[0] - 4, "whoosh", 0.45],
  [S.sources[0] + 4, "paper", 0.8],
  [S.sources[0] + 16, "paper", 0.6],
  [S.sources[0] + 30, "tick1", 0.5],
  [S.sources[0] + 40, "tick2", 0.5],
  [S.sources[0] + 46, "tick3", 0.5],
  [S.edit[0] - 4, "whoosh", 0.45],
  [S.edit[0] + 34, "whoosh", 0.3],
  [S.honest[0] - 4, "whoosh", 0.45],
  [S.honest[0] + 10, "paper", 0.7],
  [S.outro[0] - 4, "whoosh", 0.5],
  [S.outro[0] + 4, "chime", 0.7],
];

export function MarginaliaTikTok() {
  const scenes = [
    [S.ask, <Ask />],
    [S.sources, <Sources />],
    [S.edit, <Edit />],
    [S.honest, <Honest />],
    [S.outro, <Outro />],
  ] as const;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {scenes.map(([[from, len], el], i) => (
        <Sequence key={i} from={from} durationInFrames={len}>{el}</Sequence>
      ))}
      <SiteTag />
      <Soundtrack dropAt={S.sources[0]} duration={MARGINALIA_TIKTOK_DURATION} cues={CUES} />
    </AbsoluteFill>
  );
}
