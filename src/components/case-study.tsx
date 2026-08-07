import { Reveal } from "@/components/motion/reveal";

/**
 * The four beats a hiring manager actually reads a piece of work for, lifted
 * out of the prose and put above it.
 *
 * The post underneath still argues the case properly; this is the version for
 * someone deciding in ten seconds whether to read it. Nothing here is a new
 * claim — each frame restates what the post goes on to demonstrate.
 *
 * Renders nothing unless a post declares the frames, so the three posts
 * without a before-and-after are untouched.
 */
export function CaseStudy({
  problem,
  constraint,
  decision,
  outcome,
}: {
  problem?: string;
  constraint?: string;
  decision?: string;
  outcome?: string;
}) {
  const frames = [
    { label: "Problem", body: problem },
    { label: "Constraint", body: constraint },
    { label: "Decision", body: decision },
    { label: "Outcome", body: outcome },
  ].filter((f): f is { label: string; body: string } => Boolean(f.body));

  if (!frames.length) return null;

  return (
    <Reveal kind="fade" delay={0.1}>
      <dl className="mt-entry grid gap-x-entry gap-y-group border-t border-rule pt-group md:grid-cols-2">
        {frames.map((frame) => (
          <div key={frame.label}>
            <dt className="label text-ink-faint">{frame.label}</dt>
            <dd className="mt-2 text-body-sm leading-[1.7] text-muted-foreground">
              {frame.body}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

export default CaseStudy;
