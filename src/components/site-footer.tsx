import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/motion/reveal";
import { DATA } from "@/data/resume";
import { ArrowRight, Calendar, Mail } from "lucide-react";
import Link from "next/link";

const SOCIALS = [
  { label: "LinkedIn", href: DATA.contact.social.LinkedIn.url },
  { label: "GitHub", href: DATA.contact.social.GitHub.url },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-section border-t border-rule bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="shell pt-section pb-entry">
        {/* the one dramatic entry on the page */}
        <Reveal kind="fade">
          <p className="label">Let&rsquo;s work together</p>
        </Reveal>
        <Reveal kind="rise" className="overflow-hidden">
          <p className="mt-snug font-display text-[40px] leading-[44px] font-semibold tracking-[-0.03em] md:text-h2">
            {DATA.name}
          </p>
        </Reveal>

        <Reveal kind="rise" delay={0.15}>
          <div className="mt-entry flex flex-wrap items-center gap-tight">
            <a
              href={DATA.contact.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-body-sm font-medium text-background transition-transform duration-300 hover:-translate-y-0.5">
              <Calendar className="size-4" aria-hidden />
              Schedule a 15-min call
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
            <a
              href={`mailto:${DATA.contact.email}`}
              className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-body-sm font-medium">
              <Mail className="size-4" aria-hidden />
              Send an email
            </a>
          </div>
        </Reveal>

        {/* availability on the left, contact + clipboard on the right */}
        <Reveal kind="rise" delay={0.22}>
          <div className="mt-entry flex flex-wrap items-center justify-between gap-group border-t border-rule pt-group">
            <p className="text-available text-body-sm font-medium">Open to full-time and contract work</p>

            <div className="flex items-center gap-tight">
              <a
                href={`mailto:${DATA.contact.email}`}
                className="text-body-sm font-medium transition-colors hover:text-muted-foreground">
                {DATA.contact.email}
              </a>
              <CopyButton value={DATA.contact.email} variant="solid" />
            </div>
          </div>
        </Reveal>

        {/* socials + copyright, below a second rule */}
        <Reveal kind="fade" delay={0.3}>
          <div className="mt-entry flex flex-wrap items-center justify-between gap-group border-t border-rule pt-group">
            <nav className="flex flex-wrap items-center gap-group">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-sm font-medium transition-colors hover:text-muted-foreground">
                  {s.label}
                </a>
              ))}
              <Link href="/blog" className="text-body-sm font-medium transition-colors hover:text-muted-foreground">
                Blog
              </Link>
              <Link
                href="/tech-stacks"
                className="text-body-sm font-medium transition-colors hover:text-muted-foreground">
                Stacks
              </Link>
            </nav>
            <span className="label text-ink-faint">
              &copy; {year} {DATA.name}
            </span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
