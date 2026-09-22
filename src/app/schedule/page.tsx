import type { Metadata } from "next";

import { BreadcrumbJsonLd, pageMetadata } from "@/lib/seo";

import { CalendlyEmbed } from "@/components/calendly-embed";
import { Reveal } from "@/components/motion/reveal";
import { DATA } from "@/data/resume";

const DESCRIPTION = `Book a 15-minute call with ${DATA.name}, full-stack and automation engineer — about a role, a project, or a question.`;

export const metadata: Metadata = pageMetadata({ title: "Schedule a call", description: DESCRIPTION, path: "/schedule" });

export default function SchedulePage() {
  return (
    <div className="shell">
      <BreadcrumbJsonLd name="Schedule a call" path="/schedule" />
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
