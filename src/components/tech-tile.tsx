import { BrandLogo } from "@/components/brand-logo";
import type { Tech } from "@/data/stacks";
import { cn } from "@/lib/utils";

export function TechTile({ tech }: { tech: Tech }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-transparent bg-foreground/3 px-2.5 py-2",
        "text-[13.5px] text-muted-foreground",
        "transition-[color,background-color,border-color,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-foreground/7 hover:text-foreground"
      )}
    >
      {tech.logo ? (
        <BrandLogo name={tech.logo} />
      ) : (
        <span aria-hidden className="size-4.5 shrink-0" />
      )}
      <span>{tech.name}</span>
    </div>
  );
}

export function TechGrid({ items }: { items: Tech[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2">
      {items.map((tech) => (
        <TechTile key={tech.name} tech={tech} />
      ))}
    </div>
  );
}
