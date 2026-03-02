/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;

export default function CertificationsSection() {
  return (
    <section id="certifications">
      <div className="flex min-h-0 flex-col gap-y-6">
        <h2 className="text-xl font-bold">Certifications</h2>
        <div className="flex flex-col gap-6 w-full">
          {DATA.certifications.map((cert, id) => (
            <BlurFade key={cert.title} delay={BLUR_FADE_DELAY * 14 + id * 0.05}>
              <div className="flex items-start gap-x-4 p-1">
                <div className="flex-none">
                  {cert.logoUrl ? (
                    <img
                      src={cert.logoUrl}
                      alt={cert.issuer}
                      className="size-12 md:size-14 p-1 border rounded-md shadow-sm bg-white object-contain"
                    />
                  ) : (
                    <div className="size-12 md:size-14 border rounded-md bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h3 className="font-semibold text-base leading-tight">{cert.title}</h3>
                  <div className="text-sm">
                    <Link href={cert.issuerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {cert.issuer}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">Issued {cert.date}</div>
                  {cert.credentialId && (
                    <div className="text-xs text-muted-foreground">Credential ID {cert.credentialId}</div>
                  )}
                  <div className="mt-2">
                    <Link
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-border hover:bg-muted transition-colors">
                      Show credential
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
              {id < DATA.certifications.length - 1 && <div className="mt-6 h-px bg-border/50 w-full" />}
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
