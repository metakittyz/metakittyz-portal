// Seed profiles for The Council.
//
// IMPORTANT: these are SAMPLE profiles shipped with the beta so the directory
// isn't empty. They are not real people, they are not vetted, and nobody is
// actually available at these rates. They exist to show the shape of the thing.
// Real profiles require the backend described in README "What still needs a server".

export const FOCUS_AREAS = [
  "First contact",
  "Discernment",
  "Shadow work",
  "Dream work",
  "Breath & nervous system",
  "Meditation depth",
  "Difficult territory",
  "Manifestation & action",
  "Grounding & integration",
  "Voice & expression",
  "Ancestral practice",
  "Grief",
];

export const SEED_MENTORS = [
  {
    id: "m-seed-01",
    seeded: true,
    handle: "The Quiet Cartographer",
    title: "Discernment & first contact",
    years: 11,
    focus: ["First contact", "Discernment", "Grounding & integration"],
    rate: 65,
    unit: "45 min",
    approach:
      "Spent six years convinced every intuition was guidance and the next five learning the difference. Works mostly on the boring, unglamorous skill of telling signal from want. Will not tell you what your guidance means.",
    tone: "Direct, slow, allergic to certainty",
    availability: "2 sessions/week",
  },
  {
    id: "m-seed-02",
    seeded: true,
    handle: "Ash & Iron",
    title: "Body-first practice",
    years: 8,
    focus: ["Breath & nervous system", "Grounding & integration", "Manifestation & action"],
    rate: 55,
    unit: "45 min",
    approach:
      "Came in through strength training and breathwork rather than through anything mystical. Believes most people who can't hear anything are simply exhausted. Starts with sleep, food, and movement before touching the spiritual layer.",
    tone: "Practical, warm, unimpressed by drama",
    availability: "4 sessions/week",
  },
  {
    id: "m-seed-03",
    seeded: true,
    handle: "Nightwater",
    title: "Dream work & hypnagogia",
    years: 14,
    focus: ["Dream work", "First contact", "Shadow work"],
    rate: 80,
    unit: "60 min",
    approach:
      "Fourteen years of dream journals, most of them boring. Teaches recall first, then the edge state between waking and sleep, then dialogue. Insists you do the unremarkable logging for three months before anything else.",
    tone: "Patient, image-rich, methodical",
    availability: "1 session/week",
  },
  {
    id: "m-seed-04",
    seeded: true,
    handle: "The Long Descent",
    title: "Difficult territory & integration",
    years: 17,
    focus: ["Difficult territory", "Grounding & integration", "Grief"],
    rate: 90,
    unit: "60 min",
    approach:
      "Went through an eighteen-month period of genuine destabilization and came out with a strong opinion about how much of this work people should do alone. Works with people in the hard passage. Will refer you out without hesitation.",
    tone: "Steady, unshockable, clear about limits",
    availability: "2 sessions/week",
    note: "Peer support, not clinical care. Refers to licensed professionals where appropriate.",
  },
  {
    id: "m-seed-05",
    seeded: true,
    handle: "Ember Nine",
    title: "Voice, expression & the inner witness",
    years: 6,
    focus: ["Voice & expression", "First contact", "Manifestation & action"],
    rate: 45,
    unit: "45 min",
    approach:
      "Built their entire practice around speaking aloud — recorded affirmation, toning, dialogue in their own voice. Good with people who feel ridiculous doing this and can't get past the cringe.",
    tone: "Encouraging, playful, low-pressure",
    availability: "5 sessions/week",
  },
  {
    id: "m-seed-06",
    seeded: true,
    handle: "House of Salt",
    title: "Ancestral & lineage practice",
    years: 20,
    focus: ["Ancestral practice", "Grief", "Shadow work"],
    rate: 75,
    unit: "60 min",
    approach:
      "Works with people whose sense of a higher self keeps arriving in the shape of the dead. Careful about cultural specificity — will help you find your own lineage's practices rather than lending you someone else's.",
    tone: "Formal, reverent, deeply grounded",
    availability: "2 sessions/week",
  },
  {
    id: "m-seed-07",
    seeded: true,
    handle: "Still Point",
    title: "Meditation depth",
    years: 13,
    focus: ["Meditation depth", "Discernment", "Difficult territory"],
    rate: 70,
    unit: "60 min",
    approach:
      "Long-form concentration practice, then open monitoring, in that order and not the other way around. Spends the first three sessions on posture and stability. Considered boring by people who later thank them.",
    tone: "Sparse, precise, quietly funny",
    availability: "3 sessions/week",
  },
  {
    id: "m-seed-08",
    seeded: true,
    handle: "Verge",
    title: "Plan-making & the ordinary Tuesday",
    years: 7,
    focus: ["Manifestation & action", "Voice & expression", "Grounding & integration"],
    rate: 50,
    unit: "45 min",
    approach:
      "The least mystical person in the directory. Takes what you say you want and turns it into a calendar. Best for people who have had the vision and cannot get it to survive contact with a weekday.",
    tone: "Brisk, kind, relentlessly concrete",
    availability: "5 sessions/week",
  },
];

export const COUNCIL_TERMS = [
  "Mentors here are experienced practitioners, not licensed professionals. Peer support is not therapy, medical care, or crisis care.",
  "Nobody on this app is vetted by a governing body. Read what people say about their own experience and use your judgment.",
  "A mentor who claims certainty about your life, discourages you from talking to others, or pushes you toward large or urgent payments is a mentor to walk away from.",
  "Payments, when the marketplace goes live, run through a payment processor with a platform fee. Nothing in this beta charges anyone anything.",
  "You can end any mentoring relationship at any time, without explanation.",
];
