/**
 * Ag's sounds, synthesised with Web Audio rather than shipped as files: each
 * is a couple of short pitch sweeps, a few hundred bytes of code in total.
 * Browsers won't start audio before the visitor has clicked or pressed a key,
 * so until then Ag stays silent rather than queueing up a burst for later.
 */

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function sweep(
  from: number,
  to: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.05,
) {
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
  /** A grumpy low buzz. */
  huff() {
    sweep(220, 160, 0, 0.18, "sawtooth", 0.025);
    sweep(200, 150, 0.2, 0.2, "sawtooth", 0.025);
  },
  /** A small hiccup. */
  hic() {
    sweep(500, 900, 0, 0.07, "square", 0.02);
  },
  /** A soft, wavering "hmm" while it thinks. */
  think() {
    sweep(330, 370, 0, 0.14, "triangle", 0.05);
    sweep(370, 310, 0.14, 0.18, "triangle", 0.045);
  },
  /** A bright two-note ding: the answer's in. */
  answer() {
    sweep(880, 880, 0, 0.08, "square", 0.018);
    sweep(1320, 1320, 0.08, 0.16, "square", 0.018);
  },
  /** A three-note rise, waving at the "Message Ace" button. */
  contact() {
    for (const [i, f] of [660, 880, 1100].entries()) sweep(f, f * 1.05, i * 0.08, 0.1, "square", 0.018);
  },
  /** A falling "uh-oh". */
  oops() {
    sweep(520, 500, 0, 0.1, "triangle", 0.06);
    sweep(400, 300, 0.13, 0.2, "triangle", 0.06);
  },
  /** Three low nibbles. */
  feed() {
    for (const delay of [0, 0.16, 0.32]) sweep(260, 170, delay, 0.09, "triangle", 0.07);
  },
  /** A quick yelp, up and back down. */
  startle() {
    sweep(600, 1400, 0, 0.07, "square", 0.02);
    sweep(1300, 700, 0.07, 0.1, "square", 0.015);
  },
  /** A slow, sagging yawn. */
  yawn() {
    sweep(300, 420, 0, 0.25, "triangle", 0.05);
    sweep(420, 220, 0.25, 0.45, "triangle", 0.04);
  },
  /** A curt "nuh-uh". */
  refuse() {
    sweep(300, 280, 0, 0.08, "square", 0.02);
    sweep(260, 220, 0.11, 0.1, "square", 0.02);
  },
  /** One small blip: "mm-hm". */
  nod() {
    sweep(520, 620, 0, 0.06, "triangle", 0.04);
  },
  /** A cheery "hi!". */
  wave() {
    sweep(660, 990, 0, 0.08, "square", 0.018);
    sweep(990, 1320, 0.09, 0.09, "square", 0.015);
  },
  /** A soft thud underfoot. */
  land() {
    sweep(180, 90, 0, 0.08, "triangle", 0.06);
  },
  /** A springy boing as it takes off. */
  hop() {
    sweep(300, 700, 0, 0.12, "triangle", 0.035);
  },
  /** A few light footsteps. */
  steps() {
    for (const delay of [0, 0.14, 0.28, 0.42]) sweep(1500, 1100, delay, 0.025, "square", 0.008);
  },
  /** Drifting off: a low "zzz". */
  snore() {
    sweep(160, 140, 0, 0.5, "sawtooth", 0.01);
    sweep(150, 120, 0.6, 0.6, "sawtooth", 0.008);
  },
  /** Waking with a start, then a chirp. */
  wake() {
    sweep(400, 800, 0, 0.08, "triangle", 0.05);
    sweep(800, 1000, 0.1, 0.08, "triangle", 0.04);
  },
  /** A short chirp when it has something to say. */
  chirp() {
    sweep(900, 1100, 0, 0.06, "sine", 0.04);
  },
  /** A falling click as the sound goes off. */
  mute() {
    sweep(700, 300, 0, 0.1, "square", 0.015);
  },
  /** A little fanfare: there it is. */
  tada() {
    for (const [i, f] of [523, 659, 784, 1047].entries()) sweep(f, f, i * 0.07, i === 3 ? 0.22 : 0.08, "square", 0.016);
  },
};

export type PetSound = keyof typeof petSounds;
