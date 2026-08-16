// State Stacks — the "what do I actually do right now" layer.
//
// Every protocol declares how much of it is research-backed vs. traditional
// practice, because you deserve to know which lever you're pulling:
//
//   evidence: "researched"  — mechanism has reasonable published support
//             "mixed"       — popular, partially supported, over-claimed elsewhere
//             "traditional" — contemplative/experiential practice, not a lab result
//
// Steps with `seconds` drive the guided timer in the Ascend room.

export const NEEDS = [
  { id: "peak", label: "Maximum state" },
  { id: "calm", label: "Too activated" },
  { id: "courage", label: "Need courage" },
  { id: "focus", label: "Scattered" },
  { id: "energy", label: "Running flat" },
  { id: "connect", label: "Feel disconnected" },
  { id: "ground", label: "Too open / spinning" },
  { id: "rest", label: "Can't come down" },
];

export const PROTOCOLS = [
  {
    id: "the-ascent",
    name: "The Ascent",
    need: "peak",
    glyph: "▲",
    pillar: "mind",
    minutes: 12,
    tagline: "The full ladder into your maximum working state.",
    evidence: "mixed",
    why:
      "Peak state isn't one switch, it's a stack: body first (blood, breath, light), then nervous system (down-regulate the noise), then attention (narrow it), then identity (decide who is doing the work), then the single next action. Each rung is cheap. Skipping the bottom rungs is why willpower alone keeps failing.",
    steps: [
      { label: "Stand and move", seconds: 120, detail: "Anything that raises your heart rate. Push-ups, stairs, shadowboxing, jumping. Don't be graceful about it — you are moving blood, not performing." },
      { label: "Cold on the face", seconds: 30, detail: "Cold water on your face and the back of your neck. The face-cold response reliably drops heart rate and interrupts a runaway state. Skip if you have a cardiac condition." },
      { label: "Light and horizon", seconds: 60, detail: "Get to a window or outside. Let your eyes go wide and soft across the whole scene rather than locking on anything. Bright light early in the day is the strongest anchor your body clock has." },
      { label: "Five slow exhales", seconds: 90, detail: "Inhale through the nose for four. Exhale slowly through the mouth for eight. The long exhale is the part that matters — it's the brake pedal on your arousal." },
      { label: "Name the state you're leaving", seconds: 45, detail: "Say it out loud: 'I'm anxious.' 'I'm scattered.' 'I'm resentful.' Naming an emotion measurably reduces its grip. Vagueness keeps it in charge." },
      { label: "Declare the identity", seconds: 60, detail: "Out loud, in second person, using your own name: '[Name], you are the person who does this whether or not you feel like it.' Talking to yourself as 'you' instead of 'I' creates the distance that makes it land." },
      { label: "Close the loops", seconds: 120, detail: "Write down every open loop screaming for attention. All of them. They stop pulling once they're on paper and off your working memory." },
      { label: "Choose one thing", seconds: 60, detail: "One task. Not a list. Write the first physical action of it — the actual first keystroke or sentence, not the goal." },
      { label: "Seal it", seconds: 60, detail: "Phone in another room. Timer for 50 minutes. Hand on the desk. Begin before you feel ready — readiness is a result, not a prerequisite." },
    ],
  },
  {
    id: "spiral-break",
    name: "Spiral Break",
    need: "calm",
    glyph: "◐",
    pillar: "body",
    minutes: 3,
    tagline: "Interrupt an anxiety spiral in under three minutes.",
    evidence: "researched",
    caution: "If panic is frequent or severe, this is a tool, not a treatment. That's a conversation for a clinician.",
    why:
      "A spiral is a feedback loop between a stressed body and a catastrophizing mind. You cannot argue your way out of it, because the arguing is the loop. You break it at the body, then at the senses, then at language.",
    steps: [
      { label: "Double inhale, long exhale", seconds: 60, detail: "Sharp inhale through the nose, a second small sip of air on top, then a long slow exhale through the mouth. Repeat five times. This 'physiological sigh' pattern is one of the fastest voluntary ways to drop arousal." },
      { label: "Cold on the face", seconds: 30, detail: "Splash cold water on your face, or hold something cold against your cheekbones and the back of the neck for thirty seconds." },
      { label: "Five, four, three", seconds: 60, detail: "Name five things you can see, four you can hear, three you can physically feel touching you. Out loud if you can. This pulls attention out of the projected future and back into the actual room." },
      { label: "Name it precisely", seconds: 30, detail: "'I am feeling ____ about ____.' The more specific the noun, the smaller the monster." },
    ],
  },
  {
    id: "courage-gate",
    name: "The Courage Gate",
    need: "courage",
    glyph: "✦",
    pillar: "mind",
    minutes: 4,
    tagline: "For the four minutes before the hard thing.",
    evidence: "mixed",
    why:
      "Courage is not the absence of activation — it's the same activation, relabeled and pointed forward. The physiology of fear and of readiness are nearly identical. The work is reinterpretation plus commitment, done fast, before your mind builds the case for retreat.",
    steps: [
      { label: "Relabel the charge", seconds: 45, detail: "Say: 'This is my body getting ready.' Reappraising arousal as readiness rather than dread measurably improves performance under pressure. It's the same adrenaline either way — you're choosing the caption." },
      { label: "Take the shape", seconds: 60, detail: "Stand up. Chest open, shoulders back and down, chin level, feet planted wide. Hold it for a full minute. Posture reliably changes how confident you *feel* — that part holds up — so use it for exactly that." },
      { label: "Recall the evidence", seconds: 60, detail: "Name three specific times you did something you were afraid of and survived. Specifics, with dates if you have them. You are not asking yourself to believe; you are showing yourself the record." },
      { label: "Second-person command", seconds: 30, detail: "Use your own name, out loud: '[Name], you've done harder. Walk in.' Distanced self-talk beats first-person pep talk under stress." },
      { label: "Commit to the first move", seconds: 45, detail: "Decide the exact opening line or first physical action. Nothing else. Then move within ten seconds of the timer ending — hesitation past that point is where courage leaks." },
    ],
  },
  {
    id: "focus-lock",
    name: "Focus Lock",
    need: "focus",
    glyph: "◇",
    pillar: "mind",
    minutes: 5,
    tagline: "From scattered to locked in.",
    evidence: "mixed",
    why:
      "Scatter is usually three things at once: too many open loops, too much available stimulation, and a body that never got told what mode it's in. Handle all three and focus mostly arrives on its own.",
    steps: [
      { label: "Dump the loops", seconds: 120, detail: "Write every unfinished thing pulling at you. Don't organize. Unwritten open loops consume working memory continuously; written ones mostly stop." },
      { label: "Strip the field", seconds: 60, detail: "Phone in another room — not face-down on the desk, another room. Close every tab that isn't the task. Kill notifications for the block." },
      { label: "Narrow the gaze", seconds: 60, detail: "Fix your eyes on a single small point for 30-60 seconds. Visual narrowing tends to pull mental focus with it. It's a popular technique with real but modest evidence — treat it as a nudge, not magic." },
      { label: "Set the container", seconds: 30, detail: "One task, one timer, 50 minutes. Then a real 10-minute break away from screens. You have roughly 90-minute rhythms in you; work with them instead of grinding past them." },
      { label: "Start ugly", seconds: 30, detail: "Write the worst possible first sentence, or make the sloppiest first move. Starting badly is the fastest known cure for not starting." },
    ],
  },
  {
    id: "ignite",
    name: "Ignite",
    need: "energy",
    glyph: "◉",
    pillar: "body",
    minutes: 6,
    tagline: "When you're flat and nothing is pulling you.",
    evidence: "mixed",
    why:
      "Flatness is often low arousal plus no salient reason, not a character flaw. Raise arousal physically, then attach it to something that actually means something to you — arousal without meaning is just jitter.",
    steps: [
      { label: "Sunlight or bright light", seconds: 120, detail: "Outside if possible, even overcast. Morning outdoor light is dramatically brighter than indoor light and is the single strongest signal for daytime alertness and nighttime sleep quality." },
      { label: "Move until you breathe hard", seconds: 120, detail: "Ninety seconds of real effort. Not a stretch — effort. You're chasing a change in heart rate, not a workout." },
      { label: "Cold, brief", seconds: 60, detail: "Cold water — face, hands, or the last minute of a shower. Brief cold reliably raises alertness. Skip it if you have cardiac issues or it makes you panicky." },
      { label: "Reconnect the why", seconds: 60, detail: "Say out loud who this day is for. Not what you have to do — who it's for. Meaning is the difference between activation and motivation." },
    ],
  },
  {
    id: "reconnect",
    name: "The Reconnection",
    need: "connect",
    glyph: "❋",
    pillar: "spirit",
    minutes: 10,
    tagline: "When the line to your higher self has gone quiet.",
    evidence: "traditional",
    why:
      "In most contemplative traditions the connection is not something you build, it's something you stop obstructing. Silence, a settled body, a clear address, and then — the hardest part — actually waiting for an answer instead of supplying one.",
    steps: [
      { label: "Settle the vessel", seconds: 120, detail: "Sit upright, feet on the floor, hands open on your knees. Let the exhale get longer than the inhale until the fidgeting stops. Nothing arrives through a body that's still bracing." },
      { label: "Empty the channel", seconds: 120, detail: "Say out loud everything you're carrying into this. The day, the resentment, the wanting. Put it down verbally. You're clearing the line, not confessing." },
      { label: "Address directly", seconds: 60, detail: "Speak to your higher self by whatever name you use, out loud, in your own voice. Direct address matters more than the words. 'I'm here. I've been away. I'm listening.'" },
      { label: "Ask one question", seconds: 60, detail: "One. Specific. Open. Not 'what should I do about everything' — 'what am I not seeing about ____?'" },
      { label: "Wait without filling", seconds: 240, detail: "Four minutes of not answering yourself. This is the entire discipline. Most people never hear anything because they never leave a gap long enough for something other than their own commentary to enter." },
      { label: "Write before you interpret", seconds: 60, detail: "Whatever came — words, image, sensation, nothing — record it raw. Interpretation is a separate task for a separate hour." },
    ],
  },
  {
    id: "discernment",
    name: "The Discernment Test",
    need: "connect",
    glyph: "◆",
    pillar: "spirit",
    minutes: 5,
    tagline: "Is this guidance, or fear wearing its coat?",
    evidence: "traditional",
    why:
      "This is the most important protocol in the app. An open channel is not a verified one. Every serious tradition developed tests for discerning genuine guidance from ego, fear, wishful thinking, and old wounds — because every serious tradition watched people get this wrong.",
    steps: [
      { label: "Check the tone", seconds: 45, detail: "Guidance is steady, spacious, and unhurried. Fear is urgent, shaming, and insistent. If it's rushing you or making you small, it isn't your higher self — whatever else it is." },
      { label: "Check the body", seconds: 45, detail: "Real guidance usually lands with a settling — a drop, an exhale, a widening. Compulsion lands as tightening, buzzing, heat in the face." },
      { label: "Check the origin", seconds: 60, detail: "Whose voice is it, historically? A parent's? A critic's? A past version of you? Much of what feels like inner knowing is inherited audio." },
      { label: "Check the wish", seconds: 60, detail: "Does the message happen to give you exactly what you already wanted? Convenient guidance deserves triple scrutiny. Genuine guidance is often inconvenient and rarely flattering." },
      { label: "Check against time", seconds: 45, detail: "Real guidance survives a night's sleep and repeats. If it evaporates by morning it was a mood. Sit on anything big for seventy-two hours." },
      { label: "Check the fruit", seconds: 45, detail: "Does following this make you kinder, clearer, more responsible, more grounded? Or more isolated, grandiose, and secretive? The fruit is the test that never lies." },
    ],
  },
  {
    id: "grounding",
    name: "Grounding",
    need: "ground",
    glyph: "◈",
    pillar: "body",
    minutes: 5,
    tagline: "After a deep opening, come all the way back.",
    evidence: "mixed",
    caution:
      "If dissociation, derealization, or a sense of unreality persists for more than a day, stop the intensive practices and talk to a professional. This is the most common way spiritual practice goes wrong, and it is very manageable when caught early.",
    why:
      "Intense practice can leave you spacey, porous, or unreal-feeling. Grounding is not optional aftercare — it's the second half of the practice. Traditions that push people open without teaching the way back down produce casualties.",
    steps: [
      { label: "Feet, floor, weight", seconds: 60, detail: "Stand. Press your feet down. Feel actual weight going into actual ground. Say where you are, out loud: the room, the city, the date." },
      { label: "Eat something", seconds: 90, detail: "Something dense and real — protein, fat, salt. Chewing and digesting is one of the fastest routes back into the body. Every tradition figured this out." },
      { label: "Cold water, hands and face", seconds: 30, detail: "Sensation over abstraction. Cold is the most reliable sensory anchor you have on hand." },
      { label: "Touch three textures", seconds: 60, detail: "Fabric, wood, stone, skin. Name each one out loud as you touch it." },
      { label: "Talk to a person", seconds: 60, detail: "An actual human, about something ordinary. Even two minutes. Other people are a grounding technology." },
    ],
  },
  {
    id: "reset",
    name: "The Reset",
    need: "calm",
    glyph: "◍",
    pillar: "mind",
    minutes: 5,
    tagline: "After a conflict, a rejection, or a hit.",
    evidence: "researched",
    why:
      "After a social threat your system stays flooded long after the event ends, and every decision made in that window is worse than the one you'd make in an hour. The task is to discharge, name, and delay — not to resolve.",
    steps: [
      { label: "Discharge physically", seconds: 120, detail: "Walk fast, shake your hands out, push against a wall. The charge is literal and it needs somewhere to go, or it goes into your next sentence." },
      { label: "Name what got hit", seconds: 60, detail: "Not what they did — what it touched in you. 'That hit my fear of being dismissed.' The event is rarely the size of the reaction." },
      { label: "Separate fact from story", seconds: 90, detail: "Two columns. What was literally said and done. What you added. The second column is always longer." },
      { label: "Delay the response", seconds: 30, detail: "No replies, no decisions, no texts for a set time. Write the message if you must; do not send it. Set the delay now, out loud." },
    ],
  },
  {
    id: "receive",
    name: "Open to Receive",
    need: "connect",
    glyph: "◎",
    pillar: "spirit",
    minutes: 6,
    tagline: "Before you ask for anything, make it safe to have.",
    evidence: "traditional",
    why:
      "Wanting from a braced body reads as threat, not desire. Whatever you believe about manifestation, the practical mechanic is the same: a nervous system that doesn't believe it's safe to have the thing will sabotage the steps toward it. Settle first, then ask.",
    steps: [
      { label: "Slow the breath", seconds: 120, detail: "Longer exhale than inhale, until your shoulders drop on their own. Don't proceed until they do." },
      { label: "Say what you want, plainly", seconds: 60, detail: "Out loud, without softening it, without justifying it, without the word 'just'. Notice where your body flinches." },
      { label: "Find the flinch", seconds: 90, detail: "Wherever it tightened — that's the part of you that doesn't believe you're allowed. Ask it what it thinks will happen if you get it." },
      { label: "Answer that fear specifically", seconds: 90, detail: "Not with affirmation. With a plan. 'If I get it and can't handle it, I will ____.' Fear responds to competence better than to positivity." },
      { label: "Ask once, then release", seconds: 60, detail: "State it once, cleanly. Then let go of the outcome and go do the next physical step. Gripping is the tell that you don't believe it." },
    ],
  },
  {
    id: "own-voice",
    name: "Your Own Voice",
    need: "connect",
    glyph: "◉",
    pillar: "spirit",
    minutes: 4,
    tagline: "Speak the reassurance you've been waiting to hear from someone else.",
    evidence: "mixed",
    why:
      "Hearing your own voice say the true thing lands differently than thinking it. It engages hearing, speech, and self-recognition at once, and it puts you on both ends of the exchange — the one who reassures and the one reassured. Record it once and you can be met by yourself on the days you can't generate it.",
    steps: [
      { label: "Write four lines", seconds: 90, detail: "What would you need to hear right now from someone who fully knew you and was completely on your side? Write it in second person: 'You are…' 'You have…'" },
      { label: "Read it out loud, badly", seconds: 45, detail: "First pass will feel absurd. Do it anyway. The cringe is the old rule that says you're not allowed to be on your own side." },
      { label: "Read it again, slower", seconds: 60, detail: "Half speed. Land on the words you don't believe. Those are the ones doing the work." },
      { label: "Record it", seconds: 45, detail: "Keep it in the Voice Room. On the days you can't produce this state, you can be handed it by yourself." },
    ],
  },
  {
    id: "descend",
    name: "The Descent",
    need: "rest",
    glyph: "◑",
    pillar: "body",
    minutes: 8,
    tagline: "Come down properly so tomorrow's state is already half-built.",
    evidence: "researched",
    why:
      "Tomorrow's peak state is mostly decided tonight. Sleep is where memory consolidates, emotion gets metabolized, and the nervous system resets. Wind-down is not a luxury add-on — it's the first step of tomorrow's protocol.",
    steps: [
      { label: "Dim everything", seconds: 60, detail: "Overheads off, lamps low, screens dim and away from your eyes. Bright light late tells your body clock it's still daytime." },
      { label: "Close today out loud", seconds: 120, detail: "Say what got done. Say what didn't and when it will. Unclosed loops are what wake you at 3am." },
      { label: "Three good things", seconds: 90, detail: "Specific, from today, however small. Regularly noting a few good things has decent support for improving mood over weeks — the specificity is what makes it work." },
      { label: "Long exhales in the dark", seconds: 180, detail: "Lying down. Inhale four, exhale eight. Don't count sleep, count breaths." },
      { label: "Hand off the day", seconds: 60, detail: "Say it: 'I'm done. Whatever's unfinished, I hand it over until morning.' Address it to your higher self if that's your language." },
    ],
  },
  {
    id: "morning-anchor",
    name: "The First Hour",
    need: "peak",
    glyph: "✧",
    pillar: "body",
    minutes: 30,
    tagline: "The one hour that sets everything downstream.",
    evidence: "mixed",
    why:
      "The first hour has outsized leverage because it sets your body clock, your dopamine baseline, and your sense of who's in charge today. Every item here is cheap; the combination is what compounds. Treat it as a checklist, not a timer.",
    steps: [
      { label: "No phone for the first 20 minutes", detail: "The first thing you consume becomes the frame you carry. Give yourself twenty minutes of an unnarrated mind." },
      { label: "Water, then light", detail: "A large glass of water, then outdoor light on your face for 5-10 minutes. Overcast still counts; through a window counts much less." },
      { label: "Move for five minutes", detail: "Not a workout. Just enough to change your breathing and tell your body which mode we're in." },
      { label: "Delay caffeine 60-90 minutes", detail: "Popular advice with modest evidence, but many people do report a flatter afternoon crash. Run it as a two-week experiment on yourself rather than taking anyone's word." },
      { label: "Sit for five minutes", detail: "Silence, breath, or the Reconnection. This is the appointment with your higher self. Same time daily beats long and occasional." },
      { label: "Write the one thing", detail: "Before input, before email: what is the one thing that would make today count? Write it where you'll see it." },
      { label: "Say the day's line", detail: "One sentence out loud about who you're being today. Your own voice, your own name." },
    ],
  },
  {
    id: "body-charge",
    name: "Body Charge",
    need: "energy",
    glyph: "▲",
    pillar: "body",
    minutes: 4,
    tagline: "Four minutes to change your chemistry.",
    evidence: "researched",
    caution:
      "Basic exertion caution: build up gradually, stop if you feel chest pain or dizziness, and check with a doctor first if you have a cardiac or blood-pressure condition or are pregnant.",
    why:
      "Short, hard efforts change how you feel faster than almost anything else you can do without a substance. Four minutes is enough to shift mood, alertness, and — over months — the cardiovascular capacity that underwrites all of it.",
    steps: [
      { label: "Warm up", seconds: 60, detail: "Easy movement. Joints through their range. Get the breath going." },
      { label: "Hard effort", seconds: 60, detail: "Sixty seconds at something like 8/10. Sprint, stairs, burpees, hard cycling. Uncomfortable, not injurious." },
      { label: "Easy", seconds: 60, detail: "Keep moving, let the heart rate come down. Notice how different the inside of your head already is." },
      { label: "Hard effort", seconds: 60, detail: "One more. Finish it. This is a promise-keeping exercise as much as a physiological one." },
    ],
  },
];

export const protocolById = Object.fromEntries(PROTOCOLS.map((p) => [p.id, p]));

export const EVIDENCE_LABEL = {
  researched: { short: "Research-backed", note: "The core mechanism has reasonable published support." },
  mixed: { short: "Mixed evidence", note: "Popular and plausible, partially supported, frequently over-claimed elsewhere. Run it as your own experiment." },
  traditional: { short: "Traditional practice", note: "A contemplative or experiential practice, not a laboratory result. Judged by its fruit, not by a citation." },
};
