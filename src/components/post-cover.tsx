import Image from "next/image";

import { Monogram } from "@/components/monogram";
import { hueAt } from "@/lib/palette";
import { cn } from "@/lib/utils";

/**
 * Cover art for a blog post.
 *
 * A photograph when the post declares a `cover`, and a drawn fallback when it
 * doesn't, so a new post is never broken-looking before someone finds it an
 * image.
 *
 * Either way the post's hue from the ambient palette goes over the top. On a
 * photo that wash is what stops five stock images reading as five stock images
 * bolted onto someone else's site — it ties them to the page and gives the
 * monogram a consistent ground. Hue comes from position in the list rather than
 * a hash of the slug: hashing was stable per post but let neighbours collide,
 * and two adjacent cards in the same colour reads as a bug.
 *
 * Deliberately wordless. An earlier version set the post title into the cover,
 * so every card printed its headline twice — once here and again in the card
 * body directly beneath.
 */
export function PostCover({
  slug,
  index,
  src,
  alt,
  className,
  compact = false,
}: {
  /** Keys the SVG pattern id so two drawn covers can't share one. */
  slug: string;
  /** Position in the sorted post list — drives the hue. */
  index: number;
  /** The post's `cover` frontmatter, when it has one. */
  src?: string;
  alt?: string;
  /** Card covers are shorter than the one on the post itself. */
  compact?: boolean;
  className?: string;
}) {
  const hue = hueAt(index);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-foreground/4",
        compact ? "h-32" : "h-48 md:h-64",
        className
      )}
      style={{ "--hue": hue } as React.CSSProperties}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          // Full card width on phones, roughly the module width above that.
          sizes="(max-width: 810px) 100vw, 760px"
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 dark:opacity-55"
            style={{
              background:
                "linear-gradient(100deg, var(--hue) -10%, transparent 58%), radial-gradient(80% 180% at 92% 130%, var(--hue) 0%, transparent 62%)",
            }}
          />
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full text-foreground/9"
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
        </>
      )}

      {/* Hue wash over the photo. Multiply on the light ground keeps the
          picture's own contrast; soft-light on the dark ground tints it
          without flattening it. */}
      {src && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-45 mix-blend-multiply dark:opacity-70 dark:mix-blend-soft-light"
          style={{ backgroundColor: hue }}
        />
      )}

      {/* Scrim so the monogram holds against a busy photo. */}
      {src && (
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/20"
        />
      )}

      <Monogram
        className={cn(
          "absolute drop-shadow-sm",
          src ? "text-white/90" : "text-foreground/70",
          compact ? "top-3 left-4 size-5" : "top-4 left-5 size-6"
        )}
      />

      {/* Hairline foot, matching the rules the rest of the page is built on. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-rule" />
    </div>
  );
}

export default PostCover;
