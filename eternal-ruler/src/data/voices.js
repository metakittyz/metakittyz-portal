// THE VOICE LIBRARY.
//
// Each preset has two bodies:
//
//   openai — a real, soft, human-sounding voice from OpenAI's TTS, with
//            delivery `instructions` written for this app. This is the good
//            one. It needs a key and a network call the first time a line is
//            spoken; after that the audio is cached forever.
//
//   device — the browser's own speech synthesis: free, offline, instant, and
//            noticeably more robotic. A tone (pace + pitch) plus an ordered
//            list of voice names to reach for, since browsers only expose what
//            the operating system happens to have.
//
// The device body is always the fallback, so the guide never goes silent.
//
// ---------------------------------------------------------------------------
// Two rules learned the hard way, when these voices came out sounding
// processed rather than calm:
//
//   1. `speed` is a time-stretch applied AFTER the audio is generated. Pushing
//      it down to 0.8 to sound calm just smears the words and adds that
//      underwater, sedated quality. Calm has to be asked for in the
//      instructions, where it changes how the line is actually performed.
//      Everything here now sits near 1.0, and the slowness comes from pauses.
//
//   2. The model takes negative direction well. Naming what to avoid —
//      audiobook narration, meditation-app hush, announcer polish — moves the
//      delivery further toward ordinary human speech than any amount of
//      adjectives piled on the positive side.
// ---------------------------------------------------------------------------

import { hashString } from "../lib/util.js";

export const VOICE_PRESETS = [
  {
    id: "solace",
    name: "Solace",
    tone: "Soothing",
    glyph: "◐",
    blurb: "Low and unhurried. For the nights.",
    rate: 0.9,
    pitch: 0.96,
    prefer: ["samantha", "serena", "sonia", "joanna", "aria", "allison"],
    openai: {
      // sage, not shimmer: shimmer is the airiest voice in the set and that
      // air is exactly what reads as synthetic on the default preset.
      voice: "sage",
      speed: 0.95,
      instructions: [
        "Affect: a close friend talking to you late at night, keeping their voice down so as not to wake anyone.",
        "Voice: low and warm, with some texture to it. A real person in a real room, not a recording.",
        "Delivery: plain and conversational. Use contractions. Don't over-enunciate — let words soften and run together the way they do in ordinary speech. A small audible breath now and then is good.",
        "Pacing: relaxed, but not slow motion. A real pause at each full stop, a shorter one at commas.",
        "Avoid: audiobook narration, meditation-app hush, announcer polish, and any lift or brightness at the end of a sentence.",
      ].join("\n"),
    },
    sample: "You are not behind, and you are not broken. Let the exhale get longer than the inhale.",
  },
  {
    id: "stillness",
    name: "Stillness",
    tone: "Peaceful",
    glyph: "❋",
    blurb: "Very slow, plenty of air. For sitting.",
    rate: 0.84,
    pitch: 1.0,
    prefer: ["tessa", "fiona", "karen", "libby", "emma", "clara"],
    openai: {
      voice: "shimmer",
      speed: 0.92,
      instructions: [
        "Affect: someone sitting in the same room as you with their eyes closed, speaking only when there's something worth saying.",
        "Voice: quiet and unforced. Low volume, but still a normal speaking voice — not a stage whisper, not breathy.",
        "Delivery: unhurried and plain. Let a sentence end and then genuinely stop. The silence between phrases is part of it.",
        "Pacing: slow, but the slowness comes from the pauses, not from stretching the words out.",
        "Avoid: ASMR breathiness, sing-song cadence, and the drifting-upward tone that meditation recordings use.",
      ].join("\n"),
    },
    sample: "Nothing to solve. Nothing to reach for. Just this breath, and then the next one.",
  },
  {
    id: "dawn",
    name: "Dawn",
    tone: "Calm",
    glyph: "◉",
    blurb: "Even and clear. For the morning.",
    rate: 0.96,
    pitch: 1.04,
    prefer: ["victoria", "zira", "jenny", "ava", "michelle", "salli"],
    openai: {
      voice: "coral",
      speed: 1.0,
      instructions: [
        "Affect: the first easy conversation of the morning, with someone who already knows you. Nothing to sell, nothing to prove.",
        "Voice: clear, even, everyday.",
        "Delivery: talking, not reading. Contractions throughout. Kind rather than motivational — no lift at the end of a line, no encouragement voice.",
        "Pacing: ordinary speaking pace, with a beat between sentences.",
        "Avoid: hype, coaching energy, podcast-host brightness, and over-articulation.",
      ].join("\n"),
    },
    sample: "Feet on the floor. You don't have to feel like it. You just have to begin.",
  },
  {
    id: "aurora",
    name: "Aurora",
    tone: "Warm",
    glyph: "✦",
    blurb: "Bright and close. For the hard days.",
    rate: 0.98,
    pitch: 1.08,
    prefer: ["ava", "nicole", "amy", "ivy", "kendra", "olivia"],
    openai: {
      voice: "nova",
      speed: 1.0,
      instructions: [
        "Affect: someone completely on your side, sitting close, a little worried about you and trying not to make a thing of it.",
        "Voice: warm and near, human, a touch uneven.",
        "Delivery: talking, not reading. Keep the feeling understated — the care comes through steadiness, not emphasis. A small breath before a hard line is right.",
        "Pacing: natural, with a beat of hesitation where a real person would hesitate.",
        "Avoid: cheerfulness, uplift, therapeutic sing-song, and anything that sounds performed for an audience.",
      ].join("\n"),
    },
    sample: "I'm on your side. You've carried harder things than this and you're still standing.",
  },
  {
    id: "deepwater",
    name: "Deep Water",
    tone: "Grounded",
    glyph: "◈",
    blurb: "Low, slow, weighted. For coming back down.",
    rate: 0.88,
    pitch: 0.92,
    prefer: ["moira", "catherine", "hazel", "sonia", "natasha", "heera"],
    openai: {
      voice: "ballad",
      speed: 0.96,
      instructions: [
        "Affect: someone who has seen this exact thing before and is not remotely alarmed by it.",
        "Voice: low, level and weighted. From the chest, not the head.",
        "Delivery: matter-of-fact and unhurried. Statements land flat and finish. Don't put reassurance in the tone — the steadiness is the reassurance.",
        "Pacing: deliberate. Full stops that actually stop.",
        "Avoid: softness applied on purpose, comfort-voice, rising intonation, and drama.",
      ].join("\n"),
    },
    sample: "Press your feet down. Feel actual weight going into actual ground. You are here.",
  },
  {
    id: "own",
    name: "Your Own Voice",
    tone: "Yours",
    glyph: "◎",
    own: true,
    blurb: "Record the lines yourself. Anything unrecorded falls back to Solace.",
    rate: 0.9,
    pitch: 0.96,
    prefer: ["samantha", "serena", "sonia"],
    openai: {
      // Anything you haven't recorded yet falls back to Solace, so match it.
      voice: "sage",
      speed: 0.95,
      instructions: [
        "Affect: a close friend talking to you late at night, keeping their voice down.",
        "Voice: low and warm, a real person in a real room.",
        "Delivery: plain and conversational, with contractions. Comfort, not performance.",
        "Avoid: audiobook narration, meditation-app hush, announcer polish.",
      ].join("\n"),
    },
    sample: "You become both the one who reassures and the one reassured.",
  },
];

export const presetById = Object.fromEntries(VOICE_PRESETS.map((p) => [p.id, p]));
export const DEFAULT_PRESET = "solace";

/**
 * A short fingerprint of how a preset is performed — its OpenAI voice, speed
 * and delivery instructions.
 *
 * This exists because generated audio is cached forever, keyed by preset and
 * text. Retune a preset without changing the key and every line already in the
 * cache keeps playing the old delivery: the tuning appears to do nothing, and
 * the only cure is knowing to clear the cache by hand. Folding the fingerprint
 * into the key makes retuned lines regenerate on their own.
 */
export function deliveryTag(presetId) {
  const p = presetById[presetId];
  if (!p?.openai) return "none";
  const { voice, speed, instructions } = p.openai;
  return hashString(`${voice}|${speed}|${instructions}`).toString(36);
}

// ---------------------------------------------------------------------------
// Everything the guide says, addressable by id, so any line can be replaced
// with a recording of your own voice.
// ---------------------------------------------------------------------------

export const APP_LINES = [
  {
    id: "app:step-complete",
    text: "Step complete. The path moved.",
  },
  {
    id: "app:milestone",
    text: "Milestone. One of six markers on this road.",
  },
  {
    id: "app:practice-complete",
    text: "Done. Another turn of your own rhythm.",
  },
  {
    id: "app:greeting",
    text: "I'm here. Settle your body, and let the exhale get longer than the inhale.",
  },
];

export const protocolLineId = (protocolId, index) => `protocol:${protocolId}:${index}`;

/** Every recordable line, grouped by area. */
export function guideAreas(protocols, overtureLines = []) {
  return [
    { id: "app", name: "App moments", lines: APP_LINES },
    ...(overtureLines.length ? [{ id: "overture", name: "The opening", lines: overtureLines }] : []),
    ...protocols.map((p) => ({
      id: p.id,
      name: p.name,
      minutes: p.minutes,
      lines: p.steps.map((s, i) => ({
        id: protocolLineId(p.id, i),
        text: `${s.label}. ${s.detail}`,
        label: s.label,
      })),
    })),
  ];
}
