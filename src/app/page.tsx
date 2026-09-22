import { allPosts } from "content-collections";
import { ArrowRight, Calendar, Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContactTrigger } from "@/components/contact-dialog";
import { Reveal } from "@/components/motion/reveal";
import { PersonSchema } from "@/components/person-schema";
import { SectionDock } from "@/components/section-dock";
import { SectionNav } from "@/components/section-nav";
import { ApproachSection } from "@/components/section/approach-section";
import { CertificationsSection } from "@/components/section/certifications-section";
import { EducationSection } from "@/components/section/education-section";
import { JourneySection } from "@/components/section/journey-section";
import { ProjectsSection } from "@/components/section/projects-section";
import { RecognitionSection } from "@/components/section/recognition-section";
import { ItemList, ItemRow, SectionRow } from "@/components/section/section-row";
import { ExperienceSection } from "@/components/section/work-section";
import { TechGrid } from "@/components/tech-tile";
import { DATA } from "@/data/resume";
import { SECTIONS, section } from "@/data/sections";
import { CAPABILITIES, TECH_BAND } from "@/data/stacks";
import { RULE_DELAY } from "@/lib/motion";

const HERO_LINKS = [
  { label: "LinkedIn", href: DATA.contact.social.LinkedIn.url, external: true },
  { label: "GitHub", href: DATA.contact.social.GitHub.url, external: true },
  { label: "Blog", href: "/blog", external: false },
];

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
      {/* Dock on desktop, bar below lg — never both. */}
      <SectionDock sections={SECTIONS} />
      <SectionNav sections={SECTIONS} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="shell pt-section pb-entry">
        <Reveal kind="fade" onLoad delay={0.1} className="label">
          Full-stack &middot; Automation &middot; AI
        </Reveal>
        <Reveal kind="open" onLoad delay={0.2}>
          <h1 className="mt-group font-display text-[56px] leading-[60px] font-semibold tracking-[-0.03em] text-balance md:text-[72px] md:leading-[76px] lg:text-display lg:leading-[100px]">
            {DATA.name}
          </h1>
        </Reveal>
        <Reveal kind="open" onLoad delay={0.45}>
          <p className="mt-6 max-w-[40ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-snug text-balance">
            I build production systems end&#8209;to&#8209;end, from the first stakeholder call to the thing running in
            production.
          </p>
        </Reveal>
        <Reveal kind="open" onLoad delay={0.7}>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ContactTrigger className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
              <MessageSquare className="size-4 text-available" aria-hidden />
              Message me
            </ContactTrigger>
            <a
              href={DATA.contact.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform duration-300 hover:-translate-y-0.5">
              <Calendar className="size-4" aria-hidden />
              Schedule a call
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>

            <a
              href={`mailto:${DATA.contact.email}`}
              className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
              <Mail className="size-4" aria-hidden />
              Send an email
            </a>
          </div>
        </Reveal>
        <Reveal
          kind="fade"
          onLoad
          delay={1.35}
          className="mt-[clamp(2rem,5vw,3rem)] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <span className="label">{DATA.location} &middot; Open to remote</span>
          <nav className="flex flex-wrap gap-6">
            {HERO_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="relative text-[13.5px] text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100">
                {link.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </section>

      {/* ── Writing ────────────────────────────────────────────────────
          First after the hero, so its divider closes the opening screen and
          lands last in the load cascade instead of reappearing on scroll. */}
      {posts.length > 0 && (
        <SectionRow label={section("writing").label} id="writing" ruleOnLoad ruleDelay={RULE_DELAY.min}>
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
              All writing <ArrowRight className="size-3" aria-hidden />
            </Link>
          </Reveal>
        </SectionRow>
      )}

      {/* ── Selected projects ────────────────────────────────────────── */}
      {/* Takes over the load-cascade divider when there are no posts. */}
      <SectionRow
        label={section("projects").label}
        id="projects"
        ruleOnLoad={posts.length === 0}
        ruleDelay={RULE_DELAY.min}>
        <ProjectsSection />
      </SectionRow>

      {/* ── Experience ───────────────────────────────────────────────── */}
      <SectionRow label={section("experience").label} id="experience">
        <ExperienceSection />
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
              <ul className="flex flex-col gap-2 text-[14.5px] text-muted-foreground">
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

      {/* ── Journey ──────────────────────────────────────────────────── */}
      <SectionRow label={section("journey").label} id="journey">
        <JourneySection />
      </SectionRow>

      {/* ── Recognition ──────────────────────────────────────────────── */}
      <SectionRow label={section("recognition").label} id="recognition">
        <RecognitionSection />
      </SectionRow>
    </>
  );
}
