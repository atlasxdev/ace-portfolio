"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

const noop = () => () => {};

/**
 * Light / system / dark as a three-way segmented control.
 *
 * next-themes only knows the stored choice after mount, so nothing is marked
 * selected until then — rendering a guess on the server would either mismatch
 * on hydration or flash the wrong segment.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full border border-rule p-0.5", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-6 cursor-pointer place-items-center rounded-full text-ink-faint transition-colors hover:text-foreground",
              active && "bg-foreground/10 text-foreground",
            )}>
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
