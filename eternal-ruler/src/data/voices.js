// THE VOICE LIBRARY.
//
// A preset is a character, not a file: a tone (pace + pitch) plus an ordered
// list of device-voice names to reach for. Browsers only expose whatever voices
// the operating system has, so a preset resolves to the best available match
// and falls back to the best female voice on the device. That means Solace
// sounds a little different on a Mac than on Android — the *character* is the
// pace and pitch, which are ours, and travel intact.

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
