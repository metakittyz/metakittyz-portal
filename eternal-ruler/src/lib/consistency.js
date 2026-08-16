// Consistency: what you did, on which days, and what that adds up to.
//
// House rule, inherited from the rest of the app: nothing here punishes a gap.
// Streaks are reported, never demanded, and once a seal is earned it is yours
// permanently. Coming back after time away earns its own seal, because that is
// the harder thing and every other app treats it as failure.

import { addDays, dayKey, daysBetween, parseDayKey } from "./util.js";

export const ACTIVITY = {
  step: { name: "Step", color: "var(--gold)" },
  journal: { name: "Journal", color: "var(--violet)" },
  reading: { name: "Reading", color: "var(--ember)" },
  intake: { name: "Intake", color: "var(--moss)" },
  protocol: { name: "Practice", color: "var(--frost)" },
  voice: { name: "Voice", color: "#e0a06a" },
};

/** dayKey -> Set of activity kinds. */
export function activityByDay(state) {
  const map = {};
  const add = (key, kind) => {
    if (!key) return;
    (map[key] ||= new Set()).add(kind);
  };

  Object.values(state.path.completedAt || {}).forEach((k) => add(k, "step"));
  state.journal.forEach((e) => add(e.dayKey, "journal"));
  Object.keys(state.checkins).forEach((k) => add(k, "reading"));
  state.intake.forEach((i) => add(i.dayKey, "intake"));
  Object.entries(state.practiceLog).forEach(([k, list]) => list.length && add(k, "protocol"));
  state.recordings.forEach((r) => add(r.at?.slice(0, 10), "voice"));

  return map;
}

function runLength(sortedKeys) {
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of sortedKeys) {
    run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }
  return best;
}

export function consistency(state) {
  const byDay = activityByDay(state);
  const keys = Object.keys(byDay).sort();
  const set = new Set(keys);

  // Current streak: today doesn't have to be done yet for the run to stand.
  let current = 0;
  let cursor = new Date();
  if (!set.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  while (set.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Returns: every time you came back after three or more days away.
  let returns = 0;
  for (let i = 1; i < keys.length; i++) {
    if (daysBetween(keys[i - 1], keys[i]) >= 4) returns++;
  }

  const first = keys[0] || null;
  const span = first ? daysBetween(first, dayKey()) + 1 : 0;

  return {
    byDay,
    days: keys,
    activeDays: keys.length,
    currentStreak: current,
    longestStreak: runLength(keys),
    returns,
    firstDay: first,
    span,
    // Share of days you showed up since you started. Reported, not policed.
    rate: span ? Math.round((keys.length / span) * 100) : 0,
  };
}

/** Every stat a seal might test, in one object. */
export function sealStats(state) {
  const c = consistency(state);
  return {
    ...c,
    steps: state.path.completed.length,
    journalEntries: state.journal.length,
    readings: Object.keys(state.checkins).length,
    recordings: state.recordings.length,
    intakeLogged: state.intake.length,
    protocolsRun: state.ascentLog.length,
    manifestations: state.manifestations.length,
    goalsDone: state.goals.filter((g) => g.done).length,
    evidenceLogged: state.manifestations.reduce((a, m) => a + m.evidence.length, 0),
  };
}

export { parseDayKey };
