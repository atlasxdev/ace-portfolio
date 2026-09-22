import type { Metadata } from "next";

import { BreadcrumbJsonLd, pageMetadata } from "@/lib/seo";

import { Reveal } from "@/components/motion/reveal";
import { ProjectsSection } from "@/components/section/projects-section";
import { DATA } from "@/data/resume";

const DESCRIPTION = "Projects by Ace Guevarra: web platforms, internal tools, automations and storefronts, built end-to-end.";

export const metadata: Metadata = pageMetadata({ title: "Projects", description: DESCRIPTION, path: "/projects" });

export default function ProjectsPage() {
  return (
    <div className="shell">
      <BreadcrumbJsonLd name="Projects" path="/projects" />
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
