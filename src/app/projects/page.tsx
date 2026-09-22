import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { ProjectsSection } from "@/components/section/projects-section";
import { DATA } from "@/data/resume";

const DESCRIPTION = "Everything I've built: web platforms, internal tools, automations and storefronts.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: `${DATA.url}/projects` },
  openGraph: {
    title: `Projects | ${DATA.name}`,
    description: DESCRIPTION,
    url: `${DATA.url}/projects`,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects | ${DATA.name}`,
    description: DESCRIPTION,
  },
};

export default function ProjectsPage() {
  return (
    <div className="shell">
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Projects
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-none font-semibold tracking-[-0.02em]">
            Everything I&rsquo;ve built
          </h1>
        </Reveal>
        <Reveal kind="fade" delay={0.14}>
          <p className="mt-5 max-w-[54ch] text-muted-foreground">
            The homepage shows three; this is the whole list.
          </p>
        </Reveal>
      </section>

      <div className="pb-16">
        <ProjectsSection />
      </div>
    </div>
  );
}
