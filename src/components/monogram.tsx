import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * The ACE monogram: a circle cut by a Y into three wedges, one letter per
 * wedge (A top-left, C top-right, E bottom), all in one stroke weight.
 * Drawn as strokes into a mask so the cuts stay transparent and the mark
 * fills with currentColor, following the theme with no variants.
 *
 * The favicon (src/app/icon.svg) and the iOS icon (src/app/apple-icon.tsx)
 * carry their own opaque colours instead, because browser chrome renders them
 * against backgrounds we cannot predict.
 */
export function Monogram({ className }: { className?: string }) {
  // useId output carries characters that break url(#…) references.
  const id = `mono${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox="142 142 740 740"
      className={cn("size-6", className)}
      aria-hidden="true"
      focusable="false"
    >
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
        <rect width="1024" height="1024" fill="#000" />
        <g fill="none" stroke="#fff" strokeWidth="60">
          <circle cx="512" cy="512" r="340" />
          <path d="M465.0 542.0L465.0 172.0" />
          <path d="M559.0 542.0L559.0 172.0" />
          <path d="M535.5 471.3L829.9 641.3" />
          <path d="M457.3 534.7L712.8 682.2" />
          <path d="M566.7 534.7L241.1 722.7" />
          <path d="M465.0 365.9L172.8 534.7" />
          <path d="M419.0 620.0L601.3 725.2" />
        </g>
        <g fill="none" stroke="#000">
          <path d="M772.5 293.5A340 340 0 0 1 848.7 464.7" strokeWidth="64" />
          <path d="M806.4 682.0A340 340 0 0 1 682.0 806.4" strokeWidth="64" />
          <path d="M512.0 512.0L512.0 112.0" strokeWidth="34" />
          <path d="M512.0 512.0L165.6 712.0" strokeWidth="34" />
          <path d="M512.0 512.0L858.4 712.0" strokeWidth="34" />
          <path d="M428 507H506L506 514L428 552Z" fill="#000" stroke="none" />
        </g>
      </mask>
      <rect width="1024" height="1024" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
