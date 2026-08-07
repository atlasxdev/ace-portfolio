import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";

/**
 * The journey is a sequence, so it gets a real timeline — a continuous rule
 * with a node per milestone — rather than the same detached card every other
 * list uses. The order is what carries the meaning here.
 *
 * Newest first, matching Experience and Projects above it.
 */
export function JourneySection() {
  const milestones = [...DATA.journey].reverse();

  return (
    <div className="relative">
      {/* the spine */}
      <div
        aria-hidden
        className="absolute top-2 bottom-2 left-[5px] w-px bg-rule"
      />

      <ol className="flex flex-col gap-10">
        {milestones.map((item, i) => (
          <li key={item.title}>
            <Reveal delay={Math.min(i * 0.05, 0.2)}>
              <div className="flex items-start gap-6">
                <span
                  aria-hidden
                  className="relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full bg-foreground ring-4 ring-background"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="label text-ink-faint">{item.dates}</span>
                    {item.location && (
                      <span className="label text-ink-faint">
                        &middot; {item.location}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-[16px] leading-snug font-semibold tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 max-w-[78ch] text-sm leading-[1.7] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default JourneySection;
