"use client";

import * as React from "react";

import { inputVariants } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Same field treatment as `Input`, so the two never drift apart. */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputVariants(), "resize-y", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
