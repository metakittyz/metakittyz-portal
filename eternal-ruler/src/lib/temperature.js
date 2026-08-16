// The Hot & Cold system — the signature mechanic of Eternal Ruler.
//
// For any domain of your life you log two numbers:
//   self   (0-100) — how *you* feel about it right now
//   higher (0-100) — how you believe your *higher self* feels about it
//
// The number that matters most is neither of those. It's the GAP between them.
// A gap is not a failure; it's a direction. Where your higher self runs hotter
// than you do, something is calling. Where you run hotter than your higher self,
// something may be gripping you that isn't actually yours.

export const BANDS = [
  { max: 19, name: "Frozen", note: "Shut down." },
  { max: 39, name: "Cold", note: "Going through the motions." },
  { max: 59, name: "Cool", note: "Present but unlit." },
  { max: 79, name: "Warm", note: "Something's moving." },
  { max: 100, name: "Blazing", note: "Fully on." },
];

export function band(value) {
  return BANDS.find((b) => value <= b.max) || BANDS[BANDS.length - 1];
}

/** Maps 0-100 onto the frost→ember spectrum. */
export function tempColor(value) {
  const t = Math.max(0, Math.min(100, value)) / 100;
  // frost #5ec8ff → violet midpoint #9d7bf5 → ember #ff6a3d
  const stops = [
    [94, 200, 255],
    [157, 123, 245],
    [255, 106, 61],
  ];
  const seg = t < 0.5 ? 0 : 1;
  const local = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const [a, b] = [stops[seg], stops[seg + 1]];
  const ch = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

export const VERDICTS = {
  calling: {
    key: "calling",
    label: "A Calling",
    tone: "ember",
    blurb: "Your higher self runs hotter here. Not a scolding — an invitation.",
  },
  overreach: {
    key: "overreach",
    label: "Overreach",
    tone: "ember-cool",
    blurb: "You run hotter than your higher self. Usually want, not purpose. Whose fire is this?",
  },
  strength: {
    key: "strength",
    label: "Strength",
    tone: "gold",
    blurb: "Both lit. A pillar. Anchor here when other domains go cold.",
  },
  numb: {
    key: "numb",
    label: "The Numb Zone",
    tone: "frost",
    blurb: "You agree, and you agree on cold. Either it isn't yours, or it's frozen deep.",
  },
  steady: {
    key: "steady",
    label: "Steady",
    tone: "neutral",
    blurb: "Fine. Not everything has to be a threshold.",
  },
};

/** Returns { gap, alignment, verdict, magnitude } for one reading. */
export function readGap(self, higher) {
  const gap = higher - self;
  const alignment = 100 - Math.abs(gap);
  const magnitude = Math.abs(gap);

  let verdict;
  if (gap >= 25) verdict = VERDICTS.calling;
  else if (gap <= -25) verdict = VERDICTS.overreach;
  else if (self >= 60 && higher >= 60) verdict = VERDICTS.strength;
  else if (self <= 40 && higher <= 40) verdict = VERDICTS.numb;
  else verdict = VERDICTS.steady;

  return { gap, alignment, magnitude, verdict };
}

/**
 * Rolls up a full check-in (a map of domainId -> {self, higher}) into a summary.
 * `widest` is the single domain most worth your attention today.
 */
export function summarize(readings) {
  const rows = Object.entries(readings).map(([id, r]) => ({
    id,
    ...r,
    ...readGap(r.self, r.higher),
  }));
  if (!rows.length) {
    return { rows: [], avgSelf: 0, avgHigher: 0, alignment: 0, widest: null, strengths: [], callings: [] };
  }
  const avgSelf = rows.reduce((a, r) => a + r.self, 0) / rows.length;
  const avgHigher = rows.reduce((a, r) => a + r.higher, 0) / rows.length;
  const alignment = rows.reduce((a, r) => a + r.alignment, 0) / rows.length;
  const sorted = [...rows].sort((a, b) => b.magnitude - a.magnitude);
  return {
    rows,
    avgSelf,
    avgHigher,
    alignment,
    widest: sorted[0],
    strengths: rows.filter((r) => r.verdict.key === "strength"),
    callings: rows.filter((r) => r.verdict.key === "calling"),
  };
}
