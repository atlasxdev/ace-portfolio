"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      type="button"
      onClick={copy}
      variant={variant === "outline" ? "control" : "pill"}
      size="pill-sm"
      aria-label={copied ? `${label}: copied` : `${label} ${value}`}
      className={cn(
        "label shrink-0",
        // The filled treatment here shifts tone on hover rather than lifting:
        // it sits inline with text, where a rising button reads as a wobble.
        variant === "outline" ? "px-2 py-1" : "hover:translate-y-0 hover:bg-foreground/90",
        className,
      )}>
      {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
      <span>{copied ? "Copied" : label}</span>
    </Button>
  );
}
