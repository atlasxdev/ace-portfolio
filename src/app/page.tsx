import { allPosts } from "content-collections";
import { ArrowRight, Calendar, Mail } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { ApproachSection } from "@/components/section/approach-section";
import { CertificationsSection } from "@/components/section/certifications-section";
import { EducationSection } from "@/components/section/education-section";
import { JourneySection } from "@/components/section/journey-section";
import { ProjectsSection } from "@/components/section/projects-section";
import { ItemList, ItemRow, SectionRow } from "@/components/section/section-row";
import { ExperienceSection } from "@/components/section/work-section";
import { RULE_DELAY } from "@/lib/motion";
import { TechGrid } from "@/components/tech-tile";
import { DATA } from "@/data/resume";
import { CAPABILITIES, TECH_BAND } from "@/data/stacks";

const HERO_LINKS = [
  { label: "LinkedIn", href: DATA.contact.social.LinkedIn.url, external: true },
  { label: "GitHub", href: DATA.contact.social.GitHub.url, external: true },
  { label: "Blog", href: "/blog", external: false },
];

export default function Page() {
  const posts = allPosts
    .slice()
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3);

  return (
    <>
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
        <Reveal kind="fade" onLoad delay={0.7}>
          <p className="mt-3 text-sm text-muted-foreground">Currently System Engineer I at VizServe Private Limited.</p>
        </Reveal>
        <Reveal kind="open" onLoad delay={0.95}>
          <div className="mt-7 flex flex-wrap items-center gap-3">
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

      {/* ── About ──────────────────────────────────────────────────────
          Its divider is the one closing the opening screen, so it belongs to
          the load cascade and lands last in it — per the motion spec — rather
          than reappearing on scroll like the dividers further down. */}
      <SectionRow
        label="About"
        id="about"
        ruleOnLoad
        ruleDelay={RULE_DELAY.min}>
        <Reveal className="glass max-w-none p-group">
          <div className="flex flex-col gap-[1.15rem] text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
            {DATA.summary.split("\n\n").map((para, i) => (
              <p key={i} className="max-w-[62ch]">
                {/* `**…**` in the summary marks the claim a skimming reader
                    should catch — the role, the numbers, the stack. Odd
                    segments of the split are the emphasised ones. */}
                {para.split("**").map((part, j) =>
                  j % 2 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            ))}
          </div>
        </Reveal>
      </SectionRow>

      {/* ── Experience ───────────────────────────────────────────────── */}
      <SectionRow label="Experience" id="experience">
        <ExperienceSection />
      </SectionRow>

      {/* ── Education ────────────────────────────────────────────────── */}
      <SectionRow label="Education" id="education">
        <EducationSection />
      </SectionRow>

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <SectionRow label="Capabilities" id="capabilities">
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
      <SectionRow label="Approach" id="approach">
        <ApproachSection />
        <Reveal kind="fade" delay={0.2}>
          <Link
            href="/blog/sdlc-in-claude-code"
            className="label mt-8 inline-flex items-center gap-2 transition-all hover:gap-3 hover:text-foreground">
            Read the full write-up <ArrowRight className="size-3" aria-hidden />
          </Link>
        </Reveal>
      </SectionRow>

      {/* ── Selected projects ────────────────────────────────────────── */}
      <SectionRow label="Selected Work" id="projects">
        <ProjectsSection />
      </SectionRow>

      {/* ── Writing ──────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <SectionRow label="Writing" id="writing">
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

      {/* ── Journey ──────────────────────────────────────────────────── */}
      <SectionRow label="Journey" id="journey">
        <JourneySection />
      </SectionRow>

      {/* ── Certifications ───────────────────────────────────────────── */}
      <SectionRow label="Certifications" id="certifications">
        <CertificationsSection />
      </SectionRow>
    </>
  );
}
