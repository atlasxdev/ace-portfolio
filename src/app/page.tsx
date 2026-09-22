import { allPosts } from "content-collections";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
import { RULE_DELAY } from "@/lib/motion";

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
      {/* Logo left, details right from lg; stacked below that. */}
      <section className="shell grid grid-cols-1 gap-entry pt-section pb-entry lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
        <Reveal kind="fade" onLoad delay={0.05}>
          {/* A real image, not the inline <Monogram>: it's the page's first
              image, so Google has the AG logo to pick as the result thumbnail.
              Same file as primaryImageOfPage in person-schema.tsx. */}
          <Image
            src="/ag-logo-1200.png"
            alt={`${DATA.name} logo`}
            width={240}
            height={240}
            unoptimized
            priority
            className="size-20 rounded-2xl md:size-28 lg:size-40 lg:rounded-3xl xl:size-44"
          />
        </Reveal>
        <div className="min-w-0">
          <Reveal kind="fade" onLoad delay={0.1} className="label">
            Full-stack &middot; Automation &middot; AI
          </Reveal>
          <Reveal kind="open" onLoad delay={0.2}>
            <h1 className="mt-group font-display text-[44px] leading-[48px] font-semibold tracking-[-0.03em] text-balance md:text-[56px] md:leading-[60px] xl:text-display xl:leading-[100px]">
              {DATA.name}
            </h1>
          </Reveal>
          <Reveal kind="open" onLoad delay={0.45}>
            <p className="mt-6 max-w-[40ch] text-body-lg text-balance">
              I build production systems end&#8209;to&#8209;end, from the first stakeholder call to the thing running
              in production.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────
          First after the hero, so its divider closes the opening screen and
          lands last in the load cascade instead of reappearing on scroll. */}
      {posts.length > 0 && (
        <SectionRow label={section("blog").label} id="blog" ruleOnLoad ruleDelay={RULE_DELAY.min}>
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
              <ul className="flex flex-col gap-2 text-[13.5px] text-muted-foreground">
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
