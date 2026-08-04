"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable clipboard control, used beside contact details in the header and
 * the footer. Two treatments: `outline` sits among the header's bordered
 * controls, `solid` is the filled pill the footer uses next to the address.
 */
export function CopyButton({
  value,
  variant = "outline",
  label = "Copy",
  className,
}: {
  value: string;
  variant?: "outline" | "solid";
  /** Hide on very small screens where the icon alone is enough. */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — the value is visible next to the button anyway
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label}: copied` : `${label} ${value}`}
      className={cn(
        "label flex shrink-0 items-center gap-1.5 transition-colors",
        variant === "outline"
          ? "rounded-control border border-rule px-2 py-1 hover:border-foreground/30 hover:text-foreground"
          : "rounded-full bg-foreground px-3 py-1.5 text-background hover:bg-foreground/90",
        className
      )}
    >
      {copied ? (
        <Check className="size-3" aria-hidden />
      ) : (
        <Copy className="size-3" aria-hidden />
      )}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
