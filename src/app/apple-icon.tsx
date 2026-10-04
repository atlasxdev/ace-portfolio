import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// iOS home-screen icon. Apple does not accept SVG here, so this serves the
// ACE monogram as PNG.
//
// The logo is read off disk rather than fetched: `fetch()` on a file:// URL
// only works under the edge runtime, and going edge would drop this route out
// of static generation. Reading it keeps the icon prerendered at build time.
// Satori can't resolve local paths, so it goes in as a data URI.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), "public/ace-logo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#141414" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
        <img src={src} alt="" width={180} height={180} />
      </div>
    ),
    size
  );
}
