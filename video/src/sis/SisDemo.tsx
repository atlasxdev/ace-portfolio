import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BrowserFrame,
  CLASH,
  type Cue,
  GEIST,
  INK,
  INK_SOFT,
  PAPER,
  SHADOW,
  Soundtrack,
  Stage,
  TitleCard,
  useEnter,
  Words,
} from "../kit";

/** The SIS's own navy, sampled from its Performance Tasks header. */
const NAVY = "#18215c";
const INDIGO = "#2433a0";
const ui = (f: string) => staticFile(`sis/ui/${f}.png`);
const headline = { fontSize: 88, color: INK } as const;

// Every still was captured from the P1 Test Section and its two test students.
const S = {
  open: [0, 75],
  sheet: [75, 135],
  report: [210, 120],
  record: [330, 120],
  live: [450, 105],
  outro: [555, 105],
} as const;
export const SIS_DURATION = 660;

const Open = () => (
  <TitleCard bg={NAVY} exitAt={62} lines={[["School records used to live in", "rgba(255,255,255,.55)"], ["a dozen spreadsheets.", "#fff"]]} size={104} />
);

/* 2. The grading sheet: what the teacher types, then what the SIS works out. */
const K = 1760 / 1440; // sheet css px -> stage px
function Mark({ x0, x1, at, label, color }: { x0: number; x1: number; at: number; label: string; color: string }) {
  const p = useEnter(at, { damping: 14, stiffness: 160 });
  return (
    <div style={{ position: "absolute", left: x0 * K - 6, top: 148 * K - 6, width: (x1 - x0) * K + 12, height: 42 * K + 12, borderRadius: 12, border: `4px solid ${color}`, opacity: p, transform: `scale(${1.15 - 0.15 * p})`, boxShadow: `0 0 0 ${8 * p}px ${color}22` }}>
      <div style={{ position: "absolute", top: 70, left: 0, whiteSpace: "nowrap", background: color, color: "#fff", fontFamily: GEIST, fontWeight: 500, fontSize: 22, padding: "6px 14px", borderRadius: 8 }}>{label}</div>
    </div>
  );
}
function Sheet() {
  const rise = useEnter(4, { damping: 22, stiffness: 80 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 150 }}>
        <Words text="Teachers enter raw scores." style={headline} />
        <Words text="The SIS does the maths." delay={52} style={{ ...headline, color: INDIGO }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
        <div style={{ position: "absolute", left: 80, top: 560, width: 1760, transformOrigin: "50% 0%", transform: `translateY(${(1 - rise) * 500}px) rotateX(${(1 - rise) * 35}deg)` }}>
          <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: SHADOW, WebkitMaskImage: "linear-gradient(90deg, #000 90%, transparent)" }}>
            <Img src={ui("sheet-table")} style={{ width: "100%", display: "block" }} />
          </div>
          <Mark x0={283} x1={594} at={24} label="Entered by the teacher" color="#e8590c" />
          <Mark x0={612} x1={778} at={58} label="Computed" color={INDIGO} />
          <Mark x0={1123} x1={1285} at={64} label="Computed" color={INDIGO} />
        </div>
      </div>
    </Stage>
  );
}

/* 3. The report card renders from the same record. */
function Report() {
  const frame = useCurrentFrame();
  const rise = useEnter(0, { damping: 20, stiffness: 70 });
  const scroll = interpolate(frame, [20, 120], [0, -260], { extrapolateLeft: "clamp" });
  const ring = useEnter(48, { damping: 12, stiffness: 180 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 380, width: 760 }}>
        <Words text="Report cards build themselves." style={{ ...headline, width: 760 }} />
        <div style={{ marginTop: 28, fontSize: 30, color: INK_SOFT, opacity: useEnter(16), fontFamily: GEIST }}>
          Grades, attendance and sign-offs, print-ready.
        </div>
      </div>
      <div style={{ position: "absolute", left: 1040, top: 80, width: 720, transform: `translateY(${(1 - rise) * 1100 + scroll}px) rotate(${(1 - rise) * 6}deg)` }}>
        <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: SHADOW }}>
          <Img src={ui("report-doc")} style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ position: "absolute", left: 538 - 34, top: 486 - 26, width: 68, height: 52, borderRadius: 12, border: `4px solid ${INDIGO}`, opacity: ring, transform: `scale(${1.6 - 0.6 * ring})` }} />
      </div>
    </Stage>
  );
}

/* 4. One student, every module. */
const TILES = ["markbook", "attendance", "pfiles", "classroom", "family", "enrolment"];
function Record() {
  const rise = useEnter(0, { damping: 20, stiffness: 90 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 120, top: 110 }}>
        <Words text="Every module, one student record." style={{ ...headline, width: 1700 }} />
      </div>
      {/* Name, ID and stat cards, cropped from the profile page. */}
      <div style={{ position: "absolute", left: 120, top: 300, width: 1100, height: 345, overflow: "hidden", borderRadius: 18, boxShadow: SHADOW, background: "#f8fafc", opacity: rise, transform: `translateY(${(1 - rise) * 80}px)` }}>
        <Img src={ui("profile")} style={{ position: "absolute", width: 2880 * (1100 / 2232), left: -576 * (1100 / 2232), top: -340 * (1100 / 2232) }} />
      </div>
      {TILES.map((t, i) => {
        const p = useEnter(18 + i * 6, { damping: 15, stiffness: 140 });
        const col = i % 3, row = Math.floor(i / 3);
        return (
          <div key={t} style={{ position: "absolute", left: 120 + col * 570, top: 700 + row * 118, width: 540, borderRadius: 14, boxShadow: SHADOW, opacity: p, transform: `translateY(${(1 - p) * -260}px) scale(${0.85 + 0.15 * p})` }}>
            <Img src={ui(`tile-${t}`)} style={{ width: "100%", display: "block", borderRadius: 14 }} />
          </div>
        );
      })}
    </Stage>
  );
}

/* 5. Live: from the class roster to a report card. */
const FOOTAGE = staticFile("sis/footage/sis.webm");
const VIDEO = { position: "absolute", inset: 0, width: "100%", display: "block" } as const;
function Live() {
  const frame = useCurrentFrame();
  const enter = useEnter(0, { damping: 20, stiffness: 80 });
  const turn = interpolate(frame, [0, 105], [-14, -6]);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 400, width: 540 }}>
        <Words text="In daily use at the school." style={{ ...headline, width: 540, fontSize: 84 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <BrowserFrame label="HFSE Student Information System" style={{ left: 760, top: 170, width: 1100, transform: `translateX(${(1 - enter) * 900}px) rotateY(${turn}deg)` }}>
          {/* Roster and the click, then straight to the loaded report: the dev
              server's loading skeleton in between is cut. */}
          <div style={{ position: "relative", aspectRatio: "1440 / 900" }}>
            <Sequence durationInFrames={60} layout="none">
              <OffthreadVideo src={FOOTAGE} trimBefore={Math.round(2.6 * 30)} playbackRate={1.5} muted style={VIDEO} />
            </Sequence>
            <Sequence from={60} layout="none">
              <OffthreadVideo src={FOOTAGE} trimBefore={Math.round(7.5 * 30)} muted style={VIDEO} />
            </Sequence>
          </div>
        </BrowserFrame>
      </div>
    </Stage>
  );
}

const Outro = () => (
  <TitleCard
    bg={NAVY}
    size={130}
    lines={[["Student Information System", "#fff"]]}
    sub={[["Built for HFSE International School", "rgba(255,255,255,.75)"]]}
    credit="Designed and built by Ace Guevarra"
  />
);

const CUES: Cue[] = [
  [70, "whoosh", 0.5],
  [S.sheet[0] + 26, "tick1", 0.55],
  [S.sheet[0] + 60, "pop", 0.6],
  [S.sheet[0] + 66, "pop", 0.5],
  [205, "whoosh", 0.45],
  [S.report[0] + 12, "paper", 0.8],
  [S.report[0] + 50, "tick3", 0.55],
  [325, "whoosh", 0.45],
  ...TILES.map((_, i): Cue => [S.record[0] + 22 + i * 6, i % 2 ? "tick2" : "tick1", 0.4]),
  [445, "whoosh", 0.45],
  [550, "whoosh", 0.5],
  [S.outro[0] + 3, "chime", 0.7],
];

export function SisDemo() {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: CLASH }}>
      <Sequence from={S.open[0]} durationInFrames={S.open[1]}><Open /></Sequence>
      <Sequence from={S.sheet[0]} durationInFrames={S.sheet[1]}><Sheet /></Sequence>
      <Sequence from={S.report[0]} durationInFrames={S.report[1]}><Report /></Sequence>
      <Sequence from={S.record[0]} durationInFrames={S.record[1]}><Record /></Sequence>
      <Sequence from={S.live[0]} durationInFrames={S.live[1]}><Live /></Sequence>
      <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}><Outro /></Sequence>
      <Soundtrack dropAt={S.sheet[0]} duration={SIS_DURATION} cues={CUES} />
    </AbsoluteFill>
  );
}
