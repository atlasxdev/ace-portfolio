import { Pixelify_Sans } from "next/font/google";

// Ag's speech and menu. Kept out of fonts.ts so it ships with the pet's lazy
// chunk instead of the page.
export const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});
