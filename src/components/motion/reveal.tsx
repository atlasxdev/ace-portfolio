import { cn } from "@/lib/utils";

/**
 * Content wrappers that used to fade and lift into view on scroll.
 *
 * The entrances are gone: content that starts at opacity 0 in the server HTML
 * is invisible until JavaScript runs, which delays the largest paint and
 * leaves crawlers rendering a page whose text isn't on screen yet. These now
 * render their children in place, straight from the server. The props stay
 * so call sites don't have to change.
 */

interface RevealProps {
  kind?: "rise" | "fade";
  delay?: number;
  className?: string;
  children?: React.ReactNode;
  role?: string;
  onLoad?: boolean;
}

export function Reveal({ className, children, role }: RevealProps) {
  return (
    <div className={cn(className)} role={role}>
      {children}
    </div>
  );
}

export function RevealGroup({
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

/** Hairline divider. */
export function Rule({ className }: { className?: string; delay?: number; onLoad?: boolean }) {
  return <div role="separator" className={cn("h-px w-full bg-rule", className)} />;
}
