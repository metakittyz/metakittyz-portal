// The twelve domains rated in every Hot & Cold check-in.
// Each carries a second-person question for you, and a mirrored question you
// answer *as* your higher self — that switch of voice is the whole exercise.

export const DOMAINS = [
  {
    id: "body",
    name: "The Body",
    pillar: "body",
    glyph: "◈",
    selfQ: "How alive does your body feel today?",
    higherQ: "How does your higher self feel about the vessel you're keeping?",
  },
  {
    id: "energy",
    name: "Energy & Rest",
    pillar: "body",
    glyph: "◐",
    selfQ: "How much charge do you actually have?",
    higherQ: "Does your higher self see you rested, or running on borrowed fuel?",
  },
  {
    id: "mind",
    name: "Clarity of Mind",
    pillar: "mind",
    glyph: "◇",
    selfQ: "How clear is the inside of your head?",
    higherQ: "Does your higher self find the channel clean or full of static?",
  },
  {
    id: "emotion",
    name: "Emotional Weather",
    pillar: "mind",
    glyph: "◍",
    selfQ: "How settled do you feel emotionally?",
    higherQ: "How does your higher self feel about what you're carrying?",
  },
  {
    id: "confidence",
    name: "Self-Trust",
    pillar: "mind",
    glyph: "▲",
    selfQ: "How much do you believe your own word right now?",
    higherQ: "How much does your higher self believe in you?",
  },
  {
    id: "purpose",
    name: "Purpose & Work",
    pillar: "mind",
    glyph: "✦",
    selfQ: "How on-path does your work feel?",
    higherQ: "Does your higher self recognize this as the road?",
  },
  {
    id: "connection",
    name: "The Connection",
    pillar: "spirit",
    glyph: "◉",
    selfQ: "How close does the line to your higher self feel?",
    higherQ: "How close does your higher self say it actually is?",
  },
  {
    id: "intuition",
    name: "Intuition & Signal",
    pillar: "spirit",
    glyph: "❋",
    selfQ: "How much are you trusting what you pick up?",
    higherQ: "How clearly does your higher self think it's been speaking?",
  },
  {
    id: "shadow",
    name: "Shadow",
    pillar: "spirit",
    glyph: "◑",
    selfQ: "How honest are you being about what you'd rather not look at?",
    higherQ: "How does your higher self feel about what's still in the basement?",
  },
  {
    id: "relationships",
    name: "People & Love",
    pillar: "world",
    glyph: "❈",
    selfQ: "How nourished do you feel by the people in your life?",
    higherQ: "How does your higher self feel about who you're spending your life beside?",
  },
  {
    id: "resources",
    name: "Money & Resource",
    pillar: "world",
    glyph: "◆",
    selfQ: "How steady do you feel about money and resource?",
    higherQ: "How does your higher self feel about your relationship with having?",
  },
  {
    id: "expression",
    name: "Voice & Expression",
    pillar: "world",
    glyph: "◎",
    selfQ: "How freely are you saying the true thing?",
    higherQ: "How much of you does your higher self see making it out into the world?",
  },
];

export const PILLARS = {
  body: { name: "Body", color: "var(--ember)" },
  mind: { name: "Mind", color: "var(--gold)" },
  spirit: { name: "Spirit", color: "var(--violet)" },
  world: { name: "World", color: "var(--frost)" },
};

export const domainById = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));
