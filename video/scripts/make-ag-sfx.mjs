// Ag's sounds as WAVs, from the same recipes as src/lib/pet-sounds.ts: each
// is a few pitch sweeps (frequency glides exponentially from -> to, with a
// 15ms exponential attack and decay). Run: node scripts/make-ag-sfx.mjs
import fs from "node:fs";

const SR = 48000;
const OUT = new URL("../public/ag/sfx/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

// [from Hz, to Hz, start s, duration s, wave, volume]
const SOUNDS = {
  spawn: [[420, 840, 0, 0.12, "square", 0.025], [840, 1260, 0.1, 0.1, "square", 0.02]],
  pet: [[700, 1050, 0, 0.09, "sine", 0.05], [800, 1200, 0.11, 0.11, "sine", 0.05]],
  huff: [[220, 160, 0, 0.18, "sawtooth", 0.025], [200, 150, 0.2, 0.2, "sawtooth", 0.025]],
  hic: [[500, 900, 0, 0.07, "square", 0.02]],
  think: [[330, 370, 0, 0.14, "triangle", 0.05], [370, 310, 0.14, 0.18, "triangle", 0.045]],
  answer: [[880, 880, 0, 0.08, "square", 0.018], [1320, 1320, 0.08, 0.16, "square", 0.018]],
  feed: [0, 0.16, 0.32].map((d) => [260, 170, d, 0.09, "triangle", 0.07]),
  startle: [[600, 1400, 0, 0.07, "square", 0.02], [1300, 700, 0.07, 0.1, "square", 0.015]],
  yawn: [[300, 420, 0, 0.25, "triangle", 0.05], [420, 220, 0.25, 0.45, "triangle", 0.04]],
  nod: [[520, 620, 0, 0.06, "triangle", 0.04]],
  wave: [[660, 990, 0, 0.08, "square", 0.018], [990, 1320, 0.09, 0.09, "square", 0.015]],
  land: [[180, 90, 0, 0.08, "triangle", 0.06]],
  hop: [[300, 700, 0, 0.12, "triangle", 0.035]],
  steps: [0, 0.14, 0.28, 0.42].map((d) => [1500, 1100, d, 0.025, "square", 0.008]),
  chirp: [[900, 1100, 0, 0.06, "sine", 0.04]],
  tada: [523, 659, 784, 1047].map((f, i) => [f, f, i * 0.07, i === 3 ? 0.22 : 0.08, "square", 0.016]),
};

const wave = {
  sine: (p) => Math.sin(2 * Math.PI * p),
  square: (p) => (p % 1 < 0.5 ? 1 : -1),
  triangle: (p) => 1 - 4 * Math.abs((p % 1) - 0.5),
  sawtooth: (p) => 2 * (p % 1) - 1,
};
// The site plays these very quietly under page audio; a video needs them up front.
const GAIN = 7;

for (const [name, sweeps] of Object.entries(SOUNDS)) {
  const len = Math.max(...sweeps.map(([, , s, d]) => s + d)) + 0.05;
  const buf = new Float32Array(Math.ceil(len * SR));
  for (const [from, to, start, dur, type, vol] of sweeps) {
    let phase = 0;
    for (let i = 0; i < Math.floor((dur + 0.02) * SR); i++) {
      const t = i / SR;
      phase += (from * Math.pow(to / from, Math.min(1, t / dur))) / SR;
      const g = t < 0.015 ? 0.0001 * Math.pow(vol / 0.0001, t / 0.015) : t < dur ? vol * Math.pow(0.0001 / vol, (t - 0.015) / (dur - 0.015)) : 0;
      const k = Math.floor((start + t) * SR);
      if (k < buf.length) buf[k] += g * wave[type](phase) * GAIN;
    }
  }
  const pcm = Buffer.alloc(44 + buf.length * 2);
  pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + buf.length * 2, 4); pcm.write("WAVE", 8); pcm.write("fmt ", 12);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28);
  pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(new URL(`${name}.wav`, OUT), pcm);
}
console.log("wrote", Object.keys(SOUNDS).length, "sounds to", OUT.pathname);
