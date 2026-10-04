/**
 * Reads a JSON string field out of a JSON document that may still be
 * arriving: returns as much of the value as has been received so far.
 *
 * The chat streams structured output, and the reply text is the first field,
 * so this lets it reach the visitor while the model is still writing it. An
 * escape sequence cut off mid-way is held back until the rest arrives.
 */
export function readPartialString(raw: string, key: string): string {
  const start = new RegExp(`"${key}"\\s*:\\s*"`).exec(raw);
  if (!start) return "";

  let out = "";
  for (let i = start.index + start[0].length; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') return out;
    if (c !== "\\") {
      out += c;
      continue;
    }
    const next = raw[i + 1];
    if (next === undefined) return out;
    if (next === "u") {
      const hex = raw.slice(i + 2, i + 6);
      if (hex.length < 4) return out;
      out += String.fromCharCode(parseInt(hex, 16));
      i += 5;
      continue;
    }
    out += ESCAPES[next] ?? next;
    i++;
  }
  return out;
}

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" };
