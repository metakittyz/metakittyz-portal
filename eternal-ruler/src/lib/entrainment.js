// THE CARRIER — a frequency actually transmitted under the meditations.
//
// Two real techniques, both of which physically exist and can be measured
// coming out of the speakers. Neither is folklore, and this file is careful
// about which is which.
//
//   BINAURAL — a tone at `carrier` in one ear and `carrier + beat` in the
//   other. Each ear hears a steady pitch; the brainstem, comparing them,
//   produces a perceived pulse at the difference. A 200Hz left and 206Hz right
//   is heard as a 6Hz throb that is not present in either channel. This is a
//   genuine auditory phenomenon, described since 1839, and it needs headphones
//   — over speakers the two tones mix in the air and the effect disappears.
//
//   ISOCHRONIC — one tone switched on and off at the beat rate. Cruder, more
//   obvious, and it works on speakers because the pulse is really in the
//   signal rather than assembled in your head. The fallback when headphones
//   aren't on.
//
// The schedule descends from alpha into theta: 10Hz down to 6Hz over three
// minutes, then holds. That direction is the whole idea — alpha is the relaxed
// waking band, theta the drowsy, hypnagogic, imagery-rich one that meditative
// and receptive states sit in.
//
// ---------------------------------------------------------------------------
// WHAT THE EVIDENCE ACTUALLY SAYS, because this app labels its claims:
//
// That the tone exists and that you hear a beat — certain, it is physics.
// That listening nudges EEG toward the driven frequency — some support,
// modest effect sizes, inconsistent between studies. That it reliably opens
// intuition — not established. Nobody has shown that, and this file is not
// going to imply it.
//
// So: `evidence: "mixed"`, which is what the UI displays. It is a real tool
// with real but modest support, offered as a nudge and not as a mechanism.
// Solfeggio numbers, 528Hz "miracle" tones and the rest are absent on purpose
// — those are 1970s invention with nothing behind them, and putting them next
// to binaural beats would launder one with the other.
// ---------------------------------------------------------------------------

export const CARRIER = 200; // Hz — binaural beats work best roughly 200–400Hz

export const SCHEDULE = [
  { at: 0, beat: 10 }, // alpha — relaxed, eyes closed
  { at: 90, beat: 8 }, // the alpha/theta border
  { at: 180, beat: 6 }, // theta — drowsy, imagery, the receptive band
];

export const ENTRAINMENT_EVIDENCE = "mixed";

let ctx = null;
let master = null;
let duck = null;
let nodes = null;
let mode = "binaural";
let running = false;
let startedAt = 0;

export function entrainmentSupported() {
  return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
}

export const isEntraining = () => running;

/** The beat rate at a given number of seconds in, interpolated between steps. */
export function beatAt(seconds) {
  if (seconds <= SCHEDULE[0].at) return SCHEDULE[0].beat;
  for (let i = 1; i < SCHEDULE.length; i++) {
    const a = SCHEDULE[i - 1];
    const b = SCHEDULE[i];
    if (seconds <= b.at) {
      const t = (seconds - a.at) / (b.at - a.at);
      return a.beat + (b.beat - a.beat) * t;
    }
  }
  return SCHEDULE[SCHEDULE.length - 1].beat;
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0;

  duck = ctx.createGain();
  duck.gain.value = 1;

  master.connect(duck);
  duck.connect(ctx.destination);
}

function teardown() {
  if (!nodes) return;
  nodes.stop.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  });
  nodes = null;
}

/**
 * Start the carrier. `level` is 0–1 and stays deliberately low: this sits
 * underneath a voice and a score, and a loud entrainment tone is just an
 * annoying hum.
 */
export async function startEntrainment(which = "binaural", level = 0.5) {
  if (!entrainmentSupported()) return false;
  stopEntrainment();
  if (!ctx) build();
  try {
    await ctx.resume();
  } catch {
    return false;
  }
  if (ctx.state !== "running") return false;

  mode = which;
  const now = ctx.currentTime;
  const stop = [];

  if (which === "binaural") {
    // One tone per ear, hard-panned. Merged rather than panned so the
    // separation is absolute — a channel bleed of a few percent is enough to
    // start cancelling the effect.
    const merger = ctx.createChannelMerger(2);
    [0, 1].forEach((ch) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = CARRIER + (ch === 1 ? beatAt(0) : 0);
      o.connect(merger, 0, ch);
      o.start(now);
      stop.push(o);
      if (ch === 1) nodes = { ...(nodes || {}), right: o };
    });
    merger.connect(master);
    nodes = { ...(nodes || {}), stop };
  } else {
    // Isochronic: one tone, gated. The pulse is in the signal itself, so it
    // survives being played on a phone speaker.
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = CARRIER * 2; // a touch brighter so the gating reads
    const gate = ctx.createGain();
    gate.gain.value = 0;
    o.connect(gate);
    gate.connect(master);
    o.start(now);
    stop.push(o);
    nodes = { gate, stop };
  }

  running = true;
  startedAt = ctx.currentTime;
  // Fade in over four seconds. A tone that simply appears is startling, which
  // is the opposite of the job.
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(level * 0.035, now + 4);

  schedule();
  return true;
}

let ticker = null;
function schedule() {
  clearInterval(ticker);
  ticker = setInterval(() => {
    if (!running || !ctx) return;
    const secs = ctx.currentTime - startedAt;
    const beat = beatAt(secs);

    if (mode === "binaural" && nodes?.right) {
      nodes.right.frequency.setTargetAtTime(CARRIER + beat, ctx.currentTime, 0.5);
    } else if (nodes?.gate) {
      // Rewrite the gate envelope a second at a time: a square edge clicks, so
      // each pulse gets a short ramp up and down instead.
      const g = nodes.gate.gain;
      const period = 1 / beat;
      g.cancelScheduledValues(ctx.currentTime);
      for (let t = 0; t < 1; t += period) {
        const at = ctx.currentTime + t;
        g.setValueAtTime(0.0001, at);
        g.linearRampToValueAtTime(1, at + period * 0.2);
        g.linearRampToValueAtTime(0.0001, at + period * 0.5);
      }
    }
  }, 900);
}

export function stopEntrainment() {
  clearInterval(ticker);
  ticker = null;
  if (!ctx || !master) {
    running = false;
    return;
  }
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0.0001, now + 1.5);
  const dying = nodes;
  setTimeout(() => {
    if (nodes === dying) teardown();
  }, 1700);
  running = false;
}

export function setEntrainmentLevel(level) {
  if (!master || !ctx) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(Math.max(0.0001, level * 0.035), now + 0.4);
}

/** Down under the guide's voice, like everything else that makes noise here. */
export function duckEntrainment(on) {
  if (!duck || !ctx) return;
  const now = ctx.currentTime;
  duck.gain.cancelScheduledValues(now);
  duck.gain.setValueAtTime(duck.gain.value, now);
  duck.gain.linearRampToValueAtTime(on ? 0.45 : 1, now + (on ? 0.3 : 1.2));
}

/** Seconds elapsed, for the UI to show which band it has reached. */
export function elapsed() {
  return ctx && running ? ctx.currentTime - startedAt : 0;
}

export function bandName(beat) {
  if (beat >= 12) return "beta";
  if (beat >= 8) return "alpha";
  if (beat >= 4) return "theta";
  return "delta";
}
