import { allPosts } from "content-collections";
import type { MetadataRoute } from "next";

import { DATA } from "@/data/resume";

/**
 * Every indexable URL, so crawlers don't have to infer the site from links
 * alone. Posts carry their own `updatedAt` where one exists, which is what
 * tells Google a piece was revised rather than merely re-crawled.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    { url: DATA.url, changeFrequency: "monthly", priority: 1 },
    { url: `${DATA.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${DATA.url}/tech-stacks`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const posts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${DATA.url}/blog/${post._meta.path}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...routes, ...posts];
}
