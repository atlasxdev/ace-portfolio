import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale's custom sizes (globals.css `--text-*`). Unregistered,
 * tailwind-merge reads `text-body-sm` as a colour and drops the real colour
 * beside it, which left the pill button white on white.
 */
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["display", "h2", "h3", "body-lg", "body", "body-sm", "label"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  // Use UTC to ensure consistent formatting between server and client
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
