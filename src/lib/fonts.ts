import localFont from "next/font/local";

// Geist and Geist Mono are self-hosted (latin variable woff2 in src/fonts):
// next/font/google downloads them at build time, and a failed download there
// fails the whole Vercel build.
export const geist = localFont({
  src: "../fonts/Geist-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const geistMono = localFont({
  src: "../fonts/GeistMono-latin.woff2",
  weight: "100 900",
  variable: "--font-mono",
  display: "swap",
  // Only small labels use it; don't let it compete with the hero photo.
  preload: false,
});

// The display face. Already in the repo — it was only being used to render OG
// images. It now carries the name in the hero, the footer and the monogram, so
// the wordmark and the mark are the same letterforms.
export const clashDisplay = localFont({
  src: "../../public/fonts/ClashDisplay-Semibold.ttf",
  // Named --font-clash rather than --font-display so globals.css can map it to
  // Tailwind's `font-display` utility without the variable referencing itself.
  variable: "--font-clash",
  weight: "600",
  display: "swap",
});
