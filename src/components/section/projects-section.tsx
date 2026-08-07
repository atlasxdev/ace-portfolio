import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";

/**
 * Selected work.
 *
 * Divider-separated rows rather than cards, per the reference: title on the
 * left, destination and year on the right, description beneath, thin rule
 * closing each entry. 24px internal, 48px below — the portfolio-card spec.
 *
 * No screenshots and no tech pills: only some of these have a UI to show, and
 * the reference entry carries destination + year, not a stack list. The stack
 * for each still lives in `DATA.projects[].technologies` if it's wanted back.
 */

const ROW = "group block border-b border-rule pb-entry";

function RowBody({
  title,
  type,
  dates,
  description,
  linked,
}: {
  title: string;
  type?: string;
  dates: string;
  description: string;
  linked: boolean;
}) {
  return (
    <>
      {/* Title and meta share a line only once the content module is at full
          width. Below 1200px the 144px label gutter squeezes the module, and a
          24px title beside a shrink-0 meta cannot fit — it pushed the whole
          page wider than the viewport. */}
      <div className="flex items-baseline justify-between gap-group max-lg:flex-col max-lg:items-start max-lg:gap-tight">
        <h3 className="min-w-0 text-h3 font-semibold tracking-[-0.01em]">
          {title}
        </h3>

        <span className="label flex items-center gap-group text-ink-faint lg:shrink-0">
          {type && (
            <>
              <span className="transition-colors group-hover:text-foreground">
                {type}
              </span>
              <span aria-hidden className="text-rule">
                |
              </span>
            </>
          )}
          <span className="transition-colors group-hover:text-foreground">
            {dates}
          </span>
          {linked && (
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
              aria-hidden
            />
          )}
        </span>
      </div>

      <p className="mt-group max-w-[72ch] text-body-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </>
  );
}

export function ProjectsSection() {
  return (
    <div className="flex flex-col">
      {DATA.projects.map((project, i) => {
        const primary = project.links[0];
        const rowClass = cn(ROW, i > 0 && "pt-entry");
        const body = (
          <RowBody
            title={project.title}
            type={primary?.type}
            dates={project.dates}
            description={project.description}
            linked={Boolean(primary)}
          />
        );

        return (
          <Reveal key={project.title} delay={Math.min(i * 0.05, 0.2)}>
            {!primary ? (
              <div className={rowClass}>{body}</div>
            ) : primary.href.startsWith("http") ? (
              <a
                href={primary.href}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass}
              >
                {body}
              </a>
            ) : (
              <Link href={primary.href} className={rowClass}>
                {body}
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export default ProjectsSection;
