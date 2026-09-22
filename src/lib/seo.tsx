import type { Metadata } from "next";

import { DATA } from "@/data/resume";

/**
 * Metadata for a top-level page: title, description, canonical, and the
 * Open Graph / Twitter cards.
 *
 * The share image is spelled out on purpose. A page that declares its own
 * `openGraph` replaces the root one wholesale, so without it the root
 * opengraph-image is dropped and the link previews with no card at all.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = `${DATA.url}${path}`;
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: `${DATA.name} — Full-Stack & Automation Engineer` };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${DATA.name}`,
      description,
      url,
      siteName: DATA.name,
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${DATA.name}`,
      description,
      images: [image.url],
    },
  };
}

/** Home → page trail, so Google can show breadcrumbs instead of a bare URL. */
export function BreadcrumbJsonLd({ name, path }: { name: string; path: string }) {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: DATA.url },
      { "@type": "ListItem", position: 2, name, item: `${DATA.url}${path}` },
    ],
  }).replace(/</g, "\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
