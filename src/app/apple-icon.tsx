import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// iOS home-screen icon. Apple does not accept SVG here, so this renders the
// monogram to PNG using the same face as the site wordmark.
//
// The font is read off disk rather than fetched: `fetch()` on a file:// URL
// only works under the edge runtime, and going edge would drop this route out
// of static generation. Reading it keeps the icon prerendered at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  let clashDisplay: Buffer | null = null;
  try {
    clashDisplay = await readFile(
      join(process.cwd(), "public/fonts/ClashDisplay-Semibold.ttf")
    );
  } catch (error) {
    console.error("apple-icon: could not load ClashDisplay", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141414",
          color: "#f2f2f2",
          fontFamily: clashDisplay ? "Clash Display" : "sans-serif",
          fontSize: 78,
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        AG
      </div>
    ),
    {
      ...size,
      fonts: clashDisplay
        ? [
            {
              name: "Clash Display",
              data: clashDisplay,
              weight: 600,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
