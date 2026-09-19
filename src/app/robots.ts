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
 *
 * Googlebot-Image is kept off the company and tool logos, so Google can't pick
 * one (the VizServe logo, it kept choosing) as the homepage's result
 * thumbnail. next/image serves them through /_next/image, hence both paths.
 * A named group replaces the `*` one for that bot, so /api/ is repeated.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: [
          "/api/",
          "/orgs/",
          "/logos/",
          "/_next/image?url=%2Forgs%2F",
          "/_next/image?url=%2Flogos%2F",
        ],
      },
    ],
    sitemap: `${DATA.url}/sitemap.xml`,
    host: DATA.url,
  };
}
