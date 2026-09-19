import { ImageResponse } from "next/og";
import { allPosts } from "content-collections";
import { DATA } from "@/data/resume";
import { OG_SIZE, OgCard, SITE_HOST, ogFonts } from "@/lib/og";

export const alt = `Blog — ${DATA.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const count = allPosts.length;

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Blog"
        corner={`${SITE_HOST}/blog`}
        title="Notes from the build."
        titleSize={108}
        body="An MCP server, a hiring pipeline, an admissions portal, and how the whole lifecycle gets run."
        footerLeft={`${DATA.name} · ${count} ${count === 1 ? "post" : "posts"}`}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
