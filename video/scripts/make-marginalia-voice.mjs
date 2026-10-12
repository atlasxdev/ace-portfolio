// Voice-over for the Marginalia "margin notes" film, from ElevenLabs.
// Writes one mp3 per line plus manifest.json (durations and word timings,
// which drive the film's timeline and subtitles).
//
//   node scripts/make-marginalia-voice.mjs              ElevenLabs (needs ELEVENLABS_API_KEY)
//   node scripts/make-marginalia-voice.mjs --placeholder  estimated timings, no audio
//
// ELEVENLABS_API_KEY and an optional ELEVENLABS_VOICE_ID are read from the
// environment or from video/.env (gitignored).
import fs from "node:fs";

const LINES = [
  ["pain", "That one answer you need? It's buried somewhere in a forty-page PDF."],
  ["search", "Ctrl F, “carry over”... zero results. Because it says “roll over”. Ugh."],
  ["meet", "So, meet Marginalia!"],
  ["ask", "Drop in your files, ask like a normal person, and boom. The answer, right in the margin, with the exact line it came from."],
  ["uses", "Lecture notes. Your lease. Work docs. Anything."],
  ["honest", "And if it's not in there? It tells you. No made-up answers."],
  ["cta", "Try it with your own docs. Link's below!"],
];

const OUT = new URL("../public/marginalia/vo/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

const env = { ...process.env };
const dotenv = new URL("../.env", import.meta.url);
if (fs.existsSync(dotenv)) {
  for (const l of fs.readFileSync(dotenv, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}
const KEY = env.ELEVENLABS_API_KEY || env.ELEVEN_LABS_API_KEY;
const VOICE = env.ELEVENLABS_VOICE_ID || "TX3LPaxmHKxFdv7VOQHJ"; // "Liam", energetic, social-media style
const placeholder = process.argv.includes("--placeholder");
if (!placeholder && !KEY) {
  console.error("Set ELEVENLABS_API_KEY in video/.env, or run with --placeholder.");
  process.exit(1);
}

/** Character timings → words with start/end seconds. */
function toWords(chars, starts, ends) {
  const words = [];
  let cur = null;
  chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) words.push(cur), (cur = null);
      return;
    }
    if (!cur) cur = { t: "", s: starts[i], e: ends[i] };
    cur.t += c;
    cur.e = ends[i];
  });
  if (cur) words.push(cur);
  return words;
}

function estimate(text) {
  // ~2.7 words a second, with pauses after sentences
  let t = 0;
  return text.split(" ").map((w) => {
    const d = 0.18 + w.length * 0.045;
    const word = { t: w, s: +t.toFixed(3), e: +(t + d).toFixed(3) };
    t += d + (/[.!?]["”]?$/.test(w) ? 0.35 : /[,]["”]?$/.test(w) ? 0.15 : 0.04);
    return word;
  });
}

const manifest = {};
for (const [id, text] of LINES) {
  let words;
  let file = null;
  if (placeholder) {
    words = estimate(text);
  } else {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.32, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
      }),
    });
    if (!res.ok) {
      console.error(`${id}: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const data = await res.json();
    const a = data.alignment;
    words = toWords(a.characters, a.character_start_times_seconds, a.character_end_times_seconds);
    file = `marginalia/vo/${id}.mp3`;
    fs.writeFileSync(new URL(`${id}.mp3`, OUT), Buffer.from(data.audio_base64, "base64"));
  }
  const duration = +(words.at(-1).e + 0.15).toFixed(3);
  manifest[id] = { text, file, duration, words };
  console.log(`${id}: ${duration}s${file ? "" : " (estimated)"}`);
}
fs.writeFileSync(new URL("manifest.json", OUT), JSON.stringify(manifest, null, 2) + "\n");
