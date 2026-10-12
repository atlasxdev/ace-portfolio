// An upbeat score for the Marginalia promo, synthesised so there's nothing to
// license: 116 BPM, a filtered intro with a riser, then a house drop on bar 7
// (DROP seconds in) with four-on-the-floor kick, claps, offbeat bass, pumping
// chord stabs and a pluck arpeggio. Run: node scripts/make-marginalia-beat.mjs
import fs from "node:fs";

const SR = 44100;
const BPM = 116;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const DROP_BAR = 6;
export const DROP = DROP_BAR * BAR;
const BARS = 26;
const LENGTH = BARS * BAR + 2;
const L = new Float32Array(Math.ceil(LENGTH * SR));
const R = new Float32Array(L.length);

let seed = 3;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

function add(start, dur, fn, pan = 0, gain = 1) {
  const i0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  const st = {};
  const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < n && i0 + i < L.length; i++) {
    const v = fn(i / SR, st);
    L[i0 + i] += v * gl;
    R[i0 + i] += v * gr;
  }
}

/* ---------- instruments ---------- */

const kick = (t0, g = 1) => add(t0, 0.4, (t) => {
  const f = 45 + 110 * Math.exp(-t * 30);
  return (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 7) + (t < 0.004 ? noise() * 0.4 : 0)) * 0.95;
}, 0, g);

const clap = (t0, g = 1) => add(t0, 0.3, (t, s) => {
  const burst = [0, 0.011, 0.023].reduce((a, d) => a + (t >= d ? Math.exp(-(t - d) * (d === 0.023 ? 18 : 120)) : 0), 0);
  s.a = (s.a ?? 0) + 0.5 * (noise() - (s.a ?? 0));
  s.b = (s.b ?? 0) + 0.06 * (s.a - (s.b ?? 0));
  return (s.a - s.b) * burst * 0.75;
}, 0, g);

const hat = (t0, open = false, g = 1, pan = 0.25) => add(t0, open ? 0.25 : 0.06, (t, s) => {
  const n = noise();
  s.p = (s.p ?? 0) + 0.85 * (n - (s.p ?? 0));
  return (n - s.p) * Math.exp(-t * (open ? 14 : 70)) * 0.32;
}, pan, g);

/** Band-limited saw: a few harmonics, so the stabs stay clean. */
const saw = (f, t) => {
  let v = 0;
  for (let k = 1; k <= 9; k++) v += Math.sin(2 * Math.PI * f * k * t) / k;
  return v * 0.55;
};

/** Chord stab: three detuned saws per note, a quick filter-ish decay. */
const stab = (t0, notes, dur, g = 1, bright = 1) => {
  notes.forEach((m, j) => add(t0, dur + 0.15, (t) => {
    const f = hz(m);
    const env = Math.min(1, t / 0.005) * (t < dur ? Math.exp(-t * 3) : Math.exp(-dur * 3) * Math.exp(-(t - dur) * 30));
    const tone = saw(f * 0.997, t) + saw(f * 1.003, t) + Math.sin(2 * Math.PI * f * t);
    // fewer harmonics as it decays: mix toward the sine
    const k = Math.exp(-t * (8 / bright));
    return (tone * (0.25 + 0.75 * k) + Math.sin(2 * Math.PI * f * t) * (1 - k)) * env * 0.075;
  }, j % 2 ? 0.3 : -0.3, g));
};

const bass = (t0, m, dur, g = 1) => add(t0, dur + 0.05, (t) => {
  const f = hz(m);
  const env = Math.min(1, t / 0.006) * (t < dur ? 1 : Math.exp(-(t - dur) * 60));
  const v = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) + 0.15 * saw(f, t);
  return Math.tanh(v * 1.4) * env * 0.42;
}, 0, g);

const pluck = (t0, m, g = 1, pan = 0) => add(t0, 0.5, (t) => {
  const f = hz(m);
  return (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 12)) * Math.min(1, t / 0.003) * Math.exp(-t * 9) * 0.12;
}, pan, g);

/* ---------- arrangement ---------- */

// F  G  Am  C  (IV V vi I in C), voiced around middle C
const CHORDS = [
  [57, 60, 65, 69],
  [59, 62, 67, 71],
  [57, 60, 64, 69],
  [55, 60, 64, 67],
];
const ROOTS = [41, 43, 45, 36];
const ARP = [0, 2, 3, 2, 1, 3, 2, 3];

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const c = CHORDS[bar % 4];
  const drop = bar >= DROP_BAR;
  const outro = bar >= BARS - 2;
  if (!drop) {
    // Intro: muffled stabs on the offbeats, ticking hats, the kick creeping in
    for (let b = 0; b < 4; b++) {
      stab(t0 + b * BEAT + BEAT / 2, c, 0.12, 0.7, 0.4 + bar * 0.12);
      hat(t0 + b * BEAT + BEAT / 2, false, 0.5);
      if (bar >= 2 && bar < DROP_BAR - 1) kick(t0 + b * BEAT, 0.55);
    }
    if (bar === DROP_BAR - 1) {
      // Build: a clap roll that speeds up, and a rising wash
      for (let k = 0; k < 16; k++) clap(t0 + k * (BEAT / 4), 0.25 + k * 0.04);
      add(t0, BAR, (t, s) => {
        const p = t / BAR;
        s.a = (s.a ?? 0) + (0.02 + 0.5 * p * p) * (noise() - (s.a ?? 0));
        return s.a * p * p * 0.5;
      });
    }
    continue;
  }
  // Drop
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (!outro || b < 2) kick(tb);
    if (b % 2 === 1) clap(tb, 0.9);
    hat(tb + BEAT / 2, true, 0.8);
    hat(tb + BEAT / 4, false, 0.4, -0.3);
    hat(tb + (3 * BEAT) / 4, false, 0.4, -0.3);
    bass(tb + BEAT / 2, ROOTS[bar % 4] + (b === 3 ? 12 : 0), BEAT / 2 - 0.04);
    stab(tb + BEAT / 2, c, 0.16, 1, 1.4);
  }
  if (bar >= DROP_BAR + 2 && !outro) {
    for (let k = 0; k < 16; k++) {
      if (k % 4 === 3) continue;
      pluck(t0 + k * (BEAT / 4), c[ARP[k % 8]] + 12, 0.9, k % 2 ? 0.35 : -0.35);
    }
  }
}
// Crash on the drop
add(DROP, 2.5, (t, s) => {
  const n = noise();
  s.p = (s.p ?? 0) + 0.6 * (n - (s.p ?? 0));
  return (n - s.p) * Math.exp(-t * 1.8) * 0.3;
});

/* ---------- sidechain pump, a little room, master ---------- */

for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  if (t >= DROP) {
    const sinceKick = (t - DROP) % BEAT;
    const pump = 1 - 0.35 * Math.exp(-sinceKick * 9);
    // the kick itself sits on the beat; pumping the whole bus reads as sidechain
    L[i] *= sinceKick < 0.08 ? 1 : pump;
    R[i] *= sinceKick < 0.08 ? 1 : pump;
  }
}
for (const [buf, ms] of [[L, 97], [R, 131]]) {
  const d = Math.floor((ms / 1000) * SR);
  const wet = new Float32Array(buf.length);
  let lp = 0;
  for (let i = d; i < buf.length; i++) {
    lp += 0.3 * (buf[i - d] + wet[i - d] * 0.35 - lp);
    wet[i] = lp;
  }
  for (let i = 0; i < buf.length; i++) buf[i] += wet[i] * 0.18;
}
let peak = 0;
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  const fade = Math.min(1, (LENGTH - t) / 2.5);
  L[i] = Math.tanh(L[i] * 1.2) * fade;
  R[i] = Math.tanh(R[i] * 1.2) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}

const n = L.length;
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round((L[i] / peak) * 0.89 * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round((R[i] / peak) * 0.89 * 32767), 46 + i * 4);
}
fs.writeFileSync(new URL("../public/music/margin-beat.wav", import.meta.url), buf);
console.log(`wrote music/margin-beat.wav, ${LENGTH.toFixed(1)}s, drop at ${DROP.toFixed(3)}s`);
