// THE PATH — the spine of the app.
//
// One step a day, forty-two days, five stages. You are never shown more than
// one assignment at a time, and you are never left wondering what's next.
//
// Position advances by *steps completed*, not by calendar days. Miss a week and
// you pick up exactly where you left off. There is no falling behind here.

export const STAGES = [
  {
    id: "opening",
    n: "I",
    name: "The Opening",
    days: [1, 6],
    glyph: "◉",
    promise: "Make contact. Build the habit. Prove to yourself that something is on the other end.",
  },
  {
    id: "listening",
    n: "II",
    name: "The Listening",
    days: [7, 15],
    glyph: "❋",
    promise: "Learn the difference between guidance and noise — the skill everything else depends on.",
  },
  {
    id: "reckoning",
    n: "III",
    name: "The Reckoning",
    days: [16, 25],
    glyph: "◑",
    promise: "Look at what you've been avoiding. This is the hardest stage and the one that changes people.",
  },
  {
    id: "forging",
    n: "IV",
    name: "The Forging",
    days: [26, 35],
    glyph: "✦",
    promise: "Turn what you want into something with a date on it. Vision becomes Tuesday.",
  },
  {
    id: "sovereignty",
    n: "V",
    name: "Sovereignty",
    days: [36, 42],
    glyph: "▲",
    promise: "Make it yours. You stop following the path and start setting it.",
  },
];

export const ROOM_UNLOCKS = {
  journal: 2,
  reading: 4,
  voice: 7,
  forge: 12,
  council: 18,
};

export const PATH = [
  // ============================== I · THE OPENING =========================
  {
    day: 1,
    title: "Say it out loud",
    why: "Everything in this app rests on one act: addressing your higher self directly, in your own voice, and then leaving a gap long enough for something other than your own commentary to enter. Most people never hear anything because they never stop talking.",
    minutes: 10,
    steps: [
      "Sit somewhere you won't be interrupted. Feet on the floor.",
      "Say out loud, in your own voice: \"I'm here. I've been away. I'm listening.\"",
      "Ask one question — a real one, something you actually don't know.",
      "Then wait four minutes without answering yourself. This is the entire exercise.",
    ],
    protocol: "reconnect",
    closing: "Nothing may come. That is the most common day-one result and it means nothing about you. You showed up. That's the whole assignment.",
  },
  {
    day: 2,
    title: "Write down where you actually are",
    why: "In six weeks you will not remember what today felt like, and you'll need to. This is the baseline you measure everything against — the reason a beta test has a first entry.",
    minutes: 12,
    steps: [
      "Open the Journal.",
      "Write the honest state of your life right now. Not the summary you'd give a friend — the one you'd give nobody.",
      "Include: what's working, what you're pretending about, and what you want this to change.",
    ],
    prompt: "p006",
    unlocks: "journal",
    closing: "The Journal is now open. It's the most important room in this app and the one you'll thank yourself for.",
  },
  {
    day: 3,
    title: "The body is the receiver",
    why: "Every technique for perceiving guidance — the drop in the chest, the settling, the yes and the no — runs through your body. People who can't hear anything are very often just exhausted. Before anything mystical: light, movement, sleep.",
    minutes: 15,
    steps: [
      "Get outside for ten minutes. No sunglasses, no phone. Overcast counts.",
      "Move hard enough to change your breathing for four minutes.",
      "Tonight: pick a wake time and commit to it for the next two weeks. Same time, including weekends.",
    ],
    protocol: "body-charge",
    codex: "c-body-04",
    closing: "This is not the boring prerequisite before the real work. This is a third of the real work.",
  },
  {
    day: 4,
    title: "Take your temperature",
    why: "Here is the instrument. Two numbers for each part of your life: how you feel, and how you believe your higher self feels. The gap between them is the most useful thing this app will ever show you.",
    minutes: 5,
    steps: [
      "Open the Reading.",
      "Answer fast. First instinct, not the considered answer — considered answers are usually the ones you'd prefer were true.",
      "Look at your widest gap. Don't fix it today. Just look at it.",
    ],
    unlocks: "reading",
    closing: "A wide gap is not a failing grade. It's a direction.",
  },
  {
    day: 5,
    title: "Ten minutes of nothing",
    why: "The signal doesn't get louder. The noise gets quieter. Today you practise the only skill that makes that possible — sitting in silence without reaching for something to fill it.",
    minutes: 10,
    steps: [
      "Ten minutes. No phone, no music, no task, no agenda.",
      "Thoughts will come. Don't fight them — label each one \"thinking\" and let it pass.",
      "When it gets uncomfortable, notice that you want to leave. Stay anyway.",
    ],
    codex: "c-mind-03",
    closing: "If ten minutes felt long, that's the finding. It tells you how loud it's been in there.",
  },
  {
    day: 6,
    milestone: true,
    title: "The letter",
    why: "The oldest technique there is: write the question, then let the answer come through in its own voice without planning it. Jung called it active imagination. Others call it reception. You don't have to decide which — you just have to not script it.",
    minutes: 20,
    steps: [
      "Write at the top: \"What do you want me to know?\"",
      "Then write the answer without pausing, without editing, and without deciding in advance what it will say.",
      "Speed matters — it outruns the editor. Don't stop moving for ten minutes.",
      "Read it only after you've finished.",
    ],
    prompt: "p003",
    codex: "c-spirit-03",
    closing: "First contact. Whatever came, it came from somewhere, and it's saying something you'd been declining to hear.",
  },

  // ============================= II · THE LISTENING =======================
  {
    day: 7,
    title: "Hear yourself on your own side",
    why: "You can never hear your own voice from the outside in real time. Recording it and playing it back is uncomfortable — and that discomfort is an old rule saying you're not allowed to be on your own side. Break it today.",
    minutes: 10,
    steps: [
      "Open the Voice Room and pick a script, or write four lines of your own.",
      "Read it aloud once, badly. Then again at half speed.",
      "Record it. Keep it, even if you hate it.",
    ],
    protocol: "own-voice",
    unlocks: "voice",
    closing: "You now have your own voice, on your own side, on file. On the days you can't generate this state, you can be handed it by yourself.",
  },
  {
    day: 8,
    title: "What does your yes feel like?",
    why: "Before you can trust guidance you have to know your own instrument. Everyone has a physical yes and a physical no. Most people have never deliberately located theirs.",
    minutes: 12,
    steps: [
      "Think of something you know is true and good for you. Where does it land in your body? Chest, gut, throat, spine?",
      "Now something you know is wrong for you. Where does that land, and how is it different?",
      "Write both down precisely. Location, quality, temperature.",
      "Today, check three real decisions against it before you reason about them.",
    ],
    codex: "c-mind-09",
    closing: "That's your instrument. Everything in the Listening stage is calibration.",
  },
  {
    day: 9,
    title: "The discernment test",
    why: "This is the most important day in the app. An open channel is not a verified one. Every serious tradition built tests for telling real guidance from fear, ego, and wishful thinking — because every serious tradition watched people get this wrong.",
    minutes: 8,
    steps: [
      "Take something you've recently felt guided about.",
      "Run it through all six checks in the protocol.",
      "Be honest at check four — the one about whether it conveniently gives you exactly what you already wanted.",
    ],
    protocol: "discernment",
    closing: "Guidance builds. Shame shrinks. Real guidance survives a night's sleep and is rarely flattering.",
  },
  {
    day: 10,
    title: "The quiet hour",
    why: "The first thing you consume in the morning becomes the frame you carry all day. Twenty minutes of an unnarrated mind is one of the highest-leverage things available to you, and it's free.",
    minutes: 20,
    steps: [
      "Tomorrow morning: no phone for the first twenty minutes after waking.",
      "Water, light, movement, then sit for five minutes.",
      "Notice what your mind does when nothing is feeding it.",
    ],
    protocol: "morning-anchor",
    codex: "c-mind-04",
    closing: "If this was hard, that's the most useful information you'll get this week.",
  },
  {
    day: 11,
    title: "Ask one question and don't answer it",
    why: "You already did this on day one. Do it again, now that your body is more settled and your discernment is sharper. The second attempt at a practice is where the practice actually starts.",
    minutes: 12,
    steps: [
      "One specific, open question. Not \"what should I do about everything\" — \"what am I not seeing about ____?\"",
      "Ask it out loud.",
      "Wait five full minutes. Fill nothing.",
      "Record what came — words, image, sensation, or nothing — before you interpret any of it.",
    ],
    protocol: "reconnect",
    prompt: "p004",
    closing: "Interpretation is a separate task for a separate hour. Today you're only collecting.",
  },
  {
    day: 12,
    title: "Name what you want",
    why: "You've spent eleven days listening. Now say something. Wanting clearly, out loud, without softening it, is harder than it sounds — and where your body flinches is exactly the part of you that doesn't believe you're allowed.",
    minutes: 15,
    steps: [
      "Open the Forge and name one thing you actually want.",
      "Say it out loud, without justifying it, without the word \"just\".",
      "Notice where you flinch. Write down what that part of you thinks will happen if you get it.",
    ],
    protocol: "receive",
    unlocks: "forge",
    closing: "You don't have to build the plan today. Today you only have to say the true thing.",
  },
  {
    day: 13,
    title: "Whose voice is that?",
    why: "Much of what feels like inner knowing is inherited audio — a parent, a teacher, a critic, a version of you from fifteen years ago. Guidance you can't source is guidance you can't trust.",
    minutes: 15,
    steps: [
      "Write down the three things your inner voice says most often.",
      "For each, ask: whose voice is this, originally? Whose vocabulary? Whose tone?",
      "Then ask which of them you'd let speak to someone you love that way.",
    ],
    prompt: "p066",
    closing: "You are allowed to fire a voice that has been in your head since you were nine.",
  },
  {
    day: 14,
    title: "The unglamorous audit",
    why: "Two weeks in, the practice is either being supported by your life or being undermined by it. Sleep going is the single most common way this work turns bad. This is a maintenance day, and maintenance days are why people last.",
    minutes: 10,
    steps: [
      "Honestly: how has your sleep been these two weeks? Better, same, or worse?",
      "Your eating, your movement, your contact with actual humans?",
      "If any of those went down, reduce the practice this week. Not the other way around.",
    ],
    codex: "c-body-03",
    closing: "Choosing to do less is a form of discernment, not a failure of commitment.",
  },
  {
    day: 15,
    milestone: true,
    title: "The first signal",
    why: "Two weeks of raw material. Today you read your own log back — the part almost nobody does — and find out what actually happened rather than what you remember happening.",
    minutes: 20,
    steps: [
      "Read every journal entry you've written, in order.",
      "Read your Readings and look at which gaps moved.",
      "Write one entry answering: what has actually changed, and what would a person who knows me well notice?",
    ],
    prompt: "p012",
    closing: "The Opening and the Listening are behind you. What comes next is harder. It's also the part that changes people.",
  },

  // ============================= III · THE RECKONING ======================
  {
    day: 16,
    title: "What you're avoiding",
    why: "Everything you're avoiding is currently holding a piece of your power. You don't have to do anything about it today. You only have to write its name, which is the step most people skip for years.",
    minutes: 12,
    steps: [
      "Write the name of the thing you've been avoiding. Just the name.",
      "Then write what you're afraid happens if you face it.",
      "Then write the smallest real version of facing it that you could do this week.",
    ],
    codex: "c-mind-08",
    closing: "Avoidance is the single most effective way to preserve a fear indefinitely. Your nervous system only updates on evidence, and only you can generate it.",
  },
  {
    day: 17,
    title: "The judgment mirror",
    why: "The strength of your irritation is the measure of your own disowning. Whatever you can't stand in other people is almost always a quality you exiled in yourself to stay loved.",
    minutes: 15,
    steps: [
      "Name the person who most irritates you.",
      "List the exact qualities. Be petty and specific.",
      "For each one, find where you do that — or where you desperately wish you were allowed to.",
    ],
    prompt: "p020",
    codex: "c-spirit-07",
    closing: "Nothing in you needs to be destroyed. Ask that part what job it thought it was doing.",
  },
  {
    day: 18,
    title: "You are not the first",
    why: "People have been doing this for thousands of years and getting lost in the same places. Today you open the room where others describe what worked — and read the warnings about what happens in communities built around inner experience.",
    minutes: 12,
    steps: [
      "Open the Council and read \"How this works\" in full.",
      "Write one field note: something you've tried in the last seventeen days and what actually came of it. Including if the answer is nothing.",
    ],
    unlocks: "council",
    closing: "Null results are the most useful notes in any log. Your connection is yours — nobody there has privileged access to it.",
  },
  {
    day: 19,
    title: "The thing you'd least want read aloud",
    why: "Shame survives on not being looked at. This is the deepest prompt in the app and you can decline it. Declining is a legitimate answer and knowing when not to open something is a skill this work depends on.",
    minutes: 20,
    steps: [
      "Settle your body first. Five slow exhales. Set a timer for fifteen minutes.",
      "Write the thing. Then ask honestly whether it's actually true.",
      "End by writing one sentence you'd say to a friend who confessed the same thing.",
      "Then close the notebook and go outside.",
    ],
    prompt: "p022",
    intense: true,
    closing: "You can skip this day. Mark it done and move on — nothing downstream depends on it. That option is real.",
  },
  {
    day: 20,
    title: "Before you learned",
    why: "Every child works out what they have to do to be loved, and then keeps doing it for thirty years after the audience has left. Finding the original decision is how you stop obeying it.",
    minutes: 18,
    steps: [
      "What did you decide about yourself as a child that you're still obeying?",
      "How old were you? What was happening?",
      "Write to that version of you and tell them what you now know.",
    ],
    prompt: "p084",
    intense: true,
    closing: "You were small, and you were doing your best with the information you had. Get warm afterwards — food, a blanket, someone's voice.",
  },
  {
    day: 21,
    title: "The ledger",
    why: "Holding a grudge is doing a job for you. Until you know what job, forgiveness is just a thing you fail at and feel worse about.",
    minutes: 15,
    steps: [
      "List who you need to forgive. Include yourself if that's true.",
      "For each one, write what holding it has given you — protection, identity, a reason, permission.",
      "Forgiveness is not required today. Understanding the job is enough.",
    ],
    prompt: "p063",
    intense: true,
    closing: "Premature forgiveness that skips the anger is one of the most common ways this work goes hollow.",
  },
  {
    day: 22,
    title: "The cost of the settle",
    why: "Most people are not living a life they chose. They're living one they accepted, and then built a story to make the acceptance bearable. Today you look at the story.",
    minutes: 15,
    steps: [
      "What have you settled for?",
      "What did you tell yourself to make it bearable?",
      "Is that story still true, or is it just old?",
    ],
    prompt: "p074",
    intense: true,
    closing: "Seeing it clearly is the point. You do not have to blow up your life by Friday.",
  },
  {
    day: 23,
    title: "Feel it instead of managing it",
    why: "Whatever you refuse to feel will quietly run your calendar. Feeling something for two minutes without converting it into a lesson, a plan, or a spiritual insight is much harder than it sounds.",
    minutes: 10,
    steps: [
      "Pick the feeling you've been managing around this week.",
      "Sit with it for two minutes. No fixing, no analysing, no reframing, no lesson.",
      "Then name it precisely: \"I feel ____ about ____ because it touches ____.\"",
    ],
    protocol: "spiral-break",
    codex: "c-mind-05",
    closing: "Specificity is what does the work. \"I feel bad\" does almost nothing. The precise noun shrinks the monster.",
  },
  {
    day: 24,
    title: "The body's honest report",
    why: "You've asked your body for signal for three weeks. Today you ask it what it needs, and you say the truth about your relationship with it — with no spiritual varnish on top.",
    minutes: 12,
    steps: [
      "Scan head to feet. Where is the tension living?",
      "Write your relationship with your own body, plainly.",
      "End by naming one thing your body has carried you through.",
    ],
    prompt: "p043",
    intense: true,
    closing: "Plain honesty here can sting. That's why the last step is not optional.",
  },
  {
    day: 25,
    milestone: true,
    title: "Come all the way back",
    why: "You've spent ten days in difficult material. Grounding is not optional aftercare — it's the second half of the practice. Traditions that open people without teaching the way back down produce casualties.",
    minutes: 15,
    steps: [
      "Run the grounding protocol properly. All five steps.",
      "Then talk to an actual human about something ordinary. Two minutes counts.",
      "Then write one entry: what did the Reckoning cost, and what did it give you?",
    ],
    protocol: "grounding",
    codex: "c-spirit-09",
    closing: "The Reckoning is behind you. Whatever else happens, you looked at things most people spend a lifetime not looking at.",
  },

  // ============================== IV · THE FORGING ========================
  {
    day: 26,
    title: "The real want",
    why: "You named something on day twelve. You know yourself considerably better now. Say it again — and find out whether it's still the same thing.",
    minutes: 15,
    steps: [
      "Open the Forge. Look at what you named on day twelve.",
      "Say the true version out loud now. Specific enough that you'd know the day you had it.",
      "If it changed, that's not inconsistency. That's twenty-five days of work showing up.",
    ],
    closing: "Not \"more abundance.\" The number, the room, the title, the body, the life.",
  },
  {
    day: 27,
    title: "Where you actually are",
    why: "A plan can only start from your real position. Inflating it here — in either direction — is the single most common reason these fail.",
    minutes: 15,
    steps: [
      "Write your current position in numbers and facts. No spin up, no spin down.",
      "Now write the honest distance between there and what you want.",
      "Sit with the size of it without immediately making a plan.",
    ],
    closing: "The gap is a runway, not a wound.",
  },
  {
    day: 28,
    title: "Who you have to become",
    why: "Goals get abandoned. Identities get defended. The question is not what you have to do — it's who has to be doing it.",
    minutes: 15,
    steps: [
      "Finish this in the Forge: \"The person who has this is someone who…\"",
      "List what that person does weekly that you don't.",
      "Pick the one that would be hardest to fake.",
    ],
    prompt: "p031",
    closing: "You were never asked to become someone else. You were asked to stop performing someone else.",
  },
  {
    day: 29,
    title: "The daily minimum",
    why: "This is the piece that carries the whole thing. Not the ambitious version — the version so small you can do it on your worst day, when you're ill, heartbroken, and behind.",
    minutes: 10,
    steps: [
      "Write the daily minimum into the Forge.",
      "Now halve it. Whatever you wrote is too big — everyone's first answer is.",
      "Do it today, before you close the app.",
    ],
    closing: "Consistency is a form of prayer. The small version done for a year beats the big version done for nine days.",
  },
  {
    day: 30,
    title: "If-then armour",
    why: "Deciding your response in advance is one of the most reliably effective planning techniques there is. Willpower fails at the moment of the obstacle; a pre-made decision doesn't have to be made then.",
    minutes: 15,
    steps: [
      "List the four things most likely to derail this. Be realistic, not noble.",
      "For each, write \"If X, then I will Y.\" Specific Y. Physical Y.",
      "Put them in the Forge so you'll see them when it happens.",
    ],
    closing: "Fear responds to competence better than it responds to positivity.",
  },
  {
    day: 31,
    title: "The first Tuesday",
    why: "The dream doesn't need more belief. It needs a date. Today the vision has to survive contact with a weekday.",
    minutes: 20,
    steps: [
      "Add three dated milestones to the Forge. Real dates on a real calendar.",
      "Then do the first physical action of the first one. Today. Now.",
      "Do it badly if you have to. Badly counts.",
    ],
    protocol: "focus-lock",
    closing: "Nothing changes at the level of intention. Everything changes at the level of the first ugly attempt.",
  },
  {
    day: 32,
    title: "Say it as though it's true",
    why: "One sentence, present tense, in your own voice, recorded. This is where the Voice Room and the Forge meet — and where you find out how much of you doesn't believe it yet.",
    minutes: 12,
    steps: [
      "Write the present-tense statement into the Forge. One sentence. \"I am…\"",
      "Record it in the Voice Room.",
      "Play it back. Notice which words you couldn't say cleanly. Those are the ones doing the work.",
    ],
    closing: "You are not trying to convince yourself. You are finding out where the resistance lives.",
  },
  {
    day: 33,
    title: "Start the evidence log",
    why: "You will hit a stretch where you're certain nothing is happening. This is the file you read on that day.",
    minutes: 10,
    steps: [
      "Log every sign so far that this is moving. Small counts. Tiny counts.",
      "Include things you nearly dismissed.",
      "Commit to logging one thing a week from here.",
    ],
    closing: "You remember the misses and forget the hits. The log corrects for that.",
  },
  {
    day: 34,
    title: "Ask for something out loud",
    why: "Almost everyone has a thing they want from people that they have never once directly asked for. The asking is the practice — the answer is secondary.",
    minutes: 15,
    steps: [
      "What do you want from people that you've never actually requested?",
      "Pick one person. Ask them today, plainly, without pre-apologising.",
      "Write what happened, including if you didn't do it.",
    ],
    prompt: "p064",
    closing: "Every room you enter, you're teaching people how to treat you. Today, teach something new.",
  },
  {
    day: 35,
    milestone: true,
    title: "The bridge",
    why: "You have a want, an honest starting position, an identity, a daily minimum, obstacle plans, dated milestones, and an evidence log. That's not a wish. That's a bridge.",
    minutes: 15,
    steps: [
      "Read the whole Forge entry top to bottom.",
      "Fix anything vague. Vague is where these die.",
      "Then say the present-tense statement out loud, standing up.",
    ],
    closing: "Wanting is not a plan. You now have a plan.",
  },

  // ============================ V · SOVEREIGNTY ===========================
  {
    day: 36,
    title: "Has anyone noticed?",
    why: "The measure of whether this is working is not how transcendent your experiences are. It's whether the people around you would say you've become more present, more honest, more reliable. That's the whole test.",
    minutes: 15,
    steps: [
      "Ask the person closest to you whether you've become easier or harder to be around these five weeks.",
      "Do not defend, explain, or contextualise the answer.",
      "Write it down exactly as they said it.",
    ],
    codex: "c-spirit-10",
    closing: "A connection to your higher self that doesn't show up in how you treat the person in front of you isn't a connection. It's a hobby.",
  },
  {
    day: 37,
    title: "The bypass check",
    why: "The most common failure among sincere, capable practitioners is using spiritual practice to sidestep unfinished emotional business — and it looks like progress from the inside.",
    minutes: 12,
    steps: [
      "Where have you used a spiritual idea this month to avoid a practical responsibility?",
      "Where did you forgive too fast, rise above a conflict you should have had, or detach when you were actually just avoiding?",
      "Pick one and go handle it this week.",
    ],
    codex: "c-spirit-08",
    closing: "The correction isn't less spirituality. It's insisting the practice be accountable to your ordinary life.",
  },
  {
    day: 38,
    title: "Appoint a witness",
    why: "Escalating certainty, special mission, and drifting away from anyone who'd contradict you is the oldest failure mode in this field. It feels magnificent from the inside. That's what makes it dangerous.",
    minutes: 10,
    steps: [
      "Choose one person who'd tell you the truth.",
      "Give them explicit permission to say if you start seeming different, grandiose, or unreachable.",
      "Write their name in your journal today, while you're steady.",
    ],
    codex: "c-spirit-04",
    closing: "If someone who loves you says you seem different, take that more seriously than the signs.",
  },
  {
    day: 39,
    title: "Learn to come down",
    why: "You know how to open. Now make the way back a practice rather than an emergency measure. The people who last are the ones who ground as reliably as they reach.",
    minutes: 12,
    steps: [
      "Run the grounding protocol.",
      "Then design your own version: what actually brings you back? Food, cold, a specific person, a specific walk?",
      "Write it down as a named, repeatable sequence.",
    ],
    protocol: "grounding",
    closing: "Awakening without grounding is just a beautiful way to fall apart.",
  },
  {
    day: 40,
    title: "Build your own protocol",
    why: "Thirty-nine days of running other people's sequences. You know your own instrument now. Time to write one.",
    minutes: 20,
    steps: [
      "Look back at your Readings and your ascent log. Which protocols actually shifted your state, and which didn't?",
      "Write your own five-step sequence for your most common bad state.",
      "Save it as a journal entry titled with its name. Run it the next time you need it.",
    ],
    closing: "This is the transition. You stop being someone who follows a practice and start being someone who has one.",
  },
  {
    day: 41,
    title: "Write your own remark",
    why: "You've read forty of them. Write the one you'd want handed to you on the worst morning of next year.",
    minutes: 12,
    steps: [
      "One sentence. True, hard, and on your side.",
      "Then write the turn — the thing to actually do with it.",
      "Record it in your own voice.",
    ],
    closing: "The most radical thing you can do is speak to yourself in your own voice, kindly, out loud.",
  },
  {
    day: 42,
    milestone: true,
    title: "The crown",
    why: "Forty-two days. You made contact, learned to tell signal from noise, looked at what you'd been avoiding, built a bridge to what you want, and made the whole thing accountable to your ordinary life. Nobody handed you this. You did it.",
    minutes: 25,
    steps: [
      "Read your first journal entry — day two — then read your most recent one.",
      "Take a full Reading and compare it to day four.",
      "Write the final entry: what you know now that you didn't, and what you're carrying forward.",
      "Then set your own rhythm. The Practice begins tomorrow, and you set the terms.",
    ],
    prompt: "p103",
    closing: "You are the ruler of exactly one kingdom, and it is behind your eyes. Go and govern it.",
  },
];

// After day 42 the path becomes a self-directed weekly rhythm. It repeats, and
// that's the point — the unglamorous maintenance version is what lasts.
export const PRACTICE = [
  {
    id: "pr-1",
    title: "Reach",
    minutes: 12,
    why: "The appointment. Same time, no agenda, no filling the gap.",
    steps: ["Sit. Address directly. Ask one question.", "Wait five minutes without answering yourself.", "Record what came, raw, before interpreting."],
    protocol: "reconnect",
  },
  {
    id: "pr-2",
    title: "Read",
    minutes: 5,
    why: "Take your temperature. Find the widest gap and look at it honestly.",
    steps: ["Take a Reading.", "Write one line about your widest gap.", "Decide whether it's a calling, an overreach, or noise."],
  },
  {
    id: "pr-3",
    title: "Move",
    minutes: 20,
    why: "The vessel. Everything else runs on this and it degrades the fastest.",
    steps: ["Outside light within an hour of waking.", "Move hard enough to change your breathing.", "Protect tonight's sleep like it's part of the practice — it is."],
    protocol: "body-charge",
  },
  {
    id: "pr-4",
    title: "Look",
    minutes: 15,
    why: "One honest question you'd rather not answer. The Reckoning never really finishes.",
    steps: ["Pull a deep prompt in the Journal.", "Set a timer. Answer it properly.", "Ground afterwards."],
  },
  {
    id: "pr-5",
    title: "Build",
    minutes: 15,
    why: "The bridge needs maintenance. Vague is where these die.",
    steps: ["Open the Forge. Do the daily minimum.", "Log any evidence from the week.", "Move one milestone forward or re-date it honestly."],
  },
  {
    id: "pr-6",
    title: "Speak",
    minutes: 10,
    why: "Your own voice, on your own side. Re-record as you change — you're not the same person who made the first ones.",
    steps: ["Record one new reassurance.", "Play the litany back.", "Notice which lines you can now say cleanly that you couldn't before."],
    protocol: "own-voice",
  },
  {
    id: "pr-7",
    title: "Rest",
    minutes: 10,
    why: "Integration happens in the descent, not the climb. This is a real step, not a day off.",
    steps: ["No practice today beyond this.", "Read back one week of your journal.", "Write three good things, specifically, from the week."],
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
  return TOTAL_DAYS + 1; // graduated
}

/** After graduation, which of the seven rhythm steps is up next. */
export function practiceStep(completedCount) {
  return PRACTICE[completedCount % PRACTICE.length];
}

/** A room is open once you've finished the step that grants it. */
export function unlockedRooms(completed, freeRoam) {
  const done = new Set(completed);
  const open = new Set(["path", "more"]);
  for (const [room, day] of Object.entries(ROOM_UNLOCKS)) {
    if (freeRoam || done.has(day)) open.add(room);
  }
  return open;
}

/** The next room you'll open, for the "what's coming" teaser. */
export function nextUnlock(completed) {
  const done = new Set(completed);
  const pending = Object.entries(ROOM_UNLOCKS)
    .filter(([, day]) => !done.has(day))
    .sort((a, b) => a[1] - b[1]);
  return pending.length ? { room: pending[0][0], day: pending[0][1] } : null;
}

export const ROOM_NAMES = {
  journal: "The Journal",
  reading: "The Reading",
  voice: "The Voice Room",
  forge: "The Forge",
  council: "The Council",
};
