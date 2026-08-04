import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
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
