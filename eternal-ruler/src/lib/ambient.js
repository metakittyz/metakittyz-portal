// THE SCORE — composed live in the browser.
//
// Written in the idiom of slow cinematic minimalism: a church-organ stack, a
// relentless eighth-note ostinato turning under it, sub-bass for weight, and a
// swell that takes over a minute to arrive. Original throughout — the harmony
// and the figures below are generated here and no existing recording or
// composition is reproduced. What is borrowed is the *grammar*, which is not
// anybody's property: a minor cell, a pedal that refuses to move, and dynamics
// doing the emotional work rather than melody.
//
// Four reasons it is synthesised rather than shipped as a file:
//
//   · Original by construction. Nothing to license, nothing to take down.
//   · No audible loop. The 18-second harmonic cycle sits under a 72-second
//     intensity arc, so the same bar returns at a different weight each time
//     and there is no seam to start listening for.
//   · A few kilobytes instead of megabytes, and it works offline.
//   · It can get out of the way. When the guide speaks, the whole thing ducks.
//
// ---------------------------------------------------------------------------
// The one structural rule, learned by breaking it: everything audible passes
// through `master`. The reverb send folds back into it rather than running
// alongside. Alongside, the wet tail escapes the volume slider entirely —
// switching the score off leaves it ringing for seconds, and ducking under the
// guide only ducks the dry signal.
//
//   notes ─┬──────────────────────► master ─► shade ─► duck ─► out
//          └─ send ─► convolver ──┘
// ---------------------------------------------------------------------------

// Loud enough to be a score. The first pass peaked at 0.048 even with the
// slider at maximum, which is a whisper — fine for a bed under an app, wrong
// for something meant to carry an intro.
const MASTER_CEILING = 0.5;

const EIGHTH = 0.28;
const BAR = EIGHTH * 8;
const CYCLE = BAR * 8; // 8 bars ≈ 17.9s
const ARC = CYCLE * 4; // the swell: ≈ 72s up and back down

/**
 * Eight bars in D minor with a pedal that keeps refusing to resolve, then
 * lifts on the last two. Bass note, then the tones the ostinato climbs.
 */
const PROGRESSION = [
  { bass: 38, tones: [62, 65, 69, 74] }, // Dm
  { bass: 36, tones: [60, 65, 69, 74] }, // Dm/C
  { bass: 34, tones: [58, 62, 65, 70] }, // B♭
  { bass: 41, tones: [60, 65, 69, 72] }, // F
  { bass: 43, tones: [62, 67, 70, 74] }, // Gm
  { bass: 45, tones: [57, 60, 65, 69] }, // F/A
  { bass: 34, tones: [58, 62, 65, 70] }, // B♭
  { bass: 48, tones: [60, 64, 67, 72] }, // C — the lift
];

// Eight eighths, up and turning back. Relentless is the point: the figure
// never arrives anywhere, which is what makes the swell over the top of it
// feel like it does.
const FIGURE = [0, 1, 2, 3, 2, 3, 1, 2];

// A four-note theme, held long, only once the score has earned it.
const THEME = [74, 77, 81, 79];

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

let ctx = null;
let master = null;
let duckGain = null;
let send = null;
let shade = null;
let timer = null;
let bar = 0;
let nextBarAt = 0;
let startClock = 0;
let volume = 0.5;
let running = false;
let armed = false;
let wanted = false;

const watchers = new Set();
const announce = () => watchers.forEach((fn) => fn(running));

export function onMusicChange(fn) {
  watchers.add(fn);
  return () => watchers.delete(fn);
}
export const isPlaying = () => running;
export function musicSupported() {
  return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
}

/** Exponentially decaying noise — a large, cheap hall. */
function buildReverb(seconds = 4.6, decay = 2.2) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  const node = ctx.createConvolver();
  node.buffer = buf;
  return node;
}

function buildGraph() {
  master = ctx.createGain();
  master.gain.value = volume * MASTER_CEILING;

  duckGain = ctx.createGain();
  duckGain.gain.value = 1;

  shade = ctx.createBiquadFilter();
  shade.type = "lowpass";
  shade.frequency.value = 6200;

  send = ctx.createGain();
  send.gain.value = 0.5;
  const conv = buildReverb();

  send.connect(conv);
  conv.connect(master);
  master.connect(shade);
  shade.connect(duckGain);
  duckGain.connect(ctx.destination);
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  buildGraph();
}

/**
 * Render the score to an AudioBuffer without playing it.
 *
 * This exists because a score you cannot hear cannot be judged, and the person
 * asking for changes to it is not always in front of the browser. Same graph,
 * same scheduler, rendered offline — so what comes out of here is what comes
 * out of the speakers, not an approximation of it.
 */
export async function renderOffline(seconds, sampleRate = 44100) {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OAC) throw new Error("No OfflineAudioContext");

  const keep = { ctx, master, duckGain, send, shade };
  ctx = new OAC(2, Math.ceil(seconds * sampleRate), sampleRate);
  buildGraph();
  master.gain.value = MASTER_CEILING;

  for (let i = 0; i * BAR < seconds; i++) scheduleBar(i, i * BAR);

  try {
    return await ctx.startRendering();
  } finally {
    // Put the live graph back exactly as it was; rendering must not disturb
    // a score that happens to be playing.
    ({ ctx, master, duckGain, send, shade } = keep);
  }
}

function wire(node, at, seconds) {
  node.connect(master);
  node.connect(send);
  return node;
}

/**
 * The organ. Additive — a fundamental plus the harmonics a drawbar stack
 * pulls, which is what gives it that hollow, churchy weight a single sawtooth
 * never gets near.
 */
const DRAWBARS = [
  [1, 1.0],
  [2, 0.5],
  [3, 0.34],
  [4, 0.22],
  [6, 0.12],
  [8, 0.07],
];

function organ(at, midi, level, seconds, { bright = 1600 } = {}) {
  const f = hz(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + 0.035);
  g.gain.setValueAtTime(level, at + seconds * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(bright, at);
  lp.frequency.exponentialRampToValueAtTime(Math.max(220, bright * 0.4), at + seconds);

  const mix = ctx.createGain();
  mix.gain.value = 0.34;

  for (const [mult, amp] of DRAWBARS) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * mult;
    // A couple of cents out on the upper partials. Perfectly tuned harmonics
    // are most of what makes additive synthesis sound like plastic.
    o.detune.value = mult > 2 ? (mult % 2 ? 3 : -3) : 0;
    const a = ctx.createGain();
    a.gain.value = amp;
    o.connect(a);
    a.connect(mix);
    o.start(at);
    o.stop(at + seconds + 0.15);
  }
  mix.connect(lp);
  lp.connect(g);
  wire(g);
}

/** The string bed: detuned saws, slow in, slow out, always overlapping. */
function strings(at, midi, level, seconds) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + seconds * 0.4);
  g.gain.linearRampToValueAtTime(0.0001, at + seconds);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(320, at);
  lp.frequency.linearRampToValueAtTime(900 + level * 1400, at + seconds * 0.5);
  lp.frequency.linearRampToValueAtTime(320, at + seconds);

  const mix = ctx.createGain();
  const voices = [0, 7, 12, 19];
  mix.gain.value = 1 / (voices.length * 2);
  for (const iv of voices) {
    for (const cents of [-5, 5]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = hz(midi + iv);
      o.detune.value = cents;
      o.connect(mix);
      o.start(at);
      o.stop(at + seconds + 0.2);
    }
  }
  mix.connect(lp);
  lp.connect(g);
  wire(g);
}

/** Sub. Felt more than heard, and only once the score is up. */
function sub(at, midi, level, seconds) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + 0.18);
  g.gain.linearRampToValueAtTime(0.0001, at + seconds);
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = hz(midi - 12);
  o.connect(g);
  o.start(at);
  o.stop(at + seconds + 0.1);
  g.connect(master); // no reverb on the sub — it only muddies
}

/**
 * How big the score is right now: a slow raised cosine over 72 seconds, so it
 * arrives and recedes rather than sitting at one level. This is where the
 * emotion lives. Melody is nearly static; the dynamics do the work.
 */
function intensityAt(seconds) {
  const arc = 0.5 - 0.5 * Math.cos((seconds / ARC) * TAU);
  return 0.3 + 0.7 * arc;
}

function scheduleBar(index, at) {
  const chord = PROGRESSION[index % PROGRESSION.length];
  const I = intensityAt(index * BAR);

  // ---- balance -----------------------------------------------------------
  // The mix is the whole difference between a score and a rumble. First pass
  // had the ostinato eight times quieter than the pad and sub, which left the
  // spectrum with nothing above 300Hz — all weight, no music. The ostinato is
  // the driving element in this idiom and has to sit on top of the bed, not
  // under it.

  // The bed is always there.
  strings(at, chord.bass, 0.09 + I * 0.13, BAR * 1.08);

  // Organ pad from the start, opening up as the score grows.
  organ(at, chord.bass + 12, 0.035 + I * 0.055, BAR * 1.05, { bright: 900 + I * 2200 });

  // The ostinato fades in once there is something to turn under.
  if (I > 0.34) {
    const drive = Math.min(1, (I - 0.34) / 0.35);
    FIGURE.forEach((step, i) => {
      const drift = (Math.random() - 0.5) * 0.016;
      const accent = i === 0 ? 1 : i === 4 ? 0.88 : 0.66;
      organ(at + i * EIGHTH + drift, chord.tones[step], 0.21 * accent * drive, EIGHTH * 2.4, {
        bright: 2200 + I * 3200,
      });
    });
  }

  // Weight underneath, only in the upper half of the arc. Kept in check — sub
  // is felt, and past a certain level it just masks everything above it.
  if (I > 0.55) sub(at, chord.bass, (I - 0.55) * 0.26, BAR);

  // And the theme last of all — the thing the whole swell was for. Long notes
  // over the second half of the cycle, where the harmony lifts.
  if (I > 0.7 && index % 8 >= 4) {
    const note = THEME[(index % 8) - 4];
    organ(at, note, (I - 0.7) * 0.75, BAR * 1.6, { bright: 3400 });
  }
}

// setInterval is far too jittery to place notes with. It only ever asks "is
// another bar due soon?"; the answer is written on ctx.currentTime.
function tick() {
  if (!running) return;
  while (nextBarAt < ctx.currentTime + 1.5) {
    scheduleBar(bar, nextBarAt);
    bar++;
    nextBarAt += BAR;
  }
  // Keep the top end moving with the arc, so swells open rather than just
  // getting louder.
  const I = intensityAt((ctx.currentTime - startClock) % ARC);
  shade.frequency.setTargetAtTime(4200 + I * 6000, ctx.currentTime, 0.6);
}

export async function startMusic() {
  if (!musicSupported() || running) return false;
  if (!ctx) build();
  try {
    await ctx.resume();
  } catch {
    return false;
  }
  if (ctx.state !== "running") return false; // still waiting on a gesture

  running = true;
  bar = 0;
  startClock = ctx.currentTime;
  nextBarAt = ctx.currentTime + 0.3;
  setVolume(volume);
  tick();
  timer = setInterval(tick, 250);
  announce();
  return true;
}

export function stopMusic() {
  running = false;
  clearInterval(timer);
  timer = null;
  if (master && ctx) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 1.4);
  }
  announce();
}

export function setVolume(next) {
  volume = Math.max(0, Math.min(1, next));
  if (master && running && ctx) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, volume * MASTER_CEILING), now + 0.3);
  }
}

/**
 * Pull the score down under the guide. The voice is the point; a cinematic
 * score is exactly the thing that would fight it, so this ducks harder than a
 * quiet bed would need to.
 */
export function duckMusic(on) {
  if (!duckGain || !ctx) return;
  const now = ctx.currentTime;
  duckGain.gain.cancelScheduledValues(now);
  duckGain.gain.setValueAtTime(duckGain.gain.value, now);
  // Out of the way before the first syllable; back slowly enough that the
  // return is never the thing you notice.
  // A third, not a whisper. Crushing a score to 13% under narration is what
  // makes an intro feel like a slideshow with a soundtrack bug; film ducks
  // dialogue against music at roughly this depth and the music stays present.
  duckGain.gain.linearRampToValueAtTime(on ? 0.32 : 1, now + (on ? 0.3 : 1.8));
}

// ---------------------------------------------------------------------------
// Wanting to play and being allowed to play are different things. Browsers
// discard audio started before the page has been touched, so the setting is
// recorded here and the next gesture of any kind honours it.
// ---------------------------------------------------------------------------

export function setWanted(on) {
  wanted = on;
  if (on) return startMusic();
  stopMusic();
  return Promise.resolve(false);
}

export function installGestureStart() {
  if (armed || !musicSupported()) return () => {};
  armed = true;
  const go = () => {
    if (wanted && !running) startMusic();
  };
  // Left installed rather than removed after the first hit: the setting can be
  // switched on again later, and that gesture has to count too.
  window.addEventListener("pointerdown", go);
  window.addEventListener("keydown", go);
  return () => {
    armed = false;
    window.removeEventListener("pointerdown", go);
    window.removeEventListener("keydown", go);
  };
}

// Exposed for tests: the shape of the swell, without needing an audio context.
export const _internals = { intensityAt, PROGRESSION, FIGURE, THEME, ARC, CYCLE, BAR };
