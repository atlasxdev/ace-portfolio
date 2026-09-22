import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { JourneySection } from "@/components/section/journey-section";
import { ExperienceSection } from "@/components/section/work-section";
import { DATA } from "@/data/resume";

const DESCRIPTION = "The full history: where I've worked, and the milestones that got me here.";

export const metadata: Metadata = {
  title: "Journey",
  description: DESCRIPTION,
  alternates: { canonical: `${DATA.url}/journey` },
  openGraph: {
    title: `Journey | ${DATA.name}`,
    description: DESCRIPTION,
    url: `${DATA.url}/journey`,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Journey | ${DATA.name}`,
    description: DESCRIPTION,
  },
};

export default function JourneyPage() {
  return (
    <div className="shell">
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Journey
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4rem)] leading-none font-semibold tracking-[-0.02em]">
            How I got here
          </h1>
        </Reveal>
        <Reveal kind="fade" delay={0.14}>
          <p className="mt-5 max-w-[54ch] text-muted-foreground">
            Where I&rsquo;ve worked, then every milestone along the way.
          </p>
        </Reveal>
      </section>

      <section className="pb-section">
        <Reveal kind="fade">
          <h2 className="label mb-group text-ink-faint">Experience</h2>
        </Reveal>
        <ExperienceSection />
      </section>

      <section className="pb-16">
        <Reveal kind="fade">
          <h2 className="label mb-group text-ink-faint">Milestones</h2>
        </Reveal>
        <JourneySection />
      </section>
    </div>
  );
}
