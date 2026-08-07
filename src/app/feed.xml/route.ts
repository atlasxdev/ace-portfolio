import { allPosts } from "content-collections";

import { DATA } from "@/data/resume";

/**
 * RSS 2.0 for the writing.
 *
 * Summaries only, not full bodies. The posts carry code blocks and MDX
 * components that don't survive being flattened into CDATA, and a feed that
 * renders badly is worse than one that sends people to the page.
 *
 * Statically generated — the content collection is fixed at build time, so
 * there's nothing to compute per request.
 */
export const dynamic = "force-static";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function GET() {
  const posts = [...allPosts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );

  const items = posts
    .map((post) => {
      const url = `${DATA.url}/blog/${post._meta.path}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escape(post.summary)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(DATA.name)} — Writing</title>
    <link>${DATA.url}/blog</link>
    <description>${escape(DATA.description)}</description>
    <language>en</language>
    <atom:link href="${DATA.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
