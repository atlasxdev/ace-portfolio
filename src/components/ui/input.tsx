"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The base styles are the site's own field treatment rather than shadcn's stock
 * neutral one, so a form control looks like the rest of the page without every
 * call site restating it. `ghost` is the chat composer: a field that sits inside
 * a bordered row and shouldn't draw a second box around itself.
 */
const inputVariants = cva(
  "w-full text-body-sm text-foreground placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "rounded-control border border-rule bg-background/60 px-3 py-2.5 transition-colors focus:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        ghost: "bg-transparent outline-none",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, variant, type, ...props }, ref) => (
  <input ref={ref} type={type} className={cn(inputVariants({ variant, className }))} {...props} />
));
Input.displayName = "Input";

export { Input, inputVariants };
