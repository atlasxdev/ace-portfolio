import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";

/**
 * A certification is a claim someone else can verify, so the credential link is
 * the point — it gets its own affordance rather than being buried in the row.
 *
 * `logoUrl` expects a local path under /public (e.g. "/certs/codebility.png").
 * The previous values were LinkedIn signed URLs carrying `?e=` expiry
 * timestamps that lapsed in March 2026, so they were already broken. Until a
 * file is dropped in, the issuer's initial stands in — no dead image.
 */
export function CertificationsSection() {
  return (
    <div className="flex flex-col gap-2.5">
      {DATA.certifications.map((cert, i) => (
        <Reveal key={cert.title} delay={i * 0.06} className="glass p-6">
          <div className="flex items-start justify-between gap-6 max-md:flex-col max-md:gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {cert.logoUrl ? (
                // Both issuers publish white-only wordmarks with a wide aspect
                // (Codebility 1288×295, freeCodeCamp 2100×240). A square chip
                // would squash them and white-on-white vanishes in light mode,
                // so they sit on a dark plate at their natural ratio in both
                // themes — which is how each brand presents them anyway.
                <span className="flex h-11 shrink-0 items-center rounded-lg border border-rule bg-[#141414] px-3">
                  <Image
                    src={cert.logoUrl}
                    alt={cert.issuer}
                    width={132}
                    height={24}
                    className="h-4.5 w-auto max-w-31 object-contain"
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-lg border border-rule bg-foreground/4 font-display text-base font-semibold text-muted-foreground"
                >
                  {cert.issuer.charAt(0)}
                </span>
              )}

              <div className="min-w-0">
                <h3 className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">
                  {cert.title}
                </h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a
                    href={cert.issuerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground underline decoration-rule underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
                  >
                    {cert.issuer}
                  </a>
                  <span className="label text-ink-faint">
                    &middot; {cert.date}
                  </span>
                </p>
                {cert.credentialId && (
                  <p className="mt-2 font-mono text-[10.5px] break-all text-ink-faint">
                    ID {cert.credentialId}
                  </p>
                )}
              </div>
            </div>

            {cert.credentialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Verify
                <ArrowUpRight
                  className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  aria-hidden
                />
              </a>
            ) : (
              <span className="label shrink-0 text-ink-faint">
                Credential on request
              </span>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default CertificationsSection;
