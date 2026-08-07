import { Reveal } from "@/components/motion/reveal";
import { IMPACT } from "@/data/impact";

/**
 * The numbers, up where a skimming reader hits them.
 *
 * Deliberately typographic and static: no counting-up animation, no cards, no
 * icons. An animated stat counter is the single most templated thing a
 * portfolio can do, and it also delays the only content on the page a recruiter
 * might screenshot. The figures carry themselves at display size; everything
 * else here is a caption.
 *
 * Divider-led like Selected Work, so it reads as part of the same page rather
 * than a widget dropped into it.
 */
export function ImpactSection() {
  return (
    <dl className="grid gap-x-group gap-y-entry sm:grid-cols-2 lg:grid-cols-4">
      {IMPACT.map((item, i) => (
        <Reveal key={item.label} delay={Math.min(i * 0.06, 0.24)}>
          <div className="border-t border-rule pt-group">
            <dt className="font-display text-[32px] leading-[1.05] font-semibold tracking-[-0.02em] text-balance">
              {item.value}
            </dt>
            <dd className="mt-2.5 text-body-sm font-medium">{item.label}</dd>
            <dd className="mt-1 text-body-sm leading-[1.6] text-ink-faint">
              {item.note}
            </dd>
          </div>
        </Reveal>
      ))}
    </dl>
  );
}

export default ImpactSection;
