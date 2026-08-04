import Chatbot from "@/components/chatbot";
import { PageWipe } from "@/components/motion/page-wipe";
import { OpeningProvider } from "@/components/motion/opening";
import { Preloader } from "@/components/preloader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { clashDisplay, geist, geistMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: `${DATA.name} - Full-Stack & Automation Engineer`,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  openGraph: {
    title: `${DATA.name}`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: `${DATA.name}`,
    card: "summary_large_image",
  },
  // Icons come from the app/ file conventions (icon.svg, apple-icon.tsx).
  // Declaring them here as well would emit duplicate <link> tags.
  verification: {
    google: "",
    yandex: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geist.variable,
          geistMono.variable,
          clashDisplay.variable
        )}
      >
        {/* Dark is the design's primary register, but a visitor whose OS says
            light should get light. `system` respects that; the header toggle
            still overrides it per-visitor. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <OpeningProvider>
            {/* Gives the glass surfaces something to refract. */}
            <div id="ambient" aria-hidden />

            <Preloader />
            <PageWipe />

            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>

            <Chatbot />
            </OpeningProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
