// Synthesises the film's sound effects as WAVs, so there are no third-party
// samples to license. Run: node scripts/make-sfx.mjs
import fs from "node:fs";

const SR = 44100;
const OUT = new URL("../public/sfx/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

function wav(name, seconds, fn) {
  const n = Math.floor(SR * seconds);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  const state = {};
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, fn(i / SR, i, state)));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(new URL(`${name}.wav`, OUT), buf);
}

// Seeded noise so renders are reproducible.
let seed = 7;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const lp = (s, key, x, a) => (s[key] = (s[key] ?? 0) + a * (x - (s[key] ?? 0)));

// Air whoosh: band of noise whose brightness sweeps up then down.
wav("whoosh", 0.55, (t, i, s) => {
  const p = t / 0.55;
  const env = Math.sin(Math.PI * p) ** 2;
  const a = 0.02 + 0.25 * Math.sin(Math.PI * Math.min(1, p * 1.2));
  const low = lp(s, "a", noise(), a);
  const band = low - lp(s, "b", low, 0.02);
  return band * env * 2.2;
});

// Paper landing on a desk: short soft thump plus a papery brush.
wav("paper", 0.22, (t, i, s) => {
  const thump = Math.sin(2 * Math.PI * (90 - 120 * t) * t) * Math.exp(-t * 38);
  const brush = lp(s, "a", noise(), 0.35) * Math.exp(-t * 26);
  return thump * 0.7 + brush * 0.5;
});

// Expired flag: two quick descending sine blips.
wav("alert", 0.32, (t) => {
  const blip = (f, t0) => (t >= t0 ? Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-(t - t0) * 30) : 0);
  return (blip(1180, 0) + blip(880, 0.11)) * 0.45;
});

// Step check: a short wooden tick; pitch is set per step.
for (const [name, f] of [["tick1", 1320], ["tick2", 1480], ["tick3", 1760]]) {
  wav(name, 0.12, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t * 45) * 0.45);
}

// Pop: a bubble that rises in pitch.
wav("pop", 0.16, (t) => Math.sin(2 * Math.PI * (380 + 2600 * t) * t) * Math.exp(-t * 28) * 0.55);

// Outro chime: a soft major triad with bell partials.
wav("chime", 1.8, (t) => {
  let v = 0;
  for (const [f, d] of [[784, 0], [988, 0.05], [1175, 0.1]]) {
    if (t < d) continue;
    const u = t - d;
    v += (Math.sin(2 * Math.PI * f * u) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * u) * Math.exp(-u * 6)) * Math.exp(-u * 2.4);
  }
  return v * 0.22 * Math.min(1, t * 200);
});

console.log("sfx written to", OUT.pathname);
