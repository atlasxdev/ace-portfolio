import Image from "next/image";

import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

/**
 * The hero photo: the day shot in light mode, the night shot in dark mode,
 * and the "shy" take of each on hover. All four are stacked and swapped with
 * CSS (`dark:` + `group-hover:`), so the right one shows before hydration and
 * there's no theme flash.
 */
const SHOTS = [
  { src: "/me-light.jpg", show: "opacity-100 group-hover:opacity-0 dark:opacity-0" },
  { src: "/me-light-shy.png", show: "opacity-0 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-0" },
  { src: "/me-dark.png", show: "opacity-0 dark:opacity-100 dark:group-hover:opacity-0" },
  { src: "/me-dark-shy.png", show: "opacity-0 dark:group-hover:opacity-100" },
];

export function HeroPortrait({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Photo of ${DATA.name}`}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl border border-rule bg-foreground/5 shadow-xl shadow-black/10",
        className,
      )}>
      {SHOTS.map((shot, i) => (
        <Image
          key={shot.src}
          src={shot.src}
          alt=""
          fill
          priority={i === 0 || i === 2}
          sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 90vw"
          className={cn("object-cover transition-opacity duration-500 scale-125", shot.show)}
        />
      ))}
    </div>
  );
}
