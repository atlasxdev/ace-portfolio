import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";
import { OrgLogo } from "@/components/org-logo";

/**
 * Work experience: employer, role, and what was achieved there.
 *
 * Deliberately no project breakdowns — those are their own section, and the
 * promotion is a milestone on the timeline. This answers "where has he worked
 * and what came of it", nothing else.
 */
const BULLET =
  "relative pl-5 before:absolute before:left-0 before:top-[0.62em] before:size-[5px] before:rounded-full before:bg-ink-faint";
const BODY = "max-w-[72ch] text-sm leading-[1.7] text-muted-foreground";

/** Descriptions are authored as "- item" lines; prose entries stay one block. */
function toBullets(description: string): string[] {
  return description
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export function ExperienceSection() {
  return (
    <div className="flex flex-col gap-4">
      {DATA.work.map((job, i) => {
        const bullets = toBullets(job.description);

        return (
          <Reveal
            key={job.company}
            delay={i * 0.08}
            className="glass p-group md:p-entry"
          >
            <div className="flex items-start gap-4">
              <OrgLogo src={job.logoUrl} alt={job.company} />

              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-6 max-lg:flex-col max-lg:items-start max-lg:gap-1.5">
                {/* Company and role share a line with a slash between them
                    while there's room. On a phone that wrap left orphans like
                    a lone "I" from "System Engineer I", so the role drops to
                    its own line and the separator goes with it. */}
                <h3 className="min-w-0 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
                  {job.company}
                  <span className="mx-2.5 font-normal text-ink-faint max-md:hidden">
                    /
                  </span>
                  <span className="font-normal text-muted-foreground max-md:mt-0.5 max-md:block">
                    {job.title}
                  </span>
                </h3>
                <span className="label text-ink-faint lg:shrink-0">
                  {job.start} — {job.end}
                </span>
              </div>
            </div>

            {bullets.length > 1 ? (
              <ul className="mt-6 flex flex-col gap-3">
                {bullets.map((bullet) => (
                  <li key={bullet} className={`${BULLET} ${BODY}`}>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-5 ${BODY}`}>{bullets[0]}</p>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export default ExperienceSection;
