import { BODY, COLORS, FEET } from "../../../src/lib/ag-art";

/**
 * Ag, drawn exactly as the site draws it (src/components/ag-pet.tsx), from
 * the same art (src/lib/ag-art.ts). `px` is the size of one art pixel.
 */
export type AgLook = {
  eyes?: "open" | "happy" | "shut" | "annoyed";
  /** Where the open eyes look, in art pixels (-1, 0 or 1). */
  lookX?: number;
  lookY?: number;
  shades?: boolean;
  blush?: boolean;
  /** Mouth height in art pixels: 1, or 2 for a yawn. */
  mouth?: number;
  /** Which of the two walking frames the feet are on. */
  foot?: 0 | 1;
};

export const AG_W = 12;
export const AG_H = 11;
const INK = "#141414";

export function AgSprite({ px, eyes = "open", lookX = 0, lookY = 0, shades, blush, mouth = 1, foot = 0 }: AgLook & { px: number }) {
  const r = (x: number, y: number, w: number, h: number, fill = INK, key?: string) => (
    <rect key={key} x={x * px} y={y * px} width={w * px} height={h * px} fill={fill} />
  );
  return (
    <svg width={AG_W * px} height={AG_H * px} shapeRendering="crispEdges" style={{ display: "block", overflow: "visible", filter: `drop-shadow(0 ${px * 0.4}px 0 rgba(0,0,0,.25))` }}>
      {BODY.flatMap((row, y) => [...row].map((ch, x) => (COLORS[ch] ? r(x, y, 1, 1, COLORS[ch], `${x}-${y}`) : null)))}
      {eyes === "shut" && <>{r(3, 5, 2, 0.5)}{r(7, 5, 2, 0.5)}</>}
      {eyes === "annoyed" && (
        <>
          {r(3, 5, 2, 1)}{r(7, 5, 2, 1)}
          {r(2, 3, 1, 1)}{r(3, 3.5, 2, 0.5)}{r(9, 3, 1, 1)}{r(7, 3.5, 2, 0.5)}
        </>
      )}
      {eyes === "happy" && [2, 3, 4, 7, 8, 9].map((ex, i) => r(ex, i % 3 === 1 ? 4 : 5, 1, 1, INK, `h${ex}`))}
      {eyes === "open" && <>{r(3 + lookX, 4 + lookY, 2, 2)}{r(7 + lookX, 4 + lookY, 2, 2)}</>}
      {shades && (
        <>
          {r(2, 4, 3, 2)}{r(7, 4, 3, 2)}{r(5, 4, 2, 0.5)}
          {r(2, 4, 1, 0.5, "#ffffff")}{r(7, 4, 1, 0.5, "#ffffff")}
        </>
      )}
      {blush && <>{r(1, 6, 2, 1, "#f2a5b5")}{r(9, 6, 2, 1, "#f2a5b5")}</>}
      {r(5, 7, 2, mouth, "#2a2a2a")}
      {[...FEET[foot]].map((ch, x) => (ch === "X" ? r(x, 10, 1, 1, COLORS.X, `f${x}`) : null))}
    </svg>
  );
}

const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
const APPLE = { rows: ["...LS...", "....S...", ".RRRRRR.", "RRWRRRRR", "RRRRRRRR", "RRRRRRRR", ".RRRRRR.", "..RRRR.."], colors: { R: "#d9534f", W: "#f5b5b2", S: "#6b4423", L: "#6fbf5f" } as Record<string, string> };

function Pixels({ rows, colors, px }: { rows: string[]; colors: Record<string, string>; px: number }) {
  return (
    <svg width={rows[0].length * px} height={rows.length * px} shapeRendering="crispEdges" style={{ display: "block" }}>
      {rows.flatMap((row, y) => [...row].map((ch, x) => (colors[ch] ? <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={colors[ch]} /> : null)))}
    </svg>
  );
}
export const PixelHeart = ({ px }: { px: number }) => <Pixels rows={HEART} colors={{ X: "#f28ba8" }} px={px} />;
export const PixelApple = ({ px }: { px: number }) => <Pixels rows={APPLE.rows} colors={APPLE.colors} px={px} />;
