import Image from "next/image";

import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

/** The hero photo: the day shot, in both themes. */
export function HeroPortrait({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl border border-rule bg-foreground/5 shadow-xl shadow-black/10",
        className,
      )}>
      <Image
        src="/me-light.jpg"
        alt={`Photo of ${DATA.name}`}
        fill
        priority
        sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 90vw"
        className="scale-125 object-cover"
      />
    </div>
  );
}
