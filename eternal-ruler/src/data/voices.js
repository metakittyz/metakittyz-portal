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

export const VOICE_PRESETS = [
  {
    id: "solace",
    name: "Solace",
    tone: "Soothing",
    glyph: "◐",
    blurb: "Low and unhurried. For the nights.",
    rate: 0.82,
    pitch: 0.94,
    prefer: ["samantha", "serena", "sonia", "joanna", "aria", "allison"],
    openai: {
      voice: "shimmer",
      speed: 0.9,
      instructions:
        "Speak softly and slowly, like someone sitting beside a close friend late at night. Warm, low, unhurried, breathy at the edges. Leave a real pause at every full stop. Never bright, never announcer-like, never cheerful. This is comfort, not performance.",
    },
    sample: "You are not behind, and you are not broken. Let the exhale get longer than the inhale.",
  },
  {
    id: "stillness",
    name: "Stillness",
    tone: "Peaceful",
    glyph: "❋",
    blurb: "Very slow, plenty of air. For sitting.",
    rate: 0.72,
    pitch: 1.0,
    prefer: ["tessa", "fiona", "karen", "libby", "emma", "clara"],
    openai: {
      voice: "sage",
      speed: 0.8,
      instructions:
        "Speak very slowly and very quietly, almost a whisper, the way a meditation teacher speaks to a room with its eyes closed. Long silences between phrases. Let the ends of sentences fall away rather than land. No emphasis, no brightness, nothing that would startle someone half asleep.",
    },
    sample: "Nothing to solve. Nothing to reach for. Just this breath, and then the next one.",
  },
  {
    id: "dawn",
    name: "Dawn",
    tone: "Calm",
    glyph: "◉",
    blurb: "Even and clear. For the morning.",
    rate: 0.92,
    pitch: 1.06,
    prefer: ["victoria", "zira", "jenny", "ava", "michelle", "salli"],
    openai: {
      voice: "coral",
      speed: 1.0,
      instructions:
        "Speak calmly and clearly, with quiet encouragement, like the first easy conversation of the morning. Even pace, no urgency, no hype. Kind rather than motivational. Natural conversational rhythm, not narration.",
    },
    sample: "Feet on the floor. You don't have to feel like it. You just have to begin.",
  },
  {
    id: "aurora",
    name: "Aurora",
    tone: "Warm",
    glyph: "✦",
    blurb: "Bright and close. For the hard days.",
    rate: 0.95,
    pitch: 1.14,
    prefer: ["ava", "nicole", "amy", "ivy", "kendra", "olivia"],
    openai: {
      voice: "nova",
      speed: 0.98,
      instructions:
        "Speak warmly and close to the microphone, like someone who is completely on your side and slightly worried about you. Gentle, human, a little imperfect. Never chirpy, never salesy, never bright for its own sake.",
    },
    sample: "I'm on your side. You've carried harder things than this and you're still standing.",
  },
  {
    id: "deepwater",
    name: "Deep Water",
    tone: "Grounded",
    glyph: "◈",
    blurb: "Low, slow, weighted. For coming back down.",
    rate: 0.78,
    pitch: 0.86,
    prefer: ["moira", "catherine", "hazel", "sonia", "natasha", "heera"],
    openai: {
      voice: "ballad",
      speed: 0.88,
      instructions:
        "Speak low, slow and weighted, with your feet on the ground. Steady and unshockable, like someone who has seen this before and is not alarmed. Deliberate pacing, full stops that actually stop. Reassurance through steadiness, not warmth.",
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
    rate: 0.82,
    pitch: 0.94,
    prefer: ["samantha", "serena", "sonia"],
    openai: {
      voice: "shimmer",
      speed: 0.9,
      instructions:
        "Speak softly and slowly, warm and unhurried, as comfort rather than performance.",
    },
    sample: "You become both the one who reassures and the one reassured.",
  },
];

export const presetById = Object.fromEntries(VOICE_PRESETS.map((p) => [p.id, p]));
export const DEFAULT_PRESET = "solace";

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
    text: "Milestone. One of five markers on this road.",
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
export function guideAreas(protocols) {
  return [
    { id: "app", name: "App moments", lines: APP_LINES },
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
