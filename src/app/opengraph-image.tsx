import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";

// Node runtime (the default), not edge: the fonts are read off disk, which
// lets this route prerender at build time.

export const alt = `${DATA.name} — Full-Stack & Automation Engineer`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Full-stack · Automation · AI"
        title={DATA.name}
        body="I build production systems end-to-end, from the first stakeholder call to the thing running in production."
        footerLeft={`${DATA.location} · Open to remote`}
        footerRight="Open to full-time and contract work"
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
