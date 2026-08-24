import { ArrowUpRight } from "lucide-react";

import { DATA } from "@/data/resume";
import { OrgLogo } from "@/components/org-logo";
import { Reveal } from "@/components/motion/reveal";

/**
 * Awards, deliberately not folded into `CertificationsSection`.
 *
 * The two sections make different claims. A certification is a completion —
 * the credential link exists so a reader can check the claim, which is why
 * that section leads with "Verify". An award is a selection, and the
 * interesting part isn't that it can be verified but what it was given for.
 * So this row leads with the citation and treats the PDF as supporting
 * evidence rather than the point.
 *
 * Ordered strongest first: Founders' Choice is a named pick by the founder,
 * Code Builder is scoped to the technical work. Both were issued on the same
 * date, so page order carries the weight that a date sort wouldn't.
 */
export function RecognitionSection() {
  return (
    <div className="flex flex-col gap-2.5">
      {DATA.awards.map((award, i) => (
        <Reveal key={award.title} delay={i * 0.06} className="glass p-6">
          <div className="flex items-start gap-4">
            <OrgLogo src={award.logoUrl} alt={award.issuer} />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-6 max-md:flex-col max-md:gap-1">
                <h3 className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">
                  {award.title}
                </h3>
                <span className="label shrink-0 text-ink-faint">
                  {award.date}
                </span>
              </div>

              <p className="mt-1.5">
                <a
                  href={award.issuerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground underline decoration-rule underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
                >
                  {award.issuer}
                </a>
              </p>

              {/* The issuer's own wording. It answers the question the award
                  name raises but doesn't settle — what it was actually for —
                  which is the whole reason a bare award line reads as filler. */}
              <p className="mt-3 max-w-[76ch] text-sm text-muted-foreground">
                {award.citation}
              </p>

              {award.credentialUrl && (
                <a
                  href={award.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label group mt-4 inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  View certificate
                  <ArrowUpRight
                    className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                    aria-hidden
                  />
                </a>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default RecognitionSection;
