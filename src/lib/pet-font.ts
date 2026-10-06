import localFont from "next/font/local";

// Ag's speech and menu. Kept out of fonts.ts so it ships with the pet's lazy
// chunk instead of the page. Self-hosted (src/fonts) so builds never fetch
// from Google Fonts.
export const pixelify = localFont({
  src: "../fonts/PixelifySans-latin.woff2",
  weight: "400 700",
  display: "swap",
  preload: false,
});
