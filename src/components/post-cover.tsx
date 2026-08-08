import { Monogram } from "@/components/monogram";
import { hueAt } from "@/lib/palette";
import { cn } from "@/lib/utils";

/**
 * Generic cover for a blog post.
 *
 * Drawn, not photographed: CSS and one inline SVG, so there are no image files
 * to keep in sync with the writing, nothing to download, and it works at any
 * size. Each post gets a stable hue from the page's own ambient palette, so the
 * covers read as a set rather than as five unrelated pictures.
 *
 * The OG image routes were not a usable template here — their palette is
 * hardcoded light (#ffffff / #fafafa / #141414), which would invert badly on
 * the dark ground. This is built from the theme tokens instead.
 */
export function PostCover({
  slug,
  index,
  className,
  compact = false,
}: {
  /** Only used to key the SVG pattern id, so two covers can't share one. */
  slug: string;
  /** Position in the sorted post list — drives the hue. */
  index: number;
  /** Card covers are shorter than the one on the post itself. */
  compact?: boolean;
  className?: string;
}) {
  const hue = hueAt(index);

  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-foreground/4",
        compact ? "h-20" : "h-36 md:h-44",
        className
      )}
      style={{ "--hue": hue } as React.CSSProperties}
    >
      {/* The wash. Two offset radial pools of the post's hue, kept low enough
          to stay behind the type in both themes. */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-55"
        style={{
          background:
            "linear-gradient(100deg, var(--hue) -10%, transparent 58%), radial-gradient(80% 180% at 92% 130%, var(--hue) 0%, transparent 62%)",
        }}
      />

      {/* A faint grid, so the surface has some structure rather than being a
          plain gradient. Masked out toward the edges. */}
      <svg
        className="absolute inset-0 h-full w-full text-foreground/[0.09]"
        style={{
          maskImage:
            "radial-gradient(75% 75% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(75% 75% at 50% 50%, #000 30%, transparent 100%)",
        }}
      >
        <defs>
          <pattern
            id={`grid-${slug}`}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M28 0H0V28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      <Monogram
        className={cn(
          "absolute text-foreground/70",
          compact ? "top-1/2 left-5 size-5 -translate-y-1/2" : "top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2"
        )}
      />

      {/* Hairline foot, matching the rules the rest of the page is built on. */}
      <span className="absolute inset-x-0 bottom-0 h-px bg-rule" />
    </div>
  );
}

export default PostCover;
