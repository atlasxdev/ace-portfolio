import Image from "next/image";

import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";

/**
 * A certification is a claim someone else can verify, so the whole card is the
 * credential link. The issuer's mark leads at full size on a dark plate: most
 * of them are white-only wordmarks (Codebility, freeCodeCamp, MongoDB), which
 * vanish on a light ground, so the plate stays dark in both themes — the way
 * each brand presents them anyway.
 *
 * Marks are contained in one box, so square ones (Cisco, Anthropic) fill its
 * height and wide wordmarks fill its width — similar optical weight for both.
 */
export function CertificationsSection() {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2">
      {DATA.certifications.map((cert, i) => {
        const body = (
          <>
            <div className="relative flex h-32 items-center justify-center border-b border-rule bg-[#141414]">
              {cert.logoUrl ? (
                <div className="relative h-12 w-3/5 max-w-52">
                  <Image
                    src={cert.logoUrl}
                    alt={cert.issuer}
                    fill
                    sizes="208px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span
                  aria-hidden
                  className="font-display text-3xl font-semibold text-white/70"
                >
                  {cert.issuer.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-[14px] leading-snug font-semibold tracking-[-0.01em]">
                  {cert.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.issuer}, {cert.date}
                </p>
              </div>
              {cert.credentialUrl ? (
                <span
                  aria-hidden
                  className="text-base leading-none text-ink-faint transition-all duration-300 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-foreground"
                >
                  &#8599;
                </span>
              ) : (
                <span className="label shrink-0 text-ink-faint">
                  On request
                </span>
              )}
            </div>
          </>
        );

        return (
          <Reveal key={cert.title} delay={i * 0.06} className="h-full">
            {cert.credentialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${cert.title}, ${cert.issuer} — verify credential`}
                className="glass glass-hover group block h-full overflow-hidden"
              >
                {body}
              </a>
            ) : (
              <div className="glass h-full overflow-hidden">{body}</div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export default CertificationsSection;
