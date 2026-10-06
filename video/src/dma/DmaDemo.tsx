import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BrowserFrame,
  CLASH,
  type Cue,
  GEIST,
  INK,
  PAPER,
  Soundtrack,
  Stage,
  TitleCard,
  useEnter,
  Words,
} from "../kit";

/** The app's own red (its Get Feedback button) and the blue of its answers. */
const RED = "#ff3132";
const BLUE = "#1a5cf2";
const ui = (f: string) => staticFile(`dma/ui/dma-${f}.png`);
const headline = { fontSize: 88, color: INK } as const;
/** The app's look: hard black border, offset black shadow. */
const BRUTAL = { border: `3px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, background: "#fff" } as const;

// Every frame is real output: one query on the live site, Sinigang na baboy with rice.
const S = {
  open: [0, 75],
  ask: [75, 150],
  analysis: [225, 120],
  swaps: [345, 120],
  plate: [465, 90],
  outro: [555, 105],
} as const;
export const DMA_DURATION = 660;

const Open = () => (
  <TitleCard bg={RED} exitAt={62} lines={[["Living with diabetes means", "rgba(255,255,255,.7)"], ["second-guessing every meal.", "#fff"]]} size={104} />
);

/* 2. Live: type a meal the way you'd say it, get feedback. */
function Ask() {
  const frame = useCurrentFrame();
  const enter = useEnter(0, { damping: 20, stiffness: 80 });
  const turn = interpolate(frame, [0, 150], [-12, -5]);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 380, width: 560 }}>
        <Words text="Describe any meal, in your own words." style={{ ...headline, width: 560, fontSize: 80 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <BrowserFrame label="diabetes-meal-assistant.vercel.app" style={{ left: 780, top: 170, width: 1080, transform: `translateX(${(1 - enter) * 900}px) rotateY(${turn}deg)` }}>
          <OffthreadVideo src={staticFile("dma/footage/dma.webm")} trimBefore={Math.round(3.8 * 30)} playbackRate={1.45} muted style={{ width: "100%", display: "block" }} />
        </BrowserFrame>
      </div>
    </Stage>
  );
}

/* 3. What each part of the plate does to blood sugar. */
const W = 1300 / 1702; // crop px -> stage px
function Analysis() {
  const rise = useEnter(4, { damping: 20, stiffness: 80 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 110 }}>
        <Words text="See how it hits your blood sugar." style={{ ...headline, width: 1600 }} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 330, width: 1300, padding: 36, ...BRUTAL, transform: `translateY(${(1 - rise) * 500}px) rotate(${(1 - rise) * -3}deg)` }}>
        <Img src={ui("analysis")} style={{ width: "100%", display: "block" }} />
        {/* A red tick beside each ingredient as it's read. */}
        {[221, 332, 439].map((y, i) => {
          const p = useEnter(34 + i * 14, { damping: 14, stiffness: 180 });
          return <div key={y} style={{ position: "absolute", left: 10, top: 36 + y * W - 26, width: 8, height: 56 * W * 1.3, background: RED, transform: `scaleY(${p})`, transformOrigin: "top" }} />;
        })}
      </div>
    </Stage>
  );
}

/* 4. The swaps it suggested, as cards in the app's own style. */
const SWAPS = [
  ["Swap the grain", "Brown rice, red rice or boiled kamote for a gentler rise."],
  ["Double the greens", "An extra serving of kangkong, okra or sitaw for fibre."],
  ["Try lighter proteins", "Sinigang na bangus or tilapia next time."],
] as const;
function Swaps() {
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 130 }}>
        <Words text="Healthier swaps, not just warnings." style={{ ...headline, width: 1600 }} />
      </div>
      {SWAPS.map(([title, body], i) => {
        const p = useEnter(14 + i * 9, { damping: 13, stiffness: 130 });
        return (
          <div key={title} style={{ position: "absolute", left: 160 + i * 540, top: 420, width: 480, padding: "40px 40px 44px", ...BRUTAL, transform: `translateY(${(1 - p) * 600}px) rotate(${(i - 1) * 2.5 * p + (1 - p) * 12}deg)` }}>
            <div style={{ width: 52, height: 6, background: RED, marginBottom: 26 }} />
            <div style={{ fontFamily: GEIST, fontWeight: 600, fontSize: 40, color: BLUE, letterSpacing: "-0.01em" }}>{title}</div>
            <div style={{ fontFamily: GEIST, fontSize: 28, lineHeight: 1.4, color: INK, marginTop: 16 }}>{body}</div>
          </div>
        );
      })}
    </Stage>
  );
}

/* 5. The portion tip, drawn as the plate it describes. */
const PLATE = [
  { share: 0.5, color: "#22a35a", label: "½ vegetables" },
  { share: 0.25, color: RED, label: "¼ protein" },
  { share: 0.25, color: "#f2a516", label: "¼ carbs" },
];
function Plate() {
  const frame = useCurrentFrame();
  const R = 190, C = 2 * Math.PI * R;
  let start = 0;
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 130 }}>
        <Words text="Portions for a real plate." style={headline} />
      </div>
      <svg width={560} height={560} viewBox="-280 -280 560 560" style={{ position: "absolute", left: 200, top: 340 }}>
        <circle r={R + 46} fill="#fff" stroke={INK} strokeWidth={3} />
        {PLATE.map((s, i) => {
          const draw = interpolate(frame, [8 + i * 12, 30 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const seg = (
            <circle key={s.label} r={R} fill="none" stroke={s.color} strokeWidth={64} strokeDasharray={`${C * s.share * draw - 6} ${C}`} strokeDashoffset={-C * start} transform="rotate(-90)" />
          );
          start += s.share;
          return seg;
        })}
      </svg>
      {PLATE.map((s, i) => {
        const p = useEnter(20 + i * 12);
        return (
          <div key={s.label} style={{ position: "absolute", left: 860, top: 400 + i * 120, display: "flex", alignItems: "center", gap: 24, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
            <div style={{ width: 36, height: 36, background: s.color, border: `3px solid ${INK}` }} />
            <div style={{ fontFamily: CLASH, fontWeight: 600, fontSize: 64, color: INK }}>{s.label}</div>
          </div>
        );
      })}
    </Stage>
  );
}

const Outro = () => (
  <TitleCard
    bg={RED}
    size={130}
    lines={[["Diabetes Meal Assistant", "#fff"]]}
    sub={[["AI meal feedback, Filipino dishes included", "rgba(255,255,255,.85)"], ["diabetes-meal-assistant.vercel.app", "#fff"]]}
    credit="Designed and built by Ace Guevarra"
  />
);

const CUES: Cue[] = [
  [70, "whoosh", 0.5],
  [S.ask[0] + 70, "pop", 0.5],
  [220, "whoosh", 0.45],
  [S.analysis[0] + 14, "paper", 0.8],
  [S.analysis[0] + 36, "tick1", 0.5],
  [S.analysis[0] + 50, "tick2", 0.5],
  [S.analysis[0] + 64, "tick3", 0.5],
  [340, "whoosh", 0.45],
  ...SWAPS.map((_, i): Cue => [S.swaps[0] + 24 + i * 9, "paper", 0.7]),
  [460, "whoosh", 0.45],
  ...PLATE.map((_, i): Cue => [S.plate[0] + 22 + i * 12, ["tick1", "tick2", "tick3"][i], 0.5]),
  [550, "whoosh", 0.5],
  [S.outro[0] + 3, "chime", 0.7],
];

export function DmaDemo() {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: CLASH }}>
      <Sequence from={S.open[0]} durationInFrames={S.open[1]}><Open /></Sequence>
      <Sequence from={S.ask[0]} durationInFrames={S.ask[1]}><Ask /></Sequence>
      <Sequence from={S.analysis[0]} durationInFrames={S.analysis[1]}><Analysis /></Sequence>
      <Sequence from={S.swaps[0]} durationInFrames={S.swaps[1]}><Swaps /></Sequence>
      <Sequence from={S.plate[0]} durationInFrames={S.plate[1]}><Plate /></Sequence>
      <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}><Outro /></Sequence>
      <Soundtrack dropAt={S.ask[0]} duration={DMA_DURATION} cues={CUES} />
    </AbsoluteFill>
  );
}
