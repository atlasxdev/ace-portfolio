import { ImageResponse } from "next/og";
import { allPosts } from "content-collections";
import { DATA } from "@/data/resume";
import { OG_SIZE, OgCard, ogFonts, titleSizeFor } from "@/lib/og";

export const alt = "Blog post";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p._meta.path.replace(/\.mdx$/, "") === slug);
  const fonts = await ogFonts();

  if (!post) {
    return new ImageResponse(
      <OgCard eyebrow="Blog" title="Post not found" titleSize={108} footerLeft={DATA.name} />,
      { ...size, fonts }
    );
  }

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Blog"
        corner={date || undefined}
        title={post.title}
        titleSize={titleSizeFor(post.title)}
        body={post.summary}
        footerLeft={`By ${DATA.name}`}
      />
    ),
    { ...size, fonts }
  );
}
