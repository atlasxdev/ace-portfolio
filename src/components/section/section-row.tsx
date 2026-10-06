import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, Rule } from "@/components/motion/reveal";

/**
 * The spine of the whole page: a header line (the section's small-caps label,
 * plus an optional link at the far end) stacked above its content, every
 * section at the same width, separated by hairline rules.
 */
export function SectionRow({
  label,
  id,
  rule = true,
  ruleDelay = 0,
  ruleOnLoad = false,
  action,
  className,
  children,
}: {
  label: string;
  id?: string;
  /** Draw the divider above this section. */
  rule?: boolean;
  /** Delay the divider — the first one belongs to the opening cascade. */
  ruleDelay?: number;
  /** Play the divider on load rather than on scroll. */
  ruleOnLoad?: boolean;
  /** A link on the header line, pushed to the far end ("View all projects"). */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {rule && (
        <div className="shell">
          <Rule delay={ruleDelay} onLoad={ruleOnLoad} />
        </div>
      )}
      <section id={id} className={cn("shell py-section", className)}>
        {/* The label is the section heading, so it's an <h2>. As a styled
            div the document went h1 -> h3 with nothing in between, which
            costs a crawler the page's outline. Tailwind's reset drops
            heading font-size and weight to inherit, so it takes the .label
            treatment from the wrapper and looks identical. */}
        <Reveal kind="fade" className="label mb-group flex items-baseline justify-between gap-group">
          <h2 className="text-[12px] leading-4 text-foreground">{label}</h2>
          {action}
        </Reveal>
        <div>{children}</div>
      </section>
    </>
  );
}

/** The link that goes in a `<SectionRow action>`: label type, arrow nudges on hover. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-[11px] leading-4 transition-colors hover:text-foreground">
      {children}
      <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

/** A row inside a list — used by projects, writing, journey, certifications. */
export function ItemRow({
  title,
  meta,
  href,
  external,
  logo,
  cover,
  children,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  href?: string;
  external?: boolean;
  /** Optional mark to the left of the row — an <OrgLogo>, typically. */
  logo?: React.ReactNode;
  /**
   * Optional full-bleed banner above the row's content. Negative margins undo
   * the card's own padding so it reaches the edges. Only the blog index passes
   * one; projects, journey and certifications render exactly as before.
   */
  cover?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-1">
        <span className="inline-flex items-baseline gap-2 text-[14px] leading-snug font-semibold tracking-[-0.01em]">
          {title}
          {href && (
            <span
              aria-hidden
              className="-translate-x-1 font-mono text-xs text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              &#8599;
            </span>
          )}
        </span>
        {meta && (
          <span className="label shrink-0 text-ink-faint">{meta}</span>
        )}
      </div>
      {children && (
        <div className="mt-2 max-w-[76ch] text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </>
  );

  const withCover = (node: React.ReactNode) =>
    cover ? (
      <>
        <div className="-mx-5 -mt-[1.15rem] mb-4 overflow-hidden rounded-t-[calc(var(--radius)-1px)]">
          {cover}
        </div>
        {node}
      </>
    ) : (
      node
    );

  const inner = logo ? (
    <div className="flex items-start gap-4">
      {logo}
      <div className="min-w-0 flex-1">{body}</div>
    </div>
  ) : (
    body
  );

  const shared =
    "glass glass-hover group block overflow-hidden px-5 py-[1.15rem]";
  const content = withCover(inner);

  if (!href) return <div className={shared}>{content}</div>;

  return (
    <a
      href={href}
      className={shared}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {content}
    </a>
  );
}

export function ItemList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5">{children}</div>;
}
