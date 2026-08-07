import type { MetadataRoute } from "next";

import { DATA } from "@/data/resume";

/**
 * Open to crawlers, with the sitemap declared so they don't have to guess at
 * it. The OG image routes are excluded from indexing — they're 1200x630 PNGs
 * meant for link previews, and letting them into image search puts a card
 * mockup where a real page should be.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/opengraph-image", "/blog/opengraph-image"],
    },
    sitemap: `${DATA.url}/sitemap.xml`,
    host: DATA.url,
  };
}
