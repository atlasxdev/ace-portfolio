import type { MetadataRoute } from "next";

import { DATA } from "@/data/resume";

/**
 * Open to crawlers, with the sitemap declared so they don't have to guess at
 * it.
 *
 * The OG image routes are deliberately NOT disallowed here. LinkedIn and X
 * honour robots.txt when fetching a preview image, so a Disallow blanked every
 * shared link's card. They're kept out of image search with an
 * `X-Robots-Tag: noindex` header instead (next.config.mjs) — crawlable, so
 * previews render, but not indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${DATA.url}/sitemap.xml`,
    host: DATA.url,
  };
}
