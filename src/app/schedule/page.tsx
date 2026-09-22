import type { Metadata } from "next";

import { CalendlyEmbed } from "@/components/calendly-embed";
import { Reveal } from "@/components/motion/reveal";
import { DATA } from "@/data/resume";

const DESCRIPTION = `Book a 15-minute call with ${DATA.name}.`;

export const metadata: Metadata = {
  title: "Schedule a call",
  description: DESCRIPTION,
  alternates: { canonical: `${DATA.url}/schedule` },
  openGraph: {
    title: `Schedule a call | ${DATA.name}`,
    description: DESCRIPTION,
    url: `${DATA.url}/schedule`,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Schedule a call | ${DATA.name}`,
    description: DESCRIPTION,
  },
};

export default function SchedulePage() {
  return (
    <div className="shell">
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Schedule a call
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-none font-semibold tracking-[-0.02em]">
            Let&rsquo;s talk
          </h1>
        </Reveal>
        <Reveal kind="fade" delay={0.14}>
          <p className="mt-5 max-w-[54ch] text-muted-foreground">
            Pick a time for a 15-minute call: a role, a project, or just a question.
          </p>
        </Reveal>
      </section>

      <div className="pb-16">
        <CalendlyEmbed />
      </div>
    </div>
  );
}
