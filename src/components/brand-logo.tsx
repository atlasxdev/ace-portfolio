import { cn } from "@/lib/utils";
import { LOGOS } from "@/lib/logos";

/**
 * Brands whose mark cannot be used as shipped on a near-black ground:
 * Next.js is a solid black disc, Elementor's brand magenta is very dark.
 * Handled here rather than by editing the SVGs, so the files stay identical
 * to what each brand publishes.
 */
const ADJUST: Record<string, string> = {
  nextjs: "dark:invert",
  elementor: "dark:brightness-[1.95] dark:saturate-150",
  // Cypress's wordmark is near-black navy. invert flips the lightness and
  // hue-rotate puts the hues back, so the green stays green.
  cypress: "dark:invert dark:hue-rotate-180",
};

/** Brands with no public SVG anywhere — a deliberate lettermark, not a gap. */
const LETTERMARK: Record<string, { label: string; color: string }> = {
  zustand: { label: "Z", color: "#bd7b3f" },
  gohighlevel: { label: "GH", color: "#2dd4bf" },
  manatal: { label: "M", color: "#0ea5e9" },
  fathom: { label: "F", color: "#a855f7" },
  hitpay: { label: "HP", color: "#1e40e6" },
};

export function BrandLogo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const art = LOGOS[name];

  if (!art) {
    const fallback = LETTERMARK[name];
    if (!fallback) {
      return <span aria-hidden className="block size-4.5 shrink-0" />;
    }
    return (
      <span
        aria-hidden
        className={cn(
          "grid size-4.5 shrink-0 place-items-center rounded-[5px]",
          "font-mono text-[9px] leading-none font-bold text-white",
          className
        )}
        style={{ backgroundColor: fallback.color }}
      >
        {fallback.label}
      </span>
    );
  }

  // Wordmark-shaped marks keep their aspect: fixed height, auto width.
  // Forcing them square renders them a few pixels tall and unreadable.
  const box = art.wide
    ? "h-4.5 w-auto max-w-[42px] shrink-0 [&>svg]:h-full [&>svg]:w-auto"
    : "size-4.5 shrink-0 [&>svg]:size-full";

  const adjust = ADJUST[name];

  if ("one" in art) {
    return (
      <span
        aria-hidden
        className={cn("block", box, adjust, className)}
        dangerouslySetInnerHTML={{ __html: art.one }}
      />
    );
  }

  // Brands that publish separate light/dark marks — show whichever suits the
  // current ground rather than filtering a single file.
  return (
    <>
      <span
        aria-hidden
        className={cn("block dark:hidden", box, className)}
        dangerouslySetInnerHTML={{ __html: art.light }}
      />
      <span
        aria-hidden
        className={cn("hidden dark:block", box, className)}
        dangerouslySetInnerHTML={{ __html: art.dark }}
      />
    </>
  );
}
