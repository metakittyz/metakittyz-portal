// SEALS — what consistency earns you.
//
// Two rules, both deliberate:
//   1. A seal is permanent. Nothing here can be taken away by a bad week.
//   2. Nothing punishes a gap. "The Return" rewards coming back, because that
//      is the harder thing and most apps treat it as failure.
//
// `test` receives the object from sealStats(). `progress` is optional and
// returns [done, target] so a locked seal can still show how close you are.

import { STAGES } from "./path.js";

export const SEALS = [
  // ---- showing up --------------------------------------------------------
  {
    id: "first-light",
    name: "First Light",
    glyph: "◉",
    tier: "opening",
    earn: "Take your first step.",
    test: (s) => s.steps >= 1,
    progress: (s) => [Math.min(s.steps, 1), 1],
  },
  {
    id: "seven",
    name: "Seven",
    glyph: "✦",
    tier: "opening",
    earn: "Show up on seven different days.",
    test: (s) => s.activeDays >= 7,
    progress: (s) => [Math.min(s.activeDays, 7), 7],
  },
  {
    id: "the-return",
    name: "The Return",
    glyph: "↻",
    tier: "rare",
    earn: "Come back after three or more days away.",
    note: "The hardest seal to want, and the one that matters most. Most people never come back at all.",
    test: (s) => s.returns >= 1,
    progress: (s) => [Math.min(s.returns, 1), 1],
  },
  {
    id: "thirty-days",
    name: "Thirty",
    glyph: "◈",
    tier: "steady",
    earn: "Show up on thirty different days.",
    test: (s) => s.activeDays >= 30,
    progress: (s) => [Math.min(s.activeDays, 30), 30],
  },
  {
    id: "hundred-days",
    name: "Devotion",
    glyph: "▲",
    tier: "rare",
    earn: "Show up on a hundred different days.",
    test: (s) => s.activeDays >= 100,
    progress: (s) => [Math.min(s.activeDays, 100), 100],
  },

  // ---- runs --------------------------------------------------------------
  {
    id: "unbroken-7",
    name: "A Clean Week",
    glyph: "◐",
    tier: "steady",
    earn: "Seven days in a row.",
    test: (s) => s.longestStreak >= 7,
    progress: (s) => [Math.min(s.longestStreak, 7), 7],
  },
  {
    id: "unbroken-21",
    name: "Unbroken",
    glyph: "◑",
    tier: "rare",
    earn: "Twenty-one days in a row.",
    test: (s) => s.longestStreak >= 21,
    progress: (s) => [Math.min(s.longestStreak, 21), 21],
  },

  // ---- the themes --------------------------------------------------------
  // Generated from STAGES so the boundaries can never drift out of step with
  // the path itself — the previous hand-written days were still pointing at an
  // older five-stage split after the path was regrouped into six.
  ...STAGES.slice(0, -1).map((stage) => ({
    id: `stage-${stage.n.toLowerCase()}`,
    name: stage.name,
    glyph: stage.n,
    tier: "stage",
    earn: `Finish Theme ${stage.n} — through day ${stage.days[1]}.`,
    test: (s) => s.steps >= stage.days[1],
    progress: (s) => [Math.min(s.steps, stage.days[1]), stage.days[1]],
  })),
  {
    id: "stage-crown",
    name: "The Crown",
    glyph: "VI",
    tier: "rare",
    earn: "Finish all forty-two steps.",
    test: (s) => s.steps >= 42,
    progress: (s) => [Math.min(s.steps, 42), 42],
  },

  // ---- the rooms ---------------------------------------------------------
  {
    id: "chronicler",
    name: "Chronicler",
    glyph: "◇",
    tier: "craft",
    earn: "Write fifty journal entries.",
    test: (s) => s.journalEntries >= 50,
    progress: (s) => [Math.min(s.journalEntries, 50), 50],
  },
  {
    id: "instrument",
    name: "The Instrument",
    glyph: "❋",
    tier: "craft",
    earn: "Take thirty readings.",
    test: (s) => s.readings >= 30,
    progress: (s) => [Math.min(s.readings, 30), 30],
  },
  {
    id: "own-voice",
    name: "Your Own Voice",
    glyph: "◎",
    tier: "craft",
    earn: "Record ten reassurances in your own voice.",
    test: (s) => s.recordings >= 10,
    progress: (s) => [Math.min(s.recordings, 10), 10],
  },
  {
    id: "honest-intake",
    name: "Honest Intake",
    glyph: "◈",
    tier: "craft",
    earn: "Log fifty things you fed the machine.",
    test: (s) => s.intakeLogged >= 50,
    progress: (s) => [Math.min(s.intakeLogged, 50), 50],
  },
  {
    id: "practised",
    name: "Practised",
    glyph: "▲",
    tier: "craft",
    earn: "Run twenty-five guided protocols.",
    test: (s) => s.protocolsRun >= 25,
    progress: (s) => [Math.min(s.protocolsRun, 25), 25],
  },
  {
    id: "the-bridge",
    name: "The Bridge",
    glyph: "✧",
    tier: "craft",
    earn: "Log ten pieces of evidence in the Forge.",
    test: (s) => s.evidenceLogged >= 10,
    progress: (s) => [Math.min(s.evidenceLogged, 10), 10],
  },
];

export const TIERS = {
  opening: { name: "Opening", color: "var(--gold)" },
  steady: { name: "Steady", color: "var(--moss)" },
  stage: { name: "Stages", color: "var(--violet)" },
  craft: { name: "Craft", color: "var(--frost)" },
  rare: { name: "Rare", color: "var(--ember)" },
};

export const sealById = Object.fromEntries(SEALS.map((s) => [s.id, s]));

export function earnedSeals(stats) {
  return SEALS.filter((s) => s.test(stats));
}
