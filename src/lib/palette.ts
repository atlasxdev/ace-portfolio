/**
 * The four hues the ambient field behind the page is built from — see
 * `#ambient` in globals.css. TypeScript blue, Supabase green, Anthropic clay,
 * and the pink.
 *
 * Anything that needs colour on this site draws from here rather than picking
 * its own, which is what keeps an accent reading as part of the page instead
 * of imported with the component. Used by the Approach step badges and the
 * blog post covers.
 */
export const HUES = ["#3178c6", "#3ecf8e", "#d97757", "#ea4b71"] as const;

/**
 * Hue by position in a list.
 *
 * Position rather than a hash of the key: hashing was stable per post but let
 * neighbours collide, and two adjacent cards in the same green reads as a bug
 * rather than a choice. Cycling by index guarantees consecutive items differ.
 *
 * The cost is that adding a post shifts the colours below it. That's a fair
 * trade — these are decorative, and nobody remembers which colour a post was.
 * Callers must derive the index from the same ordering so a card and its post
 * page agree.
 */
export function hueAt(index: number): (typeof HUES)[number] {
  return HUES[((index % HUES.length) + HUES.length) % HUES.length];
}
