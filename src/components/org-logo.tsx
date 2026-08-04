import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Employer and school marks, on a chip so three logos drawn to three different
 * conventions still line up as a set.
 *
 * Intrinsic sizes and per-brand corrections live here rather than in DATA: the
 * data says which organisation it is, this says how that organisation's file
 * has to be handled — same split as `brand-logo.tsx`. All three are served from
 * /public rather than hotlinked; the previous values were a WordPress upload, a
 * university admin subdomain and a Google image-cache thumbnail, which is how
 * the certification logos broke.
 */
const ART: Record<
  string,
  { width: number; height: number; adjust?: string }
> = {
  "/orgs/vizserve.png": { width: 500, height: 412 },
  "/orgs/laguna-university.png": { width: 300, height: 300 },
  // Lamina's mark is pure black artwork. Ace supplied it as a JPEG on an
  // opaque white ground (lamina-studios.jpg, kept alongside as the source);
  // lamina-studios.png is that file with the white keyed out to alpha and the
  // margins trimmed, so it sits in the chip like the other two instead of as a
  // white tile. Inverting on the dark ground turns the black art white.
  "/orgs/lamina-studios.png": { width: 592, height: 480, adjust: "dark:invert" },
};

export function OrgLogo({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const art = src ? ART[src] : undefined;

  // No file yet: the initial stands in, so a missing logo is a quiet chip
  // rather than a broken image.
  if (!src || !art) {
    return (
      <span
        aria-hidden
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-lg border border-rule bg-foreground/4",
          "font-display text-base font-semibold text-muted-foreground",
          className
        )}
      >
        {alt.charAt(0)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-rule bg-foreground/4 px-2",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={art.width}
        height={art.height}
        // Height-constrained with a free width, so the square seals and the
        // 2:1 wordmark both read at their own proportions instead of one of
        // them being squashed into the other's box.
        className={cn("h-8 w-auto max-w-28 object-contain", art.adjust)}
      />
    </span>
  );
}
