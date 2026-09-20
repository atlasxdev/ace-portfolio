"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Which icon shows is decided by CSS `dark:` variants rather than by reading
 * the resolved theme in JS. next-themes only knows the real theme after mount,
 * so rendering conditionally would either mismatch on hydration or flash the
 * wrong icon.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="control"
      size="control"
      aria-label="Toggle colour theme"
      className={cn("shrink-0", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <MoonIcon className="size-3.5 dark:hidden" aria-hidden />
      <SunIcon className="hidden size-3.5 dark:block" aria-hidden />
    </Button>
  );
}
