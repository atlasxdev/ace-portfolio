import type { CSSProperties, ReactNode } from "react";
import type { SpringConfig } from "remotion";
import {
  continueRender,
  delayRender,
  Easing,
  Html5Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Geist";

/** Shared look for every project film: the portfolio's paper and ink. */
export const PAPER = "#fafaf9";
export const INK = "#141414";
export const INK_SOFT = "#5c5c5c";

export const { fontFamily: GEIST } = loadFont("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});
export const CLASH = "Clash Display";

// The portfolio's wordmark face, loaded from the repo's own font file.
const clashHandle = delayRender("Clash Display");
new FontFace(CLASH, `url(${staticFile("fonts/ClashDisplay-Semibold.ttf")})`, { weight: "600" })
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(clashHandle);
  });

/** Spring that starts at `delay` frames into the current sequence. */
export function useEnter(delay = 0, config: Partial<SpringConfig> = { damping: 200 }, durationInFrames?: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config, durationInFrames });
}

/** Headline whose words rise out of a mask one after another. */
export function Words({
  text,
  delay = 0,
  stagger = 3,
  style,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontFamily: CLASH, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.02, ...style }}>
      {text.split(" ").map((w, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 18, stiffness: 140, mass: 0.8 } });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginRight: "0.24em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
}

export function Stage({ children, bg = PAPER }: { children: ReactNode; bg?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden", fontFamily: GEIST, color: INK }}>
      {children}
    </div>
  );
}

export const SHADOW = "0 40px 80px -30px rgba(20,20,40,.35), 0 12px 24px -12px rgba(20,20,40,.18)";

/** A full-bleed title card in a product's own colour: the opener and the outro. */
export function TitleCard({
  bg,
  lines,
  sub = [],
  credit,
  size = 120,
  exitAt,
}: {
  bg: string;
  /** Each line is [text, colour]; lines rise one after another. */
  lines: [string, string][];
  sub?: [string, string][];
  credit?: string;
  size?: number;
  /** Frame (within the card) at which it lifts away. */
  exitAt?: number;
}) {
  const frame = useCurrentFrame();
  const s = useEnter(16);
  const c = useEnter(30);
  const out =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 13], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <Stage bg={bg}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 160px", transform: `translateY(${out}px)` }}>
        {lines.map(([t, color], i) => (
          <Words key={t} text={t} delay={i * 14} style={{ fontSize: size, color }} />
        ))}
        {sub.map(([t, color], i) => (
          <div key={t} style={{ marginTop: i ? 10 : 36, fontSize: 36, opacity: s, transform: `translateY(${(1 - s) * 20}px)`, color, fontFamily: GEIST, fontWeight: i ? 500 : 400 }}>
            {t}
          </div>
        ))}
      </div>
      {credit && (
        <div style={{ position: "absolute", left: 160, bottom: 90, fontSize: 26, color: "rgba(255,255,255,.6)", opacity: c, fontFamily: GEIST }}>
          {credit}
        </div>
      )}
    </Stage>
  );
}

/** A plain browser window around live footage, labelled with the product's address. */
export function BrowserFrame({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", borderRadius: 16, overflow: "hidden", boxShadow: SHADOW, background: "#fff", border: "1px solid #e4e4e2", ...style }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ececea", fontSize: 18, color: INK_SOFT, fontFamily: GEIST }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export type Cue = [frame: number, sfx: string, volume: number];

/*
 * The shared score. "Motivating Mornings" by Ahjay Stelino (Mixkit free licence)
 * is trimmed so its drop, 12.13s into the track, lands on `dropAt`. Effects are
 * synthesised by scripts/make-sfx.mjs and sit on the frame each motion lands.
 */
const MUSIC_DROP = 12.13;
export function Soundtrack({
  dropAt,
  duration,
  cues,
  musicVolume = 0.55,
}: {
  dropAt: number;
  duration: number;
  cues: Cue[];
  /** Lower it when something else (Ag's own sounds) carries the audio. */
  musicVolume?: number;
}) {
  return (
    <>
      <Html5Audio
        src={staticFile("music/motivating-mornings.mp3")}
        trimBefore={Math.round((MUSIC_DROP - dropAt / 30) * 30)}
        volume={(f) =>
          interpolate(f, [0, 12, duration - 40, duration], [0, musicVolume, musicVolume, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {cues.map(([from, sfx, volume], i) => (
        <Sequence key={i} from={from} durationInFrames={60} layout="none">
          <Html5Audio src={staticFile(`sfx/${sfx}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}
