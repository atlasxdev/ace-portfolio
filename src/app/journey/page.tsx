import type { Metadata } from "next";

import { BreadcrumbJsonLd, pageMetadata } from "@/lib/seo";

import { Reveal } from "@/components/motion/reveal";
import { JourneySection } from "@/components/section/journey-section";
import { ExperienceSection } from "@/components/section/work-section";
import { DATA } from "@/data/resume";

const DESCRIPTION = "Ace Guevarra's full history as a full-stack and automation engineer: where I've worked, and the milestones that got me here.";

export const metadata: Metadata = pageMetadata({ title: "Journey", description: DESCRIPTION, path: "/journey" });

export default function JourneyPage() {
  return (
    <div className="shell">
      <BreadcrumbJsonLd name="Journey" path="/journey" />
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Journey
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-none font-semibold tracking-[-0.02em]">
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
