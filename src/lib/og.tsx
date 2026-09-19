import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { DATA } from "@/data/resume";

/**
 * The one link-preview card, shared by the homepage, the blog index and every
 * post, so they can't drift into different designs again.
 *
 * Rendered by Satori (next/og), which takes inline styles only and needs every
 * multi-child <div> to be an explicit flex container.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const readPublic = (...segments: string[]) => readFile(join(process.cwd(), "public", ...segments));

// Read off disk, not fetched, so the routes prerender at build time and don't
// depend on the live site being reachable.
export async function ogFonts() {
  try {
    const [cabinetGrotesk, clashDisplay] = await Promise.all([
      readPublic("fonts", "CabinetGrotesk-Medium.ttf"),
      readPublic("fonts", "ClashDisplay-Semibold.ttf"),
    ]);
    return [
      { name: "Cabinet Grotesk", data: cabinetGrotesk, weight: 400 as const, style: "normal" as const },
      { name: "Clash Display", data: clashDisplay, weight: 600 as const, style: "normal" as const },
    ];
  } catch (error) {
    console.error("OG image: could not load fonts", error);
    return undefined;
  }
}

// Satori can't resolve local paths, so the logo goes in as a data URI.
const LOGO_SRC = `data:image/png;base64,${readFileSync(join(process.cwd(), "public", "ag-logo.png")).toString("base64")}`;

// The site's dark-mode tokens (globals.css `.dark`). Always dark: the card is
// shown in other apps' chrome, where the site's theme toggle doesn't reach.
const INK = {
  background: "#0e0e0e",
  card: "#141414",
  foreground: "#f2f2f2",
  faint: "#8f8f8f",
  rule: "#242424",
  available: "#d9a441",
};

// The four hues of #ambient. Satori has no `filter: blur`, so the field is
// built from soft-edged radial gradients instead.
const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;

const ambient = [
  `radial-gradient(circle at 12% 8%, ${HUES[0]}55 0%, transparent 42%)`,
  `radial-gradient(circle at 92% 22%, ${HUES[1]}40 0%, transparent 38%)`,
  `radial-gradient(circle at 74% 96%, ${HUES[2]}55 0%, transparent 44%)`,
  `radial-gradient(circle at 18% 104%, ${HUES[3]}40 0%, transparent 36%)`,
].join(", ");

// Labels on the site are mono, uppercase, widely tracked. There's no mono
// face on disk for Satori, so tracking and case carry the look.
const label = {
  fontFamily: "Cabinet Grotesk",
  fontSize: "18px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: INK.faint,
} as const;

export const SITE_HOST = new URL(DATA.url).host.replace(/^www\./, "");

export function OgCard({
  eyebrow,
  corner = SITE_HOST,
  title,
  titleSize = 124,
  body,
  footerLeft,
  footerRight,
}: {
  /** Uppercase label beside the monogram. */
  eyebrow: string;
  /** Uppercase label, top right. */
  corner?: string;
  title: string;
  titleSize?: number;
  body?: string;
  footerLeft: string;
  /** Rendered in the accent, with a dot — for status lines. */
  footerRight?: ReactNode;
}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: INK.background,
        backgroundImage: ambient,
        padding: "56px 72px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders <img>, not next/image */}
          <img
            src={LOGO_SRC}
            alt=""
            width={64}
            height={64}
            style={{ borderRadius: "18px", border: `1px solid ${INK.rule}` }}
          />
          <div style={label}>{eyebrow}</div>
        </div>
        <div style={label}>{corner}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
        <div
          style={{
            fontFamily: "Clash Display",
            fontSize: `${titleSize}px`,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: INK.foreground,
            maxWidth: "1056px",
          }}
        >
          {title}
        </div>
        {body && (
          <div
            style={{
              fontFamily: "Cabinet Grotesk",
              fontSize: "30px",
              lineHeight: 1.3,
              color: INK.foreground,
              opacity: 0.85,
              marginTop: "24px",
              maxWidth: "900px",
            }}
          >
            {clampBody(body)}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: `1px solid ${INK.rule}`,
        }}
      >
        <div style={label}>{footerLeft}</div>
        {footerRight && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "Cabinet Grotesk",
              fontSize: "22px",
              color: INK.available,
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: INK.available }} />
            {footerRight}
          </div>
        )}
      </div>

      {/* Brand strip along the bottom edge */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "6px", display: "flex" }}>
        {HUES.map((hue) => (
          <div key={hue} style={{ flex: 1, backgroundColor: hue }} />
        ))}
      </div>
    </div>
  );
}

// Two lines of body at this size hold ~110 characters. Past that, keep the
// first sentence if it fits; otherwise cut at a word and mark it with an
// ellipsis, so the card never ends on a dangling "and".
const BODY_MAX = 110;

function clampBody(text: string) {
  if (text.length <= BODY_MAX) return text;
  const sentence = text.match(/^.+?[.!?](?=\s|$)/)?.[0];
  if (sentence && sentence.length <= BODY_MAX) return sentence;
  const cut = text.slice(0, BODY_MAX);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–—-]\s*$/, "")}…`;
}

/** Scales a title down as it gets longer, so post titles fit in two or three lines. */
export function titleSizeFor(title: string) {
  if (title.length <= 28) return 108;
  if (title.length <= 48) return 84;
  if (title.length <= 72) return 68;
  return 56;
}
