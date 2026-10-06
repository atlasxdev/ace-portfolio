import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLASH, GEIST, INK_SOFT, PAPER, Stage, useEnter, Words } from "../kit";

/** The product's own royal blue, sampled from the portal's buttons. */
const BLUE = "#1e44c4";
const RED = "#e5484d";
const ui = (f: string) => staticFile(`ui/${f}.png`);
const SHADOW = "0 40px 80px -30px rgba(20,20,40,.35), 0 12px 24px -12px rgba(20,20,40,.18)";

// Scene timings, in frames at 30fps.
const S = {
  open: [0, 75],
  docs: [75, 105],
  dash: [180, 105],
  drafts: [285, 105],
  live: [390, 120],
  outro: [510, 105],
} as const;
export const ADMISSIONS_DURATION = 615;

const headline = { fontSize: 92, color: "#141414", width: 760 } as const;

/* 1. The problem, on the product's blue. */
function Open() {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [62, 75], [0, -60], { extrapolateLeft: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <Stage bg={BLUE}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", transform: `translateY(${out}px)` }}>
        <Words text="Enrolment used to mean" style={{ fontSize: 120, color: "rgba(255,255,255,.55)" }} />
        <Words text="chasing paperwork." delay={14} style={{ fontSize: 120, color: "#fff" }} />
      </AbsoluteFill>
    </Stage>
  );
}

/* 2. The paperwork, dealt onto the table and checked. */
const PILE = [
  { f: "doc-missing", x: 980, y: 250, r: -4, d: 8 },
  { f: "doc-expired", x: 1150, y: 410, r: 3, d: 14, flag: true },
  { f: "doc-valid", x: 940, y: 570, r: -2, d: 20 },
  { f: "doc-expired-2", x: 1120, y: 730, r: 4, d: 26, flag: true },
];
function Docs() {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 330 }}>
        <Words text="Every document checked" style={headline} />
        <Words text="before it's sent." delay={8} style={{ ...headline, color: BLUE }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        {PILE.map((c) => {
          const p = useEnter(c.d, { damping: 16, stiffness: 120, mass: 0.9 });
          const pulse = c.flag ? interpolate(frame, [60, 72, 90], [0, 1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
          return (
            <div
              key={c.f}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                width: 600,
                transform: `translateY(${(1 - p) * 700}px) rotateX(${(1 - p) * 55}deg) rotate(${c.r * p + (1 - p) * -18}deg)`,
                borderRadius: 18,
                boxShadow: `${SHADOW}, 0 0 0 ${pulse * 6}px ${RED}`,
              }}
            >
              <Img src={ui(c.f)} style={{ width: "100%", display: "block", borderRadius: 18 }} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

/* 3. The dashboard rises; what's outstanding lifts out of it. */
function Dash() {
  const frame = useCurrentFrame();
  const rise = useEnter(0, { damping: 22, stiffness: 70, mass: 1 });
  const push = interpolate(frame, [0, 105], [1, 1.08]);
  const lift = useEnter(38, { damping: 15, stiffness: 120, mass: 0.8 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 90, zIndex: 3 }}>
        <Words text="Parents see exactly what's missing." delay={4} style={{ ...headline, width: 1400, fontSize: 80 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
        <div
          style={{
            position: "absolute",
            left: 260,
            top: 300,
            width: 1400,
            transformOrigin: "50% 0%",
            transform: `translateY(${(1 - rise) * 600}px) rotateX(${8 + (1 - rise) * 30}deg) scale(${push})`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: SHADOW,
            border: "1px solid #e4e4e2",
          }}
        >
          <Img src={ui("dashboard")} style={{ width: "100%", display: "block", filter: `blur(${lift * 6}px)` }} />
          <AbsoluteFill style={{ background: PAPER, opacity: lift * 0.78 }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 400,
            width: 1260,
            opacity: lift,
            transform: `translateY(${(1 - lift) * 120}px) scale(${0.94 + lift * 0.06})`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            border: "1px solid #e4e4e2",
          }}
        >
          <Img src={ui("doc-alert")} style={{ width: "100%", display: "block" }} />
        </div>
      </div>
    </Stage>
  );
}

/* 4. Drafts: the stepper fills in on its own. */
function Drafts() {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [12, 60], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const card = useEnter(30, { damping: 16, stiffness: 110 });
  const pill = useEnter(52, { damping: 11, stiffness: 160 });
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 190 }}>
        <Words text="Drafts save themselves." style={{ ...headline, width: 1400 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 400,
          width: 1680,
          background: "#fff",
          borderRadius: 20,
          boxShadow: SHADOW,
          clipPath: `inset(0 ${fill}% 0 0 round 20px)`,
          padding: "10px 0",
        }}
      >
        <Img src={ui("stepper")} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", left: 160, top: 640, width: 1180, transform: `translateX(${(1 - card) * 900}px)`, opacity: card, borderRadius: 18, boxShadow: SHADOW }}>
        <Img src={ui("draft-card")} style={{ width: "100%", display: "block", borderRadius: 18 }} />
      </div>
      <div style={{ position: "absolute", left: 1400, top: 660, width: 400, transform: `scale(${pill})`, borderRadius: 18, boxShadow: SHADOW }}>
        <Img src={ui("saved-pill")} style={{ width: "100%", display: "block", borderRadius: 18 }} />
      </div>
    </Stage>
  );
}

/* 5. The real thing: resuming a saved draft in the live portal. */
function Live() {
  const frame = useCurrentFrame();
  const enter = useEnter(0, { damping: 20, stiffness: 80 });
  const turn = interpolate(frame, [0, 120], [-14, -6]);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 160, top: 360, width: 520 }}>
        <Words text="Pick up where you left off." style={{ ...headline, width: 520, fontSize: 84 }} />
        <div style={{ marginTop: 28, fontSize: 30, color: INK_SOFT, opacity: useEnter(18), fontFamily: GEIST }}>
          Live in the parent portal today.
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 170,
            width: 1100,
            transform: `translateX(${(1 - enter) * 900}px) rotateY(${turn}deg)`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: SHADOW,
            background: "#fff",
            border: "1px solid #e4e4e2",
          }}
        >
          <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ececea", fontSize: 18, color: INK_SOFT, fontFamily: GEIST }}>
            enrol.hfse.edu.sg
          </div>
          <OffthreadVideo
            src={staticFile("footage/admissions.webm")}
            trimBefore={Math.round(16.9 * 30)}
            playbackRate={1.3}
            muted
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </div>
    </Stage>
  );
}

/* 6. Name and address. */
function Outro() {
  const sub = useEnter(16);
  return (
    <Stage bg={BLUE}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", color: "#fff" }}>
        <Words text="Online Admission System" style={{ fontSize: 140, color: "#fff" }} />
        <div style={{ marginTop: 36, fontSize: 36, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`, color: "rgba(255,255,255,.75)", fontFamily: GEIST }}>
          Built for HFSE International School
        </div>
        <div style={{ marginTop: 10, fontSize: 36, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`, color: "#fff", fontFamily: GEIST, fontWeight: 500 }}>
          enrol.hfse.edu.sg
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 160, bottom: 90, fontSize: 26, color: "rgba(255,255,255,.6)", opacity: useEnter(30), fontFamily: GEIST }}>
        Designed and built by Ace Guevarra
      </div>
    </Stage>
  );
}

/*
 * Sound. "Motivating Mornings" by Ahjay Stelino (Mixkit free licence) is
 * trimmed so its drop, at 12.13s into the track, lands on the cut from the
 * blue opener to the documents. Effects are synthesised by scripts/make-sfx.mjs
 * and sit on the frame each motion lands.
 */
const MUSIC_DROP = 12.13;
const CUES: [frame: number, sfx: string, volume: number][] = [
  [70, "whoosh", 0.5],
  ...PILE.map((c): [number, string, number] => [S.docs[0] + c.d + 11, "paper", 0.8]),
  [S.docs[0] + 60, "alert", 0.55],
  [176, "whoosh", 0.45],
  [S.dash[0] + 44, "pop", 0.6],
  [281, "whoosh", 0.45],
  [S.drafts[0] + 28, "tick1", 0.5],
  [S.drafts[0] + 34, "tick2", 0.5],
  [S.drafts[0] + 39, "tick3", 0.5],
  [S.drafts[0] + 55, "pop", 0.6],
  [386, "whoosh", 0.45],
  [505, "whoosh", 0.5],
  [S.outro[0] + 3, "chime", 0.7],
];

function Soundtrack() {
  return (
    <>
      <Html5Audio
        src={staticFile("music/motivating-mornings.mp3")}
        trimBefore={Math.round((MUSIC_DROP - S.docs[0] / 30) * 30)}
        volume={(f) =>
          interpolate(f, [0, 12, ADMISSIONS_DURATION - 40, ADMISSIONS_DURATION], [0, 0.55, 0.55, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {CUES.map(([from, sfx, volume], i) => (
        <Sequence key={i} from={from} durationInFrames={60} layout="none">
          <Html5Audio src={staticFile(`sfx/${sfx}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

export function AdmissionsDemo() {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: CLASH }}>
      <Sequence from={S.open[0]} durationInFrames={S.open[1]}><Open /></Sequence>
      <Sequence from={S.docs[0]} durationInFrames={S.docs[1]}><Docs /></Sequence>
      <Sequence from={S.dash[0]} durationInFrames={S.dash[1]}><Dash /></Sequence>
      <Sequence from={S.drafts[0]} durationInFrames={S.drafts[1]}><Drafts /></Sequence>
      <Sequence from={S.live[0]} durationInFrames={S.live[1]}><Live /></Sequence>
      <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}><Outro /></Sequence>
      <Soundtrack />
    </AbsoluteFill>
  );
}
