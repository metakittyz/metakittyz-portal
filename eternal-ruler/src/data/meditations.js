// THE MEDITATION JOURNEY — six guided sits, one per theme.
//
// These run alongside the 42 days rather than inside them. Each one opens when
// its theme does, so the sequence is a journey in its own right: settling,
// then clearing, then facing, then asking, then meeting, then living with it.
//
// Two rules hold across all six, and both are safety rather than style:
//
//   1. Every sit ends on the ground. Traditions that open people up without
//      teaching the way back down produce casualties. The last two segments of
//      every meditation are always the return, and they are not skippable.
//   2. Nothing here tells you what you received. The channelled sits ask a
//      question and then get out of the way. A guided meditation that supplies
//      the answer has answered its own question, and you learn nothing about
//      your own signal from it.
//
// `hold` is the silence AFTER a line, in seconds — where the actual work
// happens. Speaking time is on top of it.
//
// `breath` sets the pacing of the ring the player draws:
//   resonance — 5.5s in, 5.5s out. About 5.5 breaths a minute, the rate that
//               maximises heart-rate variability for most adults. This is the
//               best-evidenced thing in the whole app, which is why it is the
//               default.
//   long      — 4s in, 8s out. A longer exhale biases the parasympathetic
//               side; for coming down rather than tuning in.
//   free      — no pacing shown. For the sits where watching a ring would be
//               one instruction too many.

export const BREATH = {
  resonance: { in: 5.5, out: 5.5, label: "5.5 in · 5.5 out" },
  long: { in: 4, out: 8, label: "4 in · 8 out" },
  free: null,
};

export const MEDITATIONS = [
  {
    id: "m-contact",
    theme: "notes",
    name: "First Contact",
    kind: "guided",
    evidence: "mixed",
    purpose: "Arrive, address it once, and leave a gap big enough for something other than your own commentary.",
    breath: "resonance",
    segments: [
      { text: "Sit down. Both feet on the floor. You don't have to sit up straight, you just have to stop moving.", hold: 12 },
      { text: "Let the breath follow the ring. In as it grows. Out as it falls. Don't force it — just lean toward it.", hold: 45 },
      { text: "Nothing to reach for yet. Let the body work out that it is allowed to stop.", hold: 40 },
      { text: "Now, out loud or under your breath, say: I'm here. I'm listening.", hold: 20 },
      { text: "That's the whole address. You don't have to be worthy of it and you don't have to believe it.", hold: 30 },
      { text: "Leave the gap. Whatever turns up in it, let it turn up.", hold: 90 },
      { text: "If all you got was your own noise, that's the usual first time. You showed up, which is the part you control.", hold: 20 },
      { text: "Come back now. Feel the floor take your weight again.", hold: 15, ground: true },
      { text: "Open your eyes. Have some water. Go and do something ordinary with your hands.", hold: 8, ground: true },
    ],
  },
  {
    id: "m-clear",
    theme: "instrument",
    name: "Clearing the Receiver",
    kind: "guided",
    evidence: "researched",
    purpose: "A body scan, top to bottom. Most people who hear nothing are carrying too much static to hear through.",
    breath: "resonance",
    segments: [
      { text: "Lie down if you can. This one is about the body, and the body reports more honestly when it isn't holding you up.", hold: 15 },
      { text: "Breathe with the ring for a while. Nothing else.", hold: 55 },
      { text: "Start at the top of your head. Don't relax anything yet. Just notice what's there.", hold: 30 },
      { text: "Your jaw. Your throat. Most people find something here they had no idea they were holding.", hold: 35 },
      { text: "Shoulders. Chest. The whole front of you.", hold: 35 },
      { text: "Your stomach. Your lower back. Anywhere here that's tight, let it be tight and keep breathing.", hold: 40 },
      { text: "Legs, and then your feet. All the way to the ends of you.", hold: 35 },
      { text: "Now the whole thing at once. The entire instrument, in one piece.", hold: 45 },
      { text: "This is what you receive with. It works better rested, fed and moved, and there is no way round that.", hold: 20 },
      { text: "Come back. Press your feet down and feel actual weight going into actual ground.", hold: 15, ground: true },
      { text: "Sit up slowly. Slower than you think you need to.", hold: 8, ground: true },
    ],
  },
  {
    id: "m-room",
    theme: "ear",
    name: "The Room You Don't Go Into",
    kind: "guided",
    evidence: "mixed",
    intense: true,
    purpose: "Turn toward one avoided thing, from a safe distance, with a door you can close.",
    breath: "long",
    segments: [
      { text: "Before anything else: you can stop this at any point and nothing is lost. Say that back to yourself.", hold: 12 },
      { text: "Breathe with the ring. The exhale is longer than the inhale on purpose — it's the fastest lever you have on your own nervous system.", hold: 60 },
      { text: "When you're steady, picture a corridor. Ordinary. Yours.", hold: 30 },
      { text: "There's one door in it you walk past. You already know which one. Don't open it.", hold: 35 },
      { text: "Stand outside it. Notice what your body does just from standing here. That reaction is information.", hold: 45 },
      { text: "Name the thing behind the door. One sentence, in plain words, no softening.", hold: 40 },
      { text: "You don't have to go in. Naming it from the corridor is the whole exercise today.", hold: 35 },
      { text: "Now turn around. Walk back the way you came. The door stays shut.", hold: 25 },
      { text: "Come all the way back. Feet on the floor, weight going down.", hold: 20, ground: true },
      { text: "Open your eyes. Look around the room you're actually in and name five things you can see.", hold: 20, ground: true },
      { text: "Eat something. Tell another person you did this, today, not later.", hold: 8, ground: true },
    ],
  },
  {
    id: "m-question",
    theme: "melody",
    name: "One Real Question",
    kind: "channelled",
    evidence: "traditional",
    purpose: "Ask one thing that matters, then stay quiet long enough for something other than your own answer.",
    breath: "resonance",
    segments: [
      { text: "Settle. Feet down. Let the breath find the ring.", hold: 45 },
      { text: "You get one question. Not a list. Pick the one you'd actually want answered.", hold: 40 },
      { text: "Say it. Out loud if you can — direct address does something that thinking it doesn't.", hold: 25 },
      { text: "Now stop. The hard part of this is not the asking.", hold: 100 },
      { text: "Your own voice will answer first. It always does. Let it, and keep waiting.", hold: 100 },
      { text: "If something came, don't grab it. Let it sit there and stay unfinished.", hold: 50 },
      { text: "Whatever arrived, write it down before you decide what it meant. The deciding can wait.", hold: 20 },
      { text: "Come back. Feel the chair, the floor, the temperature of the room.", hold: 15, ground: true },
      { text: "Open your eyes. Move your body before you think about any of it.", hold: 8, ground: true },
    ],
  },
  {
    id: "m-meeting",
    theme: "composition",
    name: "The Meeting",
    kind: "channelled",
    evidence: "traditional",
    purpose: "Go to a place you know, and see who is already there.",
    breath: "resonance",
    segments: [
      { text: "This one asks you to imagine, and imagining is not the same as making it up. Hold that lightly and begin.", hold: 15 },
      { text: "Breathe with the ring until the breathing stops being something you're doing.", hold: 70 },
      { text: "Picture somewhere outdoors that you know is safe. Real or not. Yours either way.", hold: 40 },
      { text: "Put yourself in it properly. What's underfoot. What the air is doing. What you can hear from here.", hold: 50 },
      { text: "There's somewhere in this place to sit. Go and sit down.", hold: 30 },
      { text: "Someone is going to arrive. You don't get to choose who, and you don't have to see them clearly.", hold: 60 },
      { text: "Let them get here in their own time. Notice what changes in the place when they do.", hold: 90 },
      { text: "Ask them the only question worth asking a stranger who came a long way: what do you want me to know?", hold: 110 },
      { text: "Whatever came, thank them. You can come back here. The place doesn't go anywhere.", hold: 30 },
      { text: "Now leave the way you arrived, and bring nothing with you but the answer.", hold: 25 },
      { text: "Come all the way down. Feet on real floor, hands on something solid.", hold: 20, ground: true },
      { text: "Open your eyes. Write it down, then eat something.", hold: 8, ground: true },
    ],
  },
  {
    id: "m-living",
    theme: "orchestration",
    name: "Living Guided",
    kind: "channelled",
    evidence: "traditional",
    purpose: "Take the line off the cushion. This is the one you run on ordinary days, forever.",
    breath: "resonance",
    segments: [
      { text: "Sit however you sit now. By this point you have your own version of this.", hold: 30 },
      { text: "Breathe until the noise drops a level. You know what that feels like now.", hold: 60 },
      { text: "Bring up tomorrow. Not the whole of it — the first hard hour.", hold: 40 },
      { text: "Watch yourself go through it as someone who is being guided. Nothing dramatic. Just less alone.", hold: 60 },
      { text: "Notice where in that hour you'd normally stop asking and start bracing.", hold: 45 },
      { text: "Ask now, for that hour specifically: what do I most need to remember here?", hold: 90 },
      { text: "Take whatever answer came, and shrink it to one sentence you could actually think tomorrow at speed.", hold: 45 },
      { text: "That sentence is the whole practice. Everything else was scaffolding for that.", hold: 25 },
      { text: "Come back. Weight down, eyes open when you're ready.", hold: 15, ground: true },
      { text: "Go and live the day. That was always the point of the sitting.", hold: 8, ground: true },
    ],
  },
];

export const meditationById = Object.fromEntries(MEDITATIONS.map((m) => [m.id, m]));

/** Which sits are open, given the themes the path has reached. */
export function openMeditations(day, freeRoam, stages) {
  if (freeRoam) return MEDITATIONS;
  return MEDITATIONS.filter((m) => {
    const stage = stages.find((s) => s.id === m.theme);
    return stage && day >= stage.days[0];
  });
}

export const meditationLineId = (medId, i) => `meditation:${medId}:${i}`;

/** Every meditation line, addressable, so it can be recorded in your own voice. */
export function meditationLines() {
  return MEDITATIONS.map((m) => ({
    id: m.id,
    name: m.name,
    lines: m.segments.map((s, i) => ({
      id: meditationLineId(m.id, i),
      text: s.text,
      label: s.text.slice(0, 46) + (s.text.length > 46 ? "…" : ""),
    })),
  }));
}

/** Total runtime, narration estimated at a slow reading pace. */
export function runtimeSeconds(m) {
  return m.segments.reduce((total, s) => total + s.hold + s.text.length / 12, 0);
}
