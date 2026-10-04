"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

const OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

/** How far each icon turns when it becomes the active one: the sun spins, the moon tips. */
const SPIN: Record<string, number> = { light: 180, dark: -25 };

const noop = () => () => {};

const resolve = (value: string) =>
  value === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value;

/**
 * Light / system / dark as a three-way segmented control.
 *
 * next-themes only knows the stored choice after mount, so nothing is marked
 * selected until then — rendering a guess on the server would either mismatch
 * on hydration or flash the wrong segment.
 *
 * A change that actually flips the palette is revealed as a circle growing
 * out of the clicked button (View Transitions). Browsers without them, and
 * reduced-motion visitors, get the instant swap.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const reduced = useReducedMotion();

  const choose = (value: string, button: HTMLElement) => {
    const flips = resolve(value) !== resolvedTheme;
    if (!flips || reduced || !document.startViewTransition) {
      setTheme(value);
      return;
    }

    const { left, top, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => {
      // next-themes applies the class in an effect; flushSync runs it inside
      // the snapshot callback so the "new" frame is the new palette.
      flushSync(() => setTheme(value));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

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
            onClick={(e) => choose(value, e.currentTarget)}
            className={cn(
              "relative grid size-6 cursor-pointer place-items-center rounded-full text-ink-faint transition-colors hover:text-foreground",
              active && "text-foreground",
            )}>
            {active && (
              <motion.span
                layoutId="mode-toggle-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-foreground/10"
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <motion.span
              aria-hidden
              className="relative"
              initial={false}
              animate={{ rotate: active && !reduced ? (SPIN[value] ?? 0) : 0 }}
              whileTap={reduced ? undefined : { scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}>
              <Icon className="size-3.5" />
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
