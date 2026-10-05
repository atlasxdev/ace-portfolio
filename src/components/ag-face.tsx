import { BODY, COLORS, FEET } from "@/lib/ag-art";
import { cn } from "@/lib/utils";

/**
 * Ag standing still, for the chat it answers in. Drawn in art pixels and
 * sized by className, so it stays crisp at any size that's a multiple of 12px
 * wide. While it's thinking, its eyes drift up and to the side.
 */
export function AgFace({ thinking = false, className }: { thinking?: boolean; className?: string }) {
  const eyeX = thinking ? 1 : 0;
  const eyeY = thinking ? -1 : 0;
  return (
    <svg
      viewBox="0 0 12 11"
      shapeRendering="crispEdges"
      className={cn("h-[22px] w-6 shrink-0", thinking && "ag-bob", className)}
      aria-hidden
      focusable="false">
      {BODY.flatMap((row, y) =>
        [...row].map((ch, x) =>
          COLORS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[ch]} /> : null,
        ),
      )}
      <g fill="#141414" className={thinking ? undefined : "ag-blink"}>
        <rect x={3 + eyeX} y={4 + eyeY} width={2} height={2} />
        <rect x={7 + eyeX} y={4 + eyeY} width={2} height={2} />
      </g>
      <rect x={5} y={7} width={2} height={1} fill="#2a2a2a" />
      <g fill={COLORS.X}>
        {[...FEET[0]].map((ch, x) => (ch === "X" ? <rect key={x} x={x} y={10} width={1} height={1} /> : null))}
      </g>
    </svg>
  );
}
