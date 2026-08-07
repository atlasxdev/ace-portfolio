import type { MetadataRoute } from "next";

import { DATA } from "@/data/resume";

/**
 * Web app manifest. Mostly this is what a phone reads when someone adds the
 * site to their home screen, and what Chrome uses for the install prompt and
 * the address-bar theming.
 *
 * `theme_color` is the dark ground rather than the light one: the site's
 * primary register is dark, and a browser chrome that flips to white around a
 * near-black page looks broken.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${DATA.name} — Full-Stack & Automation Engineer`,
    short_name: DATA.name,
    description: DATA.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    categories: ["portfolio", "technology", "productivity"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
