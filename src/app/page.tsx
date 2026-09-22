import { allPosts } from "content-collections";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { HeroPortrait } from "@/components/hero-portrait";
import { Reveal } from "@/components/motion/reveal";
import { PersonSchema } from "@/components/person-schema";
import { ApproachSection } from "@/components/section/approach-section";
import { CertificationsSection } from "@/components/section/certifications-section";
import { EducationSection } from "@/components/section/education-section";
import { ProjectsSection } from "@/components/section/projects-section";
import { RecognitionSection } from "@/components/section/recognition-section";
import { ItemList, ItemRow, SectionRow } from "@/components/section/section-row";
import { ExperienceSection } from "@/components/section/work-section";
import { TechGrid } from "@/components/tech-tile";
import { DATA } from "@/data/resume";
import { section } from "@/data/sections";
import { CAPABILITIES, TECH_BAND } from "@/data/stacks";
import { LOGOS } from "@/lib/logos";
import { RULE_DELAY } from "@/lib/motion";

/** The stack at a glance, in the hero; the full set is under Capabilities. */
const HERO_STACK = TECH_BAND.filter((t) =>
  ["TypeScript", "React", "Next.js", "PostgreSQL", "Supabase", "n8n", "Anthropic", "MCP"].includes(t.name),
);

export const metadata: Metadata = {
  alternates: { canonical: DATA.url },
};

export default function Page() {
  const posts = allPosts
    .slice()
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3);

  return (
    <>
      <PersonSchema />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      {/* Photo left, details right from md; stacked below that. */}
      <section className="shell grid grid-cols-1 gap-group pt-entry pb-group md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-10 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-14">
        <Reveal kind="fade" onLoad delay={0.05}>
          <HeroPortrait className="w-full max-w-[280px] md:max-w-none overflow-hidden" />
        </Reveal>
        <div className="min-w-0">
          <Reveal kind="fade" onLoad delay={0.1} className="label">
            Full-stack &middot; Automation &middot; AI
          </Reveal>
          <Reveal kind="open" onLoad delay={0.2}>
            <h1 className="mt-snug font-display text-[36px] leading-[40px] font-semibold tracking-[-0.03em] text-balance md:text-[48px] md:leading-[52px] xl:text-display xl:leading-16">
              {DATA.name}
            </h1>
          </Reveal>
          <Reveal kind="open" onLoad delay={0.45}>
            <p className="mt-snug max-w-[48ch] text-body-lg text-balance">
              I build production systems end&#8209;to&#8209;end, from the first stakeholder call to the thing running in
              production.
            </p>
          </Reveal>
          <Reveal kind="fade" onLoad delay={0.75}>
            <ul aria-label="Tools I work with" className="mt-group flex flex-wrap gap-1.5">
              {HERO_STACK.map((tech) => (
                <li
                  key={tech.name}
                  className="flex items-center gap-1.5 rounded-full border border-rule bg-foreground/3 py-1 pr-2.5 pl-1.5 text-xs text-muted-foreground">
                  {tech.logo && (
                    // Wide marks (n8n) keep their aspect ratio; forcing them square overlaps the label.
                    <BrandLogo name={tech.logo} className={LOGOS[tech.logo]?.wide ? "h-3.5" : "size-3.5"} />
                  )}
                  {tech.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────
          First after the hero, so its divider closes the opening screen and
          lands last in the load cascade instead of reappearing on scroll. */}
      {posts.length > 0 && (
        <SectionRow label={section("blog").label} id="blog" ruleOnLoad ruleDelay={RULE_DELAY.min} className="pt-entry">
          <Reveal>
            <ItemList>
              {posts.map((post) => (
                <ItemRow
                  key={post._meta.path}
                  title={post.title}
                  meta={new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  href={`/blog/${post._meta.path}`}>
                  {post.summary}
                </ItemRow>
              ))}
            </ItemList>
          </Reveal>
          <Reveal kind="fade" delay={0.12}>
            <Link
              href="/blog"
              className="label mt-6 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
              All posts <ArrowRight className="size-3" aria-hidden />
            </Link>
          </Reveal>
        </SectionRow>
      )}

      {/* ── Projects ─────────────────────────────────────────────────── */}
      {/* Takes over the load-cascade divider when there are no posts. */}
      <SectionRow
        label={section("projects").label}
        id="projects"
        ruleOnLoad={posts.length === 0}
        ruleDelay={RULE_DELAY.min}>
        <ProjectsSection limit={3} />
        <Reveal kind="fade" delay={0.12}>
          <Link
            href="/projects"
            className="label mt-6 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
            All projects <ArrowRight className="size-3" aria-hidden />
          </Link>
        </Reveal>
      </SectionRow>

      {/* ── Experience ───────────────────────────────────────────────── */}
      <SectionRow label={section("experience").label} id="experience">
        <ExperienceSection />
        <Reveal kind="fade" delay={0.12}>
          <Link
            href="/journey"
            className="label mt-6 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
            Full history <ArrowRight className="size-3" aria-hidden />
          </Link>
        </Reveal>
      </SectionRow>

      {/* ── Certifications ───────────────────────────────────────────── */}
      <SectionRow label={section("certifications").label} id="certifications">
        <CertificationsSection />
      </SectionRow>

      {/* ── Education ────────────────────────────────────────────────── */}
      <SectionRow label={section("education").label} id="education">
        <EducationSection />
      </SectionRow>

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <SectionRow label={section("capabilities").label} id="capabilities">
        <Reveal className="glass p-group">
          <h2 className="label mb-4 text-ink-faint">Tools I work with</h2>
          <TechGrid items={TECH_BAND} />
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {CAPABILITIES.map((column, i) => (
            <Reveal key={i} delay={0.05 + i * 0.08}>
              <h2 className="label mb-4 text-ink-faint">{i === 0 ? "What I do" : <span aria-hidden>&nbsp;</span>}</h2>
              <ul className="flex flex-col gap-2 text-[12.5px] text-muted-foreground">
                {column.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal kind="fade" delay={0.2}>
          <Link
            href="/tech-stacks"
            className="label mt-8 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
            View all tech stacks <ArrowRight className="size-3" aria-hidden />
          </Link>
        </Reveal>
      </SectionRow>

      {/* ── Approach ─────────────────────────────────────────────────── */}
      <SectionRow label={section("approach").label} id="approach" wide>
        <ApproachSection />
        <Reveal kind="fade" delay={0.2}>
          <Link
            href="/blog/sdlc-in-claude-code"
            className="label mt-8 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
            Read the full write-up <ArrowRight className="size-3" aria-hidden />
          </Link>
        </Reveal>
      </SectionRow>

      {/* ── Recognition ──────────────────────────────────────────────── */}
      <SectionRow label={section("recognition").label} id="recognition">
        <RecognitionSection />
      </SectionRow>
    </>
  );
}
