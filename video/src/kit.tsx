import type { CSSProperties, ReactNode } from "react";
import type { SpringConfig } from "remotion";
import {
  continueRender,
  delayRender,
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
