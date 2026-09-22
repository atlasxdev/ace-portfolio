import type { Metadata } from "next";

import { BreadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { DATA } from "@/data/resume";
import { STACK_GROUPS } from "@/data/stacks";
import { Reveal } from "@/components/motion/reveal";
import { TechGrid } from "@/components/tech-tile";

const DESCRIPTION =
  "Everything I build with, grouped by what it's for — languages, frontend, backend, AI engineering, automation, cloud, testing, and the integrations shipped to production.";

export const metadata: Metadata = pageMetadata({ title: "Tech Stacks", description: DESCRIPTION, path: "/tech-stacks" });

export default function TechStacksPage() {
  return (
    <div className="shell">
      <BreadcrumbJsonLd name="Tech Stacks" path="/tech-stacks" />
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Tech Stacks
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-none font-semibold tracking-[-0.02em]">
            Everything I build with
          </h1>
        </Reveal>
        <Reveal kind="fade" delay={0.14}>
          <p className="mt-5 max-w-[54ch] text-muted-foreground">
            The full set, grouped by what it&rsquo;s for. The homepage shows a
            shortlist; this is the whole thing.
          </p>
        </Reveal>
      </section>

      <div className="flex flex-col gap-3 pb-16">
        {STACK_GROUPS.map((group, i) => (
          <Reveal
            key={group.group}
            delay={Math.min(i * 0.04, 0.2)}
            className="glass p-group"
          >
            <h2 className="label mb-4 text-ink-faint">{group.group}</h2>
            <TechGrid items={group.items} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
