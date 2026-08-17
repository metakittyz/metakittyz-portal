// AMBIENT — a faint score that plays under the app.
//
// Composed live in the browser with Web Audio rather than shipped as an audio
// file. Four reasons, in order of how much they mattered:
//
//   · It is original. The writing sits in the register those slow
//     piano-and-strings pieces live in — a minor-key ostinato turning under a
//     sustained string pad — but every note is generated from the progression
//     below. No existing recording or composition is reproduced, so there is
//     nothing to license and nothing to take down.
//   · It never loops audibly. The phrase is re-voiced as it plays, with the
//     melody entering and dropping out on a longer cycle than the harmony, so
//     there is no seam to start listening for.
//   · It adds nothing to the download. A twenty-minute bed as audio would be
//     several megabytes; this is a few kilobytes of arithmetic.
//   · It can get out of the way. When the guide speaks, the whole bed ducks in
//     half a second and comes back afterwards.
//
// Everything is deliberately quiet. MASTER_CEILING is the loudest this can go
// with the volume slider at maximum, and it is set low on purpose: this is
// meant to be noticed only when it stops.

const MASTER_CEILING = 0.16;

const EIGHTH = 0.62; // seconds — about 58bpm in a slow six
const BAR = EIGHTH * 6;
const BARS_PER_CHORD = 2;

// i – VI – III – VII in D minor. Bass note, then the chord tones the ostinato
// climbs through, as MIDI numbers.
const PROGRESSION = [
  { bass: 50, tones: [62, 65, 69, 74] }, // Dm
  { bass: 46, tones: [58, 62, 65, 70] }, // B♭
  { bass: 41, tones: [60, 65, 69, 72] }, // F
  { bass: 48, tones: [60, 64, 67, 72] }, // C
];

// Up and back down — the shape both of those pieces lean on, and the reason
// the figure feels like breathing rather than counting.
const FIGURE = [0, 1, 2, 3, 2, 1];

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

let ctx = null;
let master = null; // volume slider
let duckGain = null; // pulled down while the guide speaks
let verb = null;
let timer = null;
let bar = 0;
let nextBarAt = 0;
let volume = 0.5;
let running = false;
let armed = false;

const watchers = new Set();
function announce() {
  watchers.forEach((fn) => fn(running));
}

export function onMusicChange(fn) {
  watchers.add(fn);
  return () => watchers.delete(fn);
}

export function isPlaying() {
  return running;
}

export function musicSupported() {
  return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
}

/** Exponentially decaying noise — a cheap, convincing hall. */
function buildReverb(seconds = 3.4, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  const node = ctx.createConvolver();
  node.buffer = buf;
  return node;
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = volume * MASTER_CEILING;

  duckGain = ctx.createGain();
  duckGain.gain.value = 1;

  // Nothing above 5kHz. Removing the top end is most of what separates
  // "underscore" from "something playing in the room".
  const shade = ctx.createBiquadFilter();
  shade.type = "lowpass";
  shade.frequency.value = 5000;

  verb = ctx.createGain();
  verb.gain.value = 0.42;
  const conv = buildReverb();

  // The wet path folds back into `master` rather than running alongside it.
  // Alongside, the reverb tail escapes the volume slider entirely: turning the
  // score off leaves it ringing for several seconds, and ducking under the
  // guide only ducks the dry signal. Everything audible has to pass through
  // one gain, or none of the controls mean what they say.
  //
  //   notes ─┬─────────────────────► master ─► shade ─► duck ─► out
  //          └─ verb ─► convolver ─┘
  verb.connect(conv);
  conv.connect(master);
  master.connect(shade);
  shade.connect(duckGain);
  duckGain.connect(ctx.destination);
}

/** One struck note. Fast on, long decay, a second partial slightly out of tune. */
function strike(at, midi, level, decay = 3.4) {
  const f = hz(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(2600, at);
  lp.frequency.exponentialRampToValueAtTime(700, at + decay);

  const a = ctx.createOscillator();
  a.type = "triangle";
  a.frequency.value = f;

  // Detuned by two cents against the fundamental. Perfectly tuned partials are
  // most of what makes synthesised piano sound like plastic.
  const b = ctx.createOscillator();
  b.type = "sine";
  b.frequency.value = f * 2.002;
  const bg = ctx.createGain();
  bg.gain.value = 0.3;

  a.connect(lp);
  b.connect(bg);
  bg.connect(lp);
  lp.connect(g);
  g.connect(master);
  g.connect(verb);

  a.start(at);
  b.start(at);
  a.stop(at + decay + 0.1);
  b.stop(at + decay + 0.1);
}

/** The held string bed under a chord. Slow in, slow out, always overlapping. */
function pad(at, midi, seconds) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(0.075, at + seconds * 0.45);
  g.gain.linearRampToValueAtTime(0.0001, at + seconds);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(340, at);
  lp.frequency.linearRampToValueAtTime(720, at + seconds * 0.5);
  lp.frequency.linearRampToValueAtTime(340, at + seconds);

  const oscs = [0, 7, 12].flatMap((interval, i) =>
    [-4, 4].map((cents) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? "triangle" : "sawtooth";
      o.frequency.value = hz(midi + interval);
      o.detune.value = cents;
      return o;
    })
  );

  const mix = ctx.createGain();
  mix.gain.value = 1 / oscs.length;
  oscs.forEach((o) => {
    o.connect(mix);
    o.start(at);
    o.stop(at + seconds + 0.2);
  });
  mix.connect(lp);
  lp.connect(g);
  g.connect(master);
  g.connect(verb);
}

/**
 * Lay down one bar. Called ahead of time by the scheduler — `at` is a moment in
 * the future on the audio clock, never "now".
 */
function scheduleBar(index, at) {
  const chord = PROGRESSION[Math.floor(index / BARS_PER_CHORD) % PROGRESSION.length];
  const first = index % BARS_PER_CHORD === 0;

  if (first) pad(at, chord.bass, BAR * BARS_PER_CHORD);

  FIGURE.forEach((step, i) => {
    // A few milliseconds either side of the beat, and a little unevenness in
    // weight. Both references are played by hands; dead-on timing is the
    // giveaway that this isn't.
    const drift = (Math.random() - 0.5) * 0.022;
    const accent = i === 0 ? 0.105 : i === 3 ? 0.085 : 0.062;
    const level = accent * (0.88 + Math.random() * 0.24);
    strike(at + i * EIGHTH + drift, chord.tones[step], level);
  });

  // The melody comes and goes on a sixteen-bar cycle, well out of step with the
  // eight-bar harmony, so the two rarely line up the same way twice.
  const phrase = index % 16;
  if (phrase === 4 || phrase === 11) {
    strike(at + EIGHTH * 2, chord.tones[3] + 12, 0.05, 6.5);
  } else if (phrase === 8) {
    strike(at + EIGHTH * 1, chord.tones[1] + 12, 0.045, 6.5);
    strike(at + EIGHTH * 4, chord.tones[2] + 12, 0.038, 6.5);
  }
}

// Timer-driven scheduling against the audio clock. setInterval alone is far too
// jittery to place notes with; it is only ever used to ask "is another bar due
// soon?", and the answer is written on ctx.currentTime.
function tick() {
  if (!running) return;
  while (nextBarAt < ctx.currentTime + 1.5) {
    scheduleBar(bar, nextBarAt);
    bar++;
    nextBarAt += BAR;
  }
}

export async function startMusic() {
  if (!musicSupported() || running) return false;
  if (!ctx) build();
  try {
    await ctx.resume();
  } catch {
    return false;
  }
  // A suspended context means the browser is still waiting for a gesture.
  if (ctx.state !== "running") return false;

  running = true;
  bar = 0;
  nextBarAt = ctx.currentTime + 0.25;
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
  if (master) {
    // Ride it down rather than cutting, and let scheduled notes ring out.
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 1.2);
  }
  announce();
}

export function setVolume(next) {
  volume = Math.max(0, Math.min(1, next));
  if (master && running) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, volume * MASTER_CEILING), now + 0.3);
  }
}

/**
 * Pull the bed down under the guide. The voice is the point; the music is not
 * allowed to compete with it for a single line.
 */
export function duckMusic(on) {
  if (!duckGain || !ctx) return;
  const now = ctx.currentTime;
  duckGain.gain.cancelScheduledValues(now);
  duckGain.gain.setValueAtTime(duckGain.gain.value, now);
  // Down fast so it is already out of the way by the first syllable, back up
  // slowly so the return is never the thing you notice.
  duckGain.gain.linearRampToValueAtTime(on ? 0.18 : 1, now + (on ? 0.35 : 1.6));
}

// ---------------------------------------------------------------------------
// Wanting to play and being allowed to play are different things. Browsers
// refuse to start audio until the page has been interacted with, and silently
// discard the attempt if you ask too early — so the setting is recorded here,
// and the next gesture of any kind honours it.
// ---------------------------------------------------------------------------

let wanted = false;

/** Turn the score on or off. Safe to call before the page has been touched. */
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
  // switched on again later from a keyboard, and that gesture has to count too.
  window.addEventListener("pointerdown", go);
  window.addEventListener("keydown", go);
  return () => {
    armed = false;
    window.removeEventListener("pointerdown", go);
    window.removeEventListener("keydown", go);
  };
}
