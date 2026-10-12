// The Marginalia film's own score and pencil sounds, synthesised so there's
// nothing to license: a slow electric-piano progression with a soft pluck
// and a little room, and a pencil scribble. Run: node scripts/make-marginalia-audio.mjs
import fs from "node:fs";

const SR = 44100;

function write(path, data) {
  const n = data.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i])) * 32767), 44 + i * 2);
  fs.mkdirSync(new URL(".", path), { recursive: true });
  fs.writeFileSync(path, buf);
}

let seed = 11;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/* ---------- score ---------- */

const BPM = 80;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
// Fmaj7 · Am7 · Dm9 · Bbmaj7(#11), voiced close in the middle of the keyboard
const CHORDS = [
  [53, 57, 60, 64, 69],
  [57, 60, 64, 67, 71],
  [50, 57, 60, 64, 65],
  [46, 57, 62, 65, 69],
];
const BASS = [41, 45, 38, 46];
const LENGTH = BAR * 12 + 3; // ~39s, with a tail
const out = new Float32Array(Math.ceil(LENGTH * SR));

/** Electric piano: sine with a soft bell partial, slow decay, gentle tremolo. */
function ep(start, midi, dur, vel) {
  const f = hz(midi);
  const i0 = Math.floor(start * SR);
  const n = Math.floor((dur + 1.6) * SR);
  for (let i = 0; i < n && i0 + i < out.length; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.012);
    const rel = t > dur ? Math.exp(-(t - dur) * 4) : 1;
    const env = att * rel * Math.exp(-t * 0.9);
    const bell = Math.sin(2 * Math.PI * f * 3.98 * t) * Math.exp(-t * 6) * 0.22;
    const body = Math.sin(2 * Math.PI * f * t + 0.6 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3));
    const trem = 1 - 0.12 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 4.2 * t));
    out[i0 + i] += (body + bell) * env * trem * vel;
  }
}
/** Soft pluck for the top line. */
function pluck(start, midi, vel) {
  const f = hz(midi);
  const i0 = Math.floor(start * SR);
  const n = Math.floor(1.4 * SR);
  for (let i = 0; i < n && i0 + i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.2);
    out[i0 + i] += (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 8)) * env * vel;
  }
}
function bass(start, midi, dur, vel) {
  const f = hz(midi);
  const i0 = Math.floor(start * SR);
  const n = Math.floor((dur + 0.3) * SR);
  for (let i = 0; i < n && i0 + i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.03) * (t > dur ? Math.exp(-(t - dur) * 10) : 1) * Math.exp(-t * 0.4);
    out[i0 + i] += Math.sin(2 * Math.PI * f * t) * env * vel;
  }
}

// Arpeggio pattern over each bar (eighth notes, a few rests so it breathes)
const ARP = [0, 2, 4, 3, null, 2, 4, null];
for (let bar = 0; bar < 12; bar++) {
  const c = CHORDS[bar % 4];
  const t0 = bar * BAR;
  const intro = bar < 2; // the first two bars are chords alone
  c.forEach((m, k) => ep(t0 + k * 0.012, m, BAR - 0.1, 0.055));
  if (!intro) bass(t0, BASS[bar % 4], BAR - 0.2, 0.16);
  if (!intro) {
    ARP.forEach((k, j) => {
      if (k === null) return;
      const swing = j % 2 ? 0.035 : 0;
      pluck(t0 + j * (BEAT / 2) + swing, c[k] + 12, 0.05 + (j === 0 ? 0.015 : 0));
    });
  }
}

// A little room: two feedback delays, low-passed
const wet = new Float32Array(out.length);
for (const [ms, fb] of [[113, 0.42], [171, 0.38]]) {
  const d = Math.floor((ms / 1000) * SR);
  let lp = 0;
  for (let i = d; i < out.length; i++) {
    lp += 0.25 * (out[i - d] + wet[i - d] * fb - lp);
    wet[i] += lp * 0.5;
  }
}
// Fade in, fade out, normalise to a quiet bed
let peak = 0;
for (let i = 0; i < out.length; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 1.5) * Math.min(1, (LENGTH - t) / 3);
  out[i] = (out[i] + wet[i] * 0.6) * fade;
  peak = Math.max(peak, Math.abs(out[i]));
}
for (let i = 0; i < out.length; i++) out[i] *= 0.7 / peak;
write(new URL("../public/music/margin-notes.wav", import.meta.url), out);

/* ---------- pencil on paper ---------- */

{
  const dur = 0.75;
  const p = new Float32Array(Math.floor(dur * SR));
  let a = 0, b = 0;
  for (let i = 0; i < p.length; i++) {
    const t = i / SR;
    // strokes: a fast back-and-forth rhythm that varies a little
    const stroke = Math.abs(Math.sin(Math.PI * (9 * t + 0.6 * Math.sin(2 * Math.PI * 1.7 * t))));
    const n = noise();
    a += 0.55 * (n - a); // low-pass
    b += 0.08 * (a - b); // remove lows → a gritty band
    const grit = (a - b) * (0.7 + 0.3 * Math.sign(noise()));
    const env = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.08);
    p[i] = grit * stroke ** 1.5 * env * 0.9;
  }
  write(new URL("../public/sfx/pencil.wav", import.meta.url), p);
}

console.log("wrote music/margin-notes.wav, sfx/pencil.wav");
