import { allPosts } from "content-collections";

import { APPROACH } from "@/data/approach";
import { DATA } from "@/data/resume";
import { CAPABILITIES, STACK_GROUPS } from "@/data/stacks";

/**
 * What Ag knows about Ace, rendered from the same data the site shows. The
 * whole profile is a few thousand tokens, so it rides along in the system
 * prompt rather than being retrieved: every fact is always in view, and a
 * new job, project or certificate reaches Ag the moment it reaches the page.
 */

// Markdown emphasis and bullet dashes are noise to the model.
const plain = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "");
const bullets = (s: string) =>
  plain(s)
    .split("\n")
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean)
    .map((l) => `    - ${l}`)
    .join("\n");

const section = (title: string, lines: string[]) => `${title}:\n${lines.join("\n")}`;

export const AG_PROFILE = [
  `Name: ${DATA.name}. Based in ${DATA.location}. Website: ${DATA.url}.`,
  `Summary: ${plain(DATA.summary).replace(/\n+/g, " ")}`,
  `Contact: email ${DATA.contact.email}; ${Object.values(DATA.contact.social)
    .filter((s) => s.navbar)
    .map((s) => `${s.name} ${s.url}`)
    .join("; ")}; a free 15-minute call can be booked on the site's /schedule page.`,

  section(
    "Work experience",
    DATA.work.map((w) =>
      [
        `  - ${w.title} at ${w.company} (${w.start} - ${w.end}, ${w.location})`,
        "previousTitle" in w && w.previousTitle ? `    Previously: ${w.previousTitle}` : "",
        bullets(w.description),
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ),

  section(
    "Education and training",
    DATA.education.map((e) => `  - ${e.degree}, ${e.school} (${e.start} - ${e.end})`),
  ),

  section(
    "Projects",
    DATA.projects.map((p) => {
      const links = p.links.map((l) => `${l.type}: ${l.href}`).join("; ");
      return `  - ${p.title} (${p.dates}). ${plain(p.description)} Tech: ${p.technologies.join(", ")}.${links ? ` Links: ${links}.` : ""}`;
    }),
  ),

  section(
    "Awards",
    DATA.awards.map((a) => `  - ${a.title}, ${a.issuer}, ${a.date}. "${a.citation}"`),
  ),

  section(
    "Certifications",
    DATA.certifications.map((c) => `  - ${c.title}, ${c.issuer}, ${c.date}.`),
  ),

  section(
    "Skills",
    STACK_GROUPS.map((g) => `  - ${g.group}: ${g.items.map((t) => t.name).join(", ")}`),
  ),
  `Capabilities: ${CAPABILITIES.flat().join("; ")}.`,

  section(
    "How he works (the Approach section of the site, five stages)",
    APPROACH.map((s, i) => `  ${i + 1}. ${s.stage}: ${s.title}. ${s.body}`),
  ),

  section(
    "Journey (milestones, in order)",
    DATA.journey.map((j) => `  - ${j.dates}, ${j.title}: ${plain(j.description)}`),
  ),

  section(
    "Blog posts and case studies on the site",
    allPosts.map((p) => {
      const slug = p._meta.path.replace(/\.mdx$/, "");
      const frames = [p.problem, p.decision, p.outcome].filter(Boolean).join(" ");
      return `  - "${p.title}" (/blog/${slug}): ${p.summary}${frames ? ` ${frames}` : ""}`;
    }),
  ),
].join("\n\n");
