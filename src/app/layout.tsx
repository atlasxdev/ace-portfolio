import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  twitter: {
    card: "summary_large_image",
    title: `${DATA.name}`,
    description: DATA.description,
    // No `creator` handle: there's no X account in DATA.contact.social, and a
    // guessed @handle either 404s or credits somebody else's account.
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
  applicationName: DATA.name,
  authors: [{ name: DATA.name, url: DATA.url }],
  creator: DATA.name,
  publisher: DATA.name,
  category: "technology",
  keywords: [
    "Ace Guevarra",
    "full-stack engineer",
    "automation engineer",
    "AI engineer",
    "system engineer",
    "Next.js developer",
    "TypeScript",
    "React",
    "Supabase",
    "PostgreSQL",
    "n8n",
    "workflow automation",
    "Model Context Protocol",
    "MCP server",
    "Claude Code",
    "remote software engineer",
    "Philippines",
  ],
  // Feed discovery — this is what lets a reader hand the site URL to their
  // reader app and have it find the feed on its own.
  //
  // NOTE: no `canonical` here. A canonical set on the root layout becomes the
  // default for every route that doesn't override it, so declaring the homepage
  // URL here told Google that /blog, /tech-stacks and every post were
  // duplicates of the homepage and should be dropped. Each route sets its own.
  alternates: {
    types: { "application/rss+xml": `${DATA.url}/feed.xml` },
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

            {/* Outside the providers: neither renders anything, and neither
                should be re-rendered by a theme or tooltip state change.
                Cookieless, so there's no consent banner to add. Speed Insights
                reports real Core Web Vitals from actual visitors, which is the
                only honest read on whether the preloader costs anything. */}
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
