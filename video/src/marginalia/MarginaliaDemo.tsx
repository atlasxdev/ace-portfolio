import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { BrowserFrame, type Cue, GEIST, INK, INK_SOFT, SHADOW, Soundtrack, Stage, TitleCard, useEnter, Words } from "../kit";

/** Marginalia's own blue, and the soft grey its glass sits on. */
const BLUE = "#007aff";
const BACKDROP = "#f2f3f7";
const { fontFamily: BODONI } = loadBodoni("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: CAVEAT } = loadCaveat("normal", { weights: ["500"], subsets: ["latin"] });
const headline = { fontSize: 88, color: INK } as const;

/** The app's background: a pale wash of blue and lilac, like its glass shows through. */
const WASH = `radial-gradient(60% 70% at 0% 0%, rgba(0,122,255,.16), transparent 60%), radial-gradient(50% 60% at 100% 10%, rgba(175,82,222,.12), transparent 60%), radial-gradient(60% 60% at 50% 110%, rgba(90,200,250,.16), transparent 60%), ${BACKDROP}`;

// The hand-drawn bracket from Marginalia's logo
const BRACKET =
  "M16 3c-5 .5-9 0-11.5.8C3.4 20 4.6 50 3.6 70c-.3 9 .6 18 .2 26 3.6.8 8 .2 12.2.6l.4-5c-2.6-.4-5.2 0-7.6-.4.5-8-.3-17 .1-25 .6-19-.3-42 .4-58 2.4-.4 5 .1 7.2-.3z";
function Bracket({ height, color, flip, style }: { height: number; color: string; flip?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 100" style={{ height, width: height * 0.2, transform: flip ? "scaleX(-1)" : undefined, ...style }}>
      <path d={BRACKET} fill={color} />
    </svg>
  );
}

/**
 * A crop of a 2x screenshot (2880x1800), shown `width` stage pixels wide on a
 * glass card. `crop` is [x, y, w, h] in screenshot pixels.
 */
const SHOT_W = 2880;
function Shot({ file, crop, width, style, children }: { file: string; crop: [number, number, number, number]; width: number; style?: React.CSSProperties; children?: React.ReactNode }) {
  const [x, y, w, h] = crop;
  const k = width / w;
  return (
    <div style={{ position: "absolute", width, height: h * k, borderRadius: 28, overflow: "hidden", boxShadow: SHADOW, border: "1px solid rgba(255,255,255,.8)", background: BACKDROP, ...style }}>
      <Img src={staticFile(`marginalia/ui/${file}.png`)} style={{ position: "absolute", width: SHOT_W * k, left: -x * k, top: -y * k }} />
      {children}
    </div>
  );
}

// Every frame is real: a demo account with an employee handbook, a refund policy, an onboarding checklist and one note.
const S = {
  open: [0, 75],
  ask: [75, 180],
  sources: [255, 120],
  edit: [375, 120],
  honest: [495, 105],
  outro: [600, 120],
} as const;
export const MARGINALIA_DURATION = 720;

const Open = () => (
  <TitleCard bg={BLUE} exitAt={62} lines={[["The answer is somewhere", "rgba(255,255,255,.65)"], ["in your documents.", "#fff"]]} size={110} />
);

/* 2. Live: ask in plain words, the answer streams in, the source opens. */
function Ask() {
  const frame = useCurrentFrame();
  const enter = useEnter(0, { damping: 20, stiffness: 80 });
  const turn = interpolate(frame, [0, 180], [-12, -5]);
  return (
    <Stage bg={WASH}>
      <div style={{ position: "absolute", left: 160, top: 360, width: 560 }}>
        <Words text="Ask your documents anything." style={{ ...headline, width: 560, fontSize: 84 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <BrowserFrame label="marginalia.aceguevarra.xyz" style={{ left: 780, top: 180, width: 1080, transform: `translateX(${(1 - enter) * 900}px) rotateY(${turn}deg)` }}>
          <OffthreadVideo src={staticFile("marginalia/footage/ask.webm")} trimBefore={60} playbackRate={1.9} muted style={{ width: "100%", display: "block" }} />
        </BrowserFrame>
      </div>
    </Stage>
  );
}

/* 3. The citations, and a margin bracket drawn beside the passage they point to. */
const SRC_W = 1400;
const SRC_K = SRC_W / 1500;
const CHIPS: [number, number][] = [
  [186, 98],
  [1386, 182],
];
function Sources() {
  const frame = useCurrentFrame();
  const rise = useEnter(4, { damping: 20, stiffness: 80 });
  const bracket = interpolate(frame, [52, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage bg={WASH}>
      <div style={{ position: "absolute", left: 160, top: 110 }}>
        <Words text="Every answer shows its source." style={{ ...headline, width: 1600 }} />
      </div>
      <Shot file="sources" crop={[950, 475, 1500, 675]} width={SRC_W} style={{ left: 260, top: 320, transform: `translateY(${(1 - rise) * 500}px)` }}>
        {CHIPS.map(([x, y], i) => {
          const p = interpolate(frame, [22 + i * 12, 46 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{ position: "absolute", left: x * SRC_K - 30, top: y * SRC_K - 30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${BLUE}`, opacity: 1 - p, transform: `scale(${0.5 + p})` }}
            />
          );
        })}
      </Shot>
      {/* A note in the margin: the bracket from the logo, marking the cited passage */}
      <div style={{ position: "absolute", left: 200, top: 320 + 425 * SRC_K, transform: `scaleY(${bracket})`, transformOrigin: "top" }}>
        <Bracket height={210 * SRC_K * 1.1} color={BLUE} />
      </div>
    </Stage>
  );
}

/* 4. The editor: write in Markdown, see it rendered, save and it's searchable. */
function Edit() {
  const enter = useEnter(4, { damping: 20, stiffness: 80 });
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 120], [0, -40]);
  return (
    <Stage bg={WASH}>
      <div style={{ position: "absolute", left: 160, top: 110 }}>
        <Words text="Write notes. Search keeps up." style={{ ...headline, width: 1600 }} />
      </div>
      <Shot file="editor" crop={[590, 250, 2210, 1050]} width={1500} style={{ left: 210, top: 300 + drift, transform: `translateX(${(1 - enter) * 1200}px)` }} />
    </Stage>
  );
}

/* 5. Honesty: no answer in the documents, no made-up answer. */
function Honest() {
  const rise = useEnter(10, { damping: 18, stiffness: 90 });
  const note = useEnter(34);
  return (
    <Stage bg={WASH}>
      <div style={{ position: "absolute", left: 160, top: 150 }}>
        <Words text="And when it doesn't know, it says so." style={{ ...headline, width: 1600 }} />
      </div>
      <Shot file="partial" crop={[950, 190, 1490, 260]} width={1400} style={{ left: 260, top: 470, transform: `translateY(${(1 - rise) * 400}px)` }} />
      <div style={{ position: "absolute", left: 260, top: 760, fontSize: 36, color: INK_SOFT, fontFamily: GEIST, opacity: note, transform: `translateY(${(1 - note) * 20}px)` }}>
        Answers come only from your files. No guessing.
      </div>
    </Stage>
  );
}

/* 6. The wordmark, in white on the app's blue. */
function Outro() {
  const mark = useEnter(4, { damping: 16, stiffness: 120 });
  const note = interpolate(useCurrentFrame(), [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sub = useEnter(30);
  const credit = useEnter(44);
  return (
    <Stage bg={BLUE}>
      <div style={{ position: "absolute", left: 160, top: 250, display: "flex", alignItems: "center", gap: 18, opacity: mark, transform: `translateY(${(1 - mark) * 40}px)` }}>
        <Bracket height={210} color="#fff" />
        <span style={{ fontFamily: BODONI, fontWeight: 600, fontSize: 170, color: "#fff", lineHeight: 1, paddingBottom: 14 }}>marginalia</span>
        <Bracket height={210} color="#fff" flip />
      </div>
      <div style={{ position: "absolute", left: 640, top: 470, fontFamily: CAVEAT, fontSize: 64, color: "rgba(255,255,255,.9)", transform: "rotate(-3deg)", clipPath: `inset(0 ${(1 - note) * 100}% 0 0)` }}>
        notes in the margin
      </div>
      <div style={{ position: "absolute", left: 160, top: 640, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`, fontFamily: GEIST }}>
        <div style={{ fontSize: 40, color: "rgba(255,255,255,.88)" }}>Ask your documents. Every answer cites its source.</div>
        <div style={{ fontSize: 34, color: "#fff", fontWeight: 500, marginTop: 14 }}>marginalia.aceguevarra.xyz</div>
      </div>
      <div style={{ position: "absolute", left: 160, bottom: 90, fontSize: 26, color: "rgba(255,255,255,.65)", opacity: credit, fontFamily: GEIST }}>
        Designed and built by Ace Guevarra
      </div>
    </Stage>
  );
}

const CUES: Cue[] = [
  [70, "whoosh", 0.5],
  [S.ask[0] + 40, "pop", 0.45],
  [250, "whoosh", 0.45],
  [S.sources[0] + 14, "paper", 0.8],
  [S.sources[0] + 22, "tick1", 0.5],
  [S.sources[0] + 34, "tick2", 0.5],
  [S.sources[0] + 54, "tick3", 0.5],
  [370, "whoosh", 0.45],
  [S.edit[0] + 18, "paper", 0.7],
  [490, "whoosh", 0.45],
  [S.honest[0] + 22, "paper", 0.7],
  [595, "whoosh", 0.5],
  [S.outro[0] + 4, "chime", 0.7],
];

export function MarginaliaDemo() {
  return (
    <AbsoluteFill style={{ background: BACKDROP }}>
      <Sequence from={S.open[0]} durationInFrames={S.open[1]}><Open /></Sequence>
      <Sequence from={S.ask[0]} durationInFrames={S.ask[1]}><Ask /></Sequence>
      <Sequence from={S.sources[0]} durationInFrames={S.sources[1]}><Sources /></Sequence>
      <Sequence from={S.edit[0]} durationInFrames={S.edit[1]}><Edit /></Sequence>
      <Sequence from={S.honest[0]} durationInFrames={S.honest[1]}><Honest /></Sequence>
      <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}><Outro /></Sequence>
      <Soundtrack dropAt={S.ask[0]} duration={MARGINALIA_DURATION} cues={CUES} />
    </AbsoluteFill>
  );
}
