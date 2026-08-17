// Guards the one rule the Voice Library has: the guide is a woman.
//
// This exists because `ballad` — a male voice — sat on the Deep Water preset
// for weeks without anyone noticing. It was picked to avoid reusing a voice,
// and nothing in the code or the UI said it was wrong. Now something does.
//
//   node scripts/check-voices.mjs        (also runs as `npm run check`)

import { FEMALE_VOICES, VOICE_PRESETS, deliveryTag } from "../src/data/voices.js";
import { ALLOWED_VOICES } from "../server/tts-core.js";

const problems = [];

for (const p of VOICE_PRESETS) {
  const v = p.openai?.voice;
  if (!v) {
    problems.push(`${p.name}: no OpenAI voice set`);
    continue;
  }
  if (!FEMALE_VOICES.includes(v)) {
    problems.push(`${p.name}: "${v}" is not one of the female voices (${FEMALE_VOICES.join(", ")})`);
  }
  // The proxy validates the voice name server-side and rejects anything it
  // doesn't know, so a typo here would fail as a 400 at play time rather than
  // at build time. Catch it now.
  if (!ALLOWED_VOICES.includes(v)) {
    problems.push(`${p.name}: "${v}" is not in the proxy's allowlist — every line would 400`);
  }
}

// Two presets sharing a voice is allowed, but they must not also share a
// delivery — that would make them the same preset under two names, and the
// cache would collapse them onto one set of audio.
const seen = new Map();
for (const p of VOICE_PRESETS) {
  const tag = deliveryTag(p.id);
  if (seen.has(tag)) problems.push(`${p.name} and ${seen.get(tag)} have identical delivery — they would share cached audio`);
  seen.set(tag, p.name);
}

const byVoice = {};
for (const p of VOICE_PRESETS) (byVoice[p.openai.voice] ||= []).push(p.name);

console.log("preset            voice      speed   delivery");
for (const p of VOICE_PRESETS) {
  console.log(
    `  ${p.name.padEnd(16)}${p.openai.voice.padEnd(11)}${String(p.openai.speed).padEnd(8)}${deliveryTag(p.id)}`
  );
}
console.log("\nvoices in use:");
for (const [v, names] of Object.entries(byVoice)) {
  console.log(`  ${v.padEnd(10)} ${names.join(", ")}${names.length > 1 ? "   (shared, distinct delivery)" : ""}`);
}

if (problems.length) {
  console.error("\nFAILED:");
  for (const p of problems) console.error("  · " + p);
  process.exit(1);
}
console.log(`\nOK — all ${VOICE_PRESETS.length} presets use a female OpenAI voice with its own delivery.`);
