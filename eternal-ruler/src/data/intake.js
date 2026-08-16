// INTAKE — what you feed the machine.
//
// Five channels. Everything logged carries a charge: did it feed you or cost
// you? That's the whole point. A food diary tells you what you ate. This tells
// you what it did to you — and the Patterns tab lines it up against your Readings.

export const CHANNELS = [
  {
    id: "content",
    name: "Content",
    glyph: "◇",
    hint: "Feeds, news, video, books, music, podcasts, games",
    placeholder: "Two hours of doomscrolling",
  },
  {
    id: "food",
    name: "Food & drink",
    glyph: "◈",
    hint: "Meals, snacks, water",
    placeholder: "Eggs, toast, black coffee",
  },
  {
    id: "movement",
    name: "Movement",
    glyph: "▲",
    hint: "Training, walking, stretching, stairs",
    placeholder: "40 min easy run",
  },
  {
    id: "substances",
    name: "Substances",
    glyph: "◐",
    hint: "Caffeine, alcohol, nicotine, medication, anything else",
    placeholder: "Third coffee, 4pm",
  },
  {
    id: "people",
    name: "People",
    glyph: "❈",
    hint: "Who you spent time with. People are input too.",
    placeholder: "Lunch with M",
  },
];

export const channelById = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));

// -2 … +2. Deliberately blunt — you'll answer honestly in one tap.
export const CHARGES = [
  { v: -2, label: "Drained", short: "−−", color: "var(--frost)" },
  { v: -1, label: "Cost me", short: "−", color: "#6fa8c9" },
  { v: 0, label: "Neutral", short: "0", color: "var(--text-3)" },
  { v: 1, label: "Fed me", short: "+", color: "#e0a06a" },
  { v: 2, label: "Lit me up", short: "++", color: "var(--ember)" },
];

export const chargeByValue = Object.fromEntries(CHARGES.map((c) => [c.v, c]));

export function chargeColor(v) {
  return (chargeByValue[Math.round(v)] || chargeByValue[0]).color;
}
