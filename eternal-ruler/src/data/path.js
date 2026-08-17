// THE PATH — one step a day, 42 days, 6 themes.
//
// Wording rule for this file: `why` is one line. `steps` are imperatives.
// `closing` only where it earns its place. If a sentence can go, it goes.
//
// Position advances by steps completed, never by dates. Miss a month, resume here.

/**
 * Six themes, seven days each, run like a course rather than a checklist.
 *
 * The shape is borrowed from learning music, because it is the same shape:
 * first the notes — the individual signals, heard one at a time and barely.
 * Then the instrument, because an untuned receiver cannot hear anything no
 * matter how good its ear. Then phrases. Then whole compositions. Then
 * conducting the thing yourself.
 *
 * `teaches` is the plain-language version, shown on the orientation screen and
 * on your profile. `promise` is what you can do at the end of it.
 */
export const STAGES = [
  {
    id: "notes",
    n: "I",
    name: "The Notes",
    days: [1, 7],
    glyph: "◉",
    promise: "Make contact.",
    teaches: "The basic tools for becoming sensitive. Single signals, heard one at a time.",
  },
  {
    id: "instrument",
    n: "II",
    name: "The Instrument",
    days: [8, 14],
    glyph: "❋",
    promise: "Tune the receiver.",
    teaches: "Preparing the body for subtle energy — sleep, food, movement, and telling your yes from your no.",
  },
  {
    id: "ear",
    n: "III",
    name: "The Ear",
    days: [15, 21],
    glyph: "◑",
    promise: "Clear what distorts it.",
    teaches: "The material you avoid is the material that drowns the signal. This is the honest stretch.",
  },
  {
    id: "melody",
    n: "IV",
    name: "The Melody",
    days: [22, 28],
    glyph: "♪",
    promise: "Follow a whole phrase.",
    teaches: "Guidance stops arriving as single notes and starts arriving as lines you can follow.",
  },
  {
    id: "composition",
    n: "V",
    name: "The Composition",
    days: [29, 35],
    glyph: "✦",
    promise: "Put it on the page.",
    teaches: "Structure, dates and evidence. What you heard becomes something written down.",
  },
  {
    id: "orchestration",
    n: "VI",
    name: "The Orchestration",
    days: [36, 42],
    glyph: "▲",
    promise: "Conduct it yourself.",
    teaches: "Divinely guided, creative living — all of it moving together, and you holding the baton.",
  },
];

export const ROOM_UNLOCKS = { journal: 2, reading: 4, voice: 7, intake: 10, forge: 12, council: 18 };

export const PATH = [
  // ---------------------------------------------------- I · THE OPENING ----
  {
    day: 1,
    title: "Say it out loud",
    why: "Address it directly. Then leave a gap long enough for something other than your own commentary.",
    minutes: 10,
    steps: [
      "Sit. Feet on the floor.",
      'Say aloud: "I\'m here. I\'m listening."',
      "Ask one real question.",
      "Wait four minutes. Don't answer yourself.",
    ],
    protocol: "reconnect",
    closing: "Nothing may come. That's the usual day one. You showed up.",
  },
  {
    day: 2,
    title: "Write down where you are",
    why: "The baseline you'll measure everything against.",
    minutes: 12,
    steps: ["Write the honest state of your life.", "What works. What you're pretending about.", "What you want this to change."],
    prompt: "p006",
    unlocks: "journal",
  },
  {
    day: 3,
    title: "The body is the receiver",
    why: "Most people who hear nothing are just tired.",
    minutes: 15,
    steps: ["Ten minutes outside. No sunglasses, no phone.", "Move hard for four minutes.", "Pick a wake time. Hold it two weeks."],
    protocol: "body-charge",
    codex: "c-body-04",
  },
  {
    day: 4,
    title: "Take your temperature",
    why: "Two numbers: how you feel, how your higher self feels. The gap is the instrument.",
    minutes: 5,
    steps: ["Take the Reading.", "Answer fast. First instinct.", "Find your widest gap. Just look at it."],
    unlocks: "reading",
    closing: "A wide gap isn't a failing grade. It's a direction.",
  },
  {
    day: 5,
    title: "Ten minutes of nothing",
    why: "The signal doesn't get louder. The noise gets quieter.",
    minutes: 10,
    steps: ["Ten minutes. No phone, no music, no task.", 'Label each thought "thinking." Let it pass.', "When you want to leave, stay."],
    codex: "c-mind-03",
  },
  {
    day: 6,
    milestone: true,
    title: "The letter",
    why: "Write the question, then let the answer come without planning it.",
    minutes: 20,
    steps: ['Write: "What do you want me to know?"', "Answer without pausing or editing.", "Ten minutes. Don't stop moving.", "Read it only after."],
    prompt: "p003",
    codex: "c-spirit-03",
    closing: "First contact.",
  },

  // -------------------------------------------------- II · THE LISTENING ---
  {
    day: 7,
    title: "Hear yourself on your own side",
    why: "The cringe is an old rule saying you're not allowed to be for yourself.",
    minutes: 10,
    steps: ["Pick a script, or write four lines.", "Read it aloud. Again, half speed.", "Record it. Keep it."],
    protocol: "own-voice",
    unlocks: "voice",
  },
  {
    day: 8,
    title: "Find your yes",
    why: "Everyone has a physical yes and no. Most never located theirs.",
    minutes: 12,
    steps: [
      "Think of something true and good. Where does it land?",
      "Now something wrong for you. Where's that?",
      "Write both: location, quality, temperature.",
      "Check three decisions against it today.",
    ],
    codex: "c-mind-09",
  },
  {
    day: 9,
    title: "The discernment test",
    why: "An open channel is not a verified one. The most important day here.",
    minutes: 8,
    steps: ["Take something you felt guided about.", "Run all six checks.", "Be honest at check four."],
    protocol: "discernment",
    closing: "Guidance builds. Shame shrinks.",
  },
  {
    day: 10,
    title: "What you feed it",
    why: "The first thing you consume becomes the frame you carry all day.",
    minutes: 20,
    steps: [
      "Tomorrow: no phone for twenty minutes.",
      "Water, light, movement, then sit five.",
      "Log today's intake — content, food, movement, substances, people.",
      "Mark what fed you and what cost you.",
    ],
    protocol: "morning-anchor",
    codex: "c-mind-04",
    unlocks: "intake",
    closing: "You've been rating how you feel. Now track what you put in.",
  },
  {
    day: 11,
    title: "Ask again",
    why: "The second attempt is where the practice starts.",
    minutes: 12,
    steps: ['One question: "What am I not seeing about ___?"', "Ask it aloud.", "Wait five minutes. Fill nothing.", "Record it raw."],
    protocol: "reconnect",
    prompt: "p004",
  },
  {
    day: 12,
    title: "Name what you want",
    why: "Where your body flinches is the part that doesn't believe you're allowed.",
    minutes: 15,
    steps: ["Name one thing you want in the Forge.", 'Say it aloud. No justifying, no "just."', "Write what the flinch is afraid of."],
    protocol: "receive",
    unlocks: "forge",
  },
  {
    day: 13,
    title: "Whose voice is that?",
    why: "Much of what feels like inner knowing is inherited audio.",
    minutes: 15,
    steps: [
      "Write the three things your inner voice says most.",
      "For each: whose voice is this, originally?",
      "Which would you let speak to someone you love?",
    ],
    prompt: "p066",
  },
  {
    day: 14,
    title: "The audit",
    why: "Sleep going is the most common way this work turns bad.",
    minutes: 10,
    steps: ["Sleep these two weeks: better, same, worse?", "Eating, moving, seeing people?", "If any went down, do less. Not more."],
    codex: "c-body-03",
    closing: "Choosing to do less is discernment, not weakness.",
  },
  {
    day: 15,
    milestone: true,
    title: "The first signal",
    why: "Read your own log back. Find out what actually happened.",
    minutes: 20,
    steps: ["Read every entry, in order.", "Check which gaps moved.", "Write: what changed, and what would someone close notice?"],
    prompt: "p012",
    closing: "What comes next is harder.",
  },

  // -------------------------------------------------- III · THE RECKONING --
  {
    day: 16,
    title: "What you're avoiding",
    why: "It's holding a piece of your power.",
    minutes: 12,
    steps: ["Write its name. Just the name.", "Write what you fear if you face it.", "Write the smallest real version you could do this week."],
    codex: "c-mind-08",
  },
  {
    day: 17,
    title: "The judgment mirror",
    why: "The strength of your irritation measures your own disowning.",
    minutes: 15,
    steps: ["Name who most irritates you.", "List the exact qualities. Be petty.", "Find where you do that — or wish you could."],
    prompt: "p020",
    codex: "c-spirit-07",
    closing: "Nothing in you needs destroying. Ask what job it thought it had.",
  },
  {
    day: 18,
    title: "You're not the first",
    why: "Others got lost in the same places.",
    minutes: 12,
    steps: ['Read "How this works" in the Council.', "Write one field note: what you tried, what came of it.", "Include it if nothing did."],
    unlocks: "council",
  },
  {
    day: 19,
    title: "The thing you'd least want read aloud",
    why: "Shame survives on not being looked at.",
    minutes: 20,
    steps: [
      "Settle first. Five slow exhales. Timer for fifteen.",
      "Write it. Then ask if it's actually true.",
      "Write what you'd say to a friend who confessed it.",
      "Close the notebook. Go outside.",
    ],
    prompt: "p022",
    intense: true,
  },
  {
    day: 20,
    title: "Before you learned",
    why: "Every child works out what they must do to be loved, then keeps doing it.",
    minutes: 18,
    steps: ["What did you decide about yourself as a child that you still obey?", "How old were you?", "Write to that version of you."],
    prompt: "p084",
    intense: true,
    closing: "You were small. You did your best with what you had.",
  },
  {
    day: 21,
    title: "The ledger",
    why: "A grudge is doing a job for you.",
    minutes: 15,
    steps: ["List who you need to forgive. Include yourself.", "For each: what has holding it given you?", "Forgiveness isn't required today."],
    prompt: "p063",
    intense: true,
  },
  {
    day: 22,
    title: "The cost of the settle",
    why: "Most people live a life they accepted, then built a story to bear it.",
    minutes: 15,
    steps: ["What have you settled for?", "What did you tell yourself?", "Is the story still true, or just old?"],
    prompt: "p074",
    intense: true,
    closing: "Seeing it is the point. You don't have to blow up your life by Friday.",
  },
  {
    day: 23,
    title: "Feel it, don't manage it",
    why: "What you refuse to feel runs your calendar.",
    minutes: 10,
    steps: ["Pick the feeling you've managed around this week.", "Two minutes. No fixing, no lesson.", 'Then: "I feel ___ about ___ because it touches ___."'],
    protocol: "spiral-break",
    codex: "c-mind-05",
  },
  {
    day: 24,
    title: "The body's report",
    why: "You've asked it for signal for three weeks. Ask what it needs.",
    minutes: 12,
    steps: ["Scan head to feet. Where's the tension?", "Write your relationship with your body, plainly.", "Name one thing it carried you through."],
    prompt: "p043",
    intense: true,
  },
  {
    day: 25,
    milestone: true,
    title: "Come all the way back",
    why: "Grounding is the second half of the practice, not aftercare.",
    minutes: 15,
    steps: ["Run all five grounding steps.", "Talk to a person about something ordinary.", "Write: what did the Reckoning cost, and give?"],
    protocol: "grounding",
    codex: "c-spirit-09",
    closing: "You looked at what most people spend a lifetime not looking at.",
  },

  // ---------------------------------------------------- IV · THE FORGING ---
  {
    day: 26,
    title: "The real want",
    why: "You know yourself better than on day twelve. Say it again.",
    minutes: 15,
    steps: ["Look at what you named on day twelve.", "Say the true version aloud now.", "If it changed, that's the work showing."],
    closing: 'Not "abundance." The number, the room, the life.',
  },
  {
    day: 27,
    title: "Where you actually are",
    why: "Inflating this — either way — is why these fail.",
    minutes: 15,
    steps: ["Write your position in numbers and facts.", "Write the honest distance.", "Sit with the size before planning."],
  },
  {
    day: 28,
    title: "Who you have to become",
    why: "Goals get abandoned. Identities get defended.",
    minutes: 15,
    steps: ['"The person who has this is someone who…"', "List what they do weekly that you don't.", "Pick the hardest one to fake."],
    prompt: "p031",
  },
  {
    day: 29,
    title: "The daily minimum",
    why: "This is what carries the whole thing.",
    minutes: 10,
    steps: ["Write it into the Forge.", "Now halve it. Your first answer is too big.", "Do it before you close the app."],
    closing: "The small version for a year beats the big version for nine days.",
  },
  {
    day: 30,
    title: "If-then armour",
    why: "Willpower fails at the obstacle. A decision made earlier doesn't.",
    minutes: 15,
    steps: ["List the four likeliest derailments.", 'For each: "If X, then I will Y."', "Put them where you'll see them."],
  },
  {
    day: 31,
    title: "The first Tuesday",
    why: "The dream doesn't need more belief. It needs a date.",
    minutes: 20,
    steps: ["Add three dated milestones.", "Do the first physical action now.", "Badly counts."],
    protocol: "focus-lock",
  },
  {
    day: 32,
    title: "Say it as though it's true",
    why: "You'll find out which words you can't say cleanly.",
    minutes: 12,
    steps: ["Write the present-tense sentence.", "Record it.", "Play it back. Note where you stumbled."],
  },
  {
    day: 33,
    title: "Start the evidence log",
    why: "You'll hit a stretch certain nothing is happening.",
    minutes: 10,
    steps: ["Log every sign so far. Tiny counts.", "Include what you nearly dismissed.", "One a week from here."],
  },
  {
    day: 34,
    title: "Ask for something",
    why: "Almost everyone has a thing they've never directly asked for.",
    minutes: 15,
    steps: ["What do you want from people but never request?", "Ask one person today. No pre-apology.", "Write what happened — including if you didn't."],
    prompt: "p064",
  },
  {
    day: 35,
    milestone: true,
    title: "The bridge",
    why: "Want, position, identity, minimum, obstacles, dates, evidence.",
    minutes: 15,
    steps: ["Read the whole Forge entry.", "Fix anything vague. Vague is where these die.", "Say the statement aloud, standing."],
  },

  // ---------------------------------------------------- V · SOVEREIGNTY ----
  {
    day: 36,
    title: "Has anyone noticed?",
    why: "The test isn't your peak experiences. It's whether you're easier to be around.",
    minutes: 15,
    steps: ["Ask the person closest to you.", "Don't defend or explain.", "Write it exactly as they said it."],
    codex: "c-spirit-10",
  },
  {
    day: 37,
    title: "The bypass check",
    why: "Using practice to dodge real life looks like progress from the inside.",
    minutes: 12,
    steps: [
      "Where did a spiritual idea let you off a real hook?",
      "Where did you forgive too fast, or rise above a fight you needed?",
      "Pick one. Handle it this week.",
    ],
    codex: "c-spirit-08",
  },
  {
    day: 38,
    title: "Appoint a witness",
    why: "Drifting from anyone who'd contradict you is the oldest failure here.",
    minutes: 10,
    steps: ["Choose someone who'd tell you the truth.", "Give them permission to say if you seem different.", "Write their name today, while you're steady."],
    codex: "c-spirit-04",
  },
  {
    day: 39,
    title: "Learn to come down",
    why: "The ones who last ground as reliably as they reach.",
    minutes: 12,
    steps: ["Run grounding.", "Write your own version: what actually brings you back?", "Name it. Make it repeatable."],
    protocol: "grounding",
  },
  {
    day: 40,
    title: "Build your own protocol",
    why: "You know your instrument now.",
    minutes: 20,
    steps: ["Check which protocols actually shifted you.", "Write your own five steps for your worst state.", "Save it. Run it next time."],
  },
  {
    day: 41,
    title: "Write your own remark",
    why: "The one you'd want handed to you next year, on the worst morning.",
    minutes: 12,
    steps: ["One sentence. True, hard, on your side.", "Write the turn — what to do with it.", "Record it."],
  },
  {
    day: 42,
    milestone: true,
    title: "The crown",
    why: "Forty-two steps. Nobody handed you this.",
    minutes: 25,
    steps: ["Read day two's entry, then your latest.", "Take a Reading. Compare it to day four.", "Write what you know now that you didn't.", "Set your own rhythm."],
    prompt: "p103",
    closing: "You rule one kingdom, and it's behind your eyes.",
  },
];

// After 42 the path becomes a rotating weekly rhythm. It repeats. That's the point.
export const PRACTICE = [
  {
    id: "pr-1",
    title: "Reach",
    minutes: 12,
    why: "The appointment.",
    steps: ["Sit. Address directly. Ask one question.", "Wait five minutes.", "Record it raw."],
    protocol: "reconnect",
  },
  {
    id: "pr-2",
    title: "Read",
    minutes: 5,
    why: "Take your temperature.",
    steps: ["Take a Reading.", "Write one line on the widest gap.", "Calling, overreach, or noise?"],
  },
  {
    id: "pr-3",
    title: "Move",
    minutes: 20,
    why: "The vessel. Everything runs on it.",
    steps: ["Light within an hour of waking.", "Move hard enough to change your breathing.", "Protect tonight's sleep."],
    protocol: "body-charge",
  },
  {
    id: "pr-4",
    title: "Feed",
    minutes: 8,
    why: "What goes in decides what comes out.",
    steps: ["Log the day's intake.", "Mark what fed you and what cost you.", "Check Patterns. Cut one drain this week."],
  },
  {
    id: "pr-5",
    title: "Look",
    minutes: 15,
    why: "The Reckoning never finishes.",
    steps: ["Pull a deep prompt.", "Set a timer. Answer properly.", "Ground after."],
  },
  {
    id: "pr-6",
    title: "Build",
    minutes: 15,
    why: "The bridge needs maintenance.",
    steps: ["Do the daily minimum.", "Log the week's evidence.", "Move a milestone, or re-date it honestly."],
  },
  {
    id: "pr-7",
    title: "Speak",
    minutes: 10,
    why: "You're not who made the first recordings.",
    steps: ["Record one new reassurance.", "Play the litany.", "Note what you can now say cleanly."],
    protocol: "own-voice",
  },
  {
    id: "pr-8",
    title: "Rest",
    minutes: 10,
    why: "Integration happens in the descent.",
    steps: ["Nothing beyond this today.", "Read back a week.", "Write three good things, specifically."],
    protocol: "descend",
  },
];

export const TOTAL_DAYS = PATH.length;

export function stageOf(day) {
  return STAGES.find((s) => day >= s.days[0] && day <= s.days[1]) || STAGES[STAGES.length - 1];
}

export function stepFor(day) {
  return PATH.find((p) => p.day === day) || null;
}

/** Your position: the lowest step you haven't finished. */
export function currentDay(completed) {
  const done = new Set(completed);
  for (let d = 1; d <= TOTAL_DAYS; d++) if (!done.has(d)) return d;
  return TOTAL_DAYS + 1;
}

export function practiceStep(count) {
  return PRACTICE[count % PRACTICE.length];
}

/** A room opens once you've finished the step that grants it. */
export function unlockedRooms(completed, freeRoam) {
  const done = new Set(completed);
  const open = new Set(["path", "more"]);
  for (const [room, day] of Object.entries(ROOM_UNLOCKS)) {
    if (freeRoam || done.has(day)) open.add(room);
  }
  return open;
}

export function nextUnlock(completed) {
  const done = new Set(completed);
  const pending = Object.entries(ROOM_UNLOCKS)
    .filter(([, day]) => !done.has(day))
    .sort((a, b) => a[1] - b[1]);
  return pending.length ? { room: pending[0][0], day: pending[0][1] } : null;
}

export const ROOM_NAMES = {
  journal: "Journal",
  reading: "Reading",
  voice: "Voice",
  intake: "Intake",
  forge: "Forge",
  council: "Council",
};
