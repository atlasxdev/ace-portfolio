/**
 * Ag's sounds, synthesised with Web Audio rather than shipped as files: each
 * is a couple of short pitch sweeps, a few hundred bytes of code in total.
 * They only ever play from a click or key press, which is also what browsers
 * require before audio may start.
 */

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function sweep(from: number, to: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.05) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export const petSounds = {
  /** A rising two-step blip. */
  spawn() {
    sweep(420, 840, 0, 0.12, "square", 0.025);
    sweep(840, 1260, 0.1, 0.1, "square", 0.02);
  },
  /** The same blip, falling. */
  despawn() {
    sweep(840, 420, 0, 0.12, "square", 0.025);
    sweep(420, 210, 0.1, 0.14, "square", 0.02);
  },
  /** Two soft chirps. */
  pet() {
    sweep(700, 1050, 0, 0.09);
    sweep(800, 1200, 0.11, 0.11);
  },
  /** Three low nibbles. */
  feed() {
    for (const delay of [0, 0.16, 0.32]) sweep(260, 170, delay, 0.09, "triangle", 0.07);
  },
};
