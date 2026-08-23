// Procedurally generated, original ambient loop — warm pads, marimba plucks,
// soft bass and vinyl texture, in the spirit of a chill "island town" score.
// Synthesized entirely with the Web Audio API so there is no external audio
// asset to license, fetch, or ship.

const BPM = 84
const BEATS_PER_BAR = 4
const BARS_PER_LOOP = 4
const SECONDS_PER_BEAT = 60 / BPM
const EIGHTH = SECONDS_PER_BEAT / 2
const SWING = 0.12 // seconds added to every off-beat 8th for a laid-back feel
const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD = 0.12

// Chord tones (root omitted, played separately by the bass) per bar of the loop.
const CHORDS = [
  { bass: 65.41, tones: [261.63, 329.63, 392.0, 493.88, 587.33] }, // Cmaj9
  { bass: 55.0, tones: [220.0, 261.63, 329.63, 392.0, 493.88] },   // Am9
  { bass: 43.65, tones: [174.61, 220.0, 261.63, 329.63] },          // Fmaj7
  { bass: 49.0, tones: [196.0, 246.94, 293.66, 440.0] },            // G6
]

// Pentatonic-ish note pools for the pluck melody, one per chord.
const MELODY_POOLS = [
  [523.25, 587.33, 659.25, 783.99, 880.0],   // over Cmaj9
  [440.0, 523.25, 587.33, 659.25, 783.99],   // over Am9
  [349.23, 440.0, 523.25, 587.33, 698.46],   // over Fmaj7
  [392.0, 440.0, 587.33, 659.25, 739.99],    // over G6
]

let ctx = null
let master = null
let padBus = null
let leadBus = null
let started = false
let muted = false
let schedulerId = null
let nextStepTime = 0
let stepIndex = 0
let birdTimeoutId = null

const MUTE_KEY = "imag-currency:muted"

function readStoredMute() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1"
  } catch {
    return false
  }
}

function storeMute(value) {
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0")
  } catch {
    /* ignore */
  }
}

function makeNoiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function playPad(chord, when, duration) {
  chord.tones.forEach((freq, i) => {
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 950
    filter.Q.value = 0.4

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(0.045, when + 1.4)
    gain.gain.setValueAtTime(0.045, when + duration - 1.2)
    gain.gain.linearRampToValueAtTime(0, when + duration)

    ;[1, -1].forEach((detuneSign) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? "sine" : "triangle"
      osc.frequency.value = freq
      osc.detune.value = detuneSign * 4
      osc.connect(filter)
      osc.start(when)
      osc.stop(when + duration + 0.05)
    })

    filter.connect(gain)
    if (pan) {
      pan.pan.value = (i / chord.tones.length) * 1.2 - 0.6
      gain.connect(pan)
      pan.connect(padBus)
    } else {
      gain.connect(padBus)
    }
  })
}

function playBass(freq, when, duration) {
  const osc = ctx.createOscillator()
  osc.type = "sine"
  osc.frequency.value = freq
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 320
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(0.13, when + 0.3)
  gain.gain.setValueAtTime(0.13, when + duration - 0.35)
  gain.gain.linearRampToValueAtTime(0, when + duration)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  osc.start(when)
  osc.stop(when + duration + 0.05)
}

function playPluck(freq, when, velocity) {
  const osc = ctx.createOscillator()
  osc.type = "triangle"
  osc.frequency.value = freq
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 2600
  const gain = ctx.createGain()
  const peak = 0.1 * velocity
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(peak, when + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0008, when + 0.42)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(leadBus)
  osc.start(when)
  osc.stop(when + 0.5)
}

function playVinylPop(when) {
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(0.03)
  const filter = ctx.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = 1800 + Math.random() * 1200
  filter.Q.value = 3
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.05, when)
  gain.gain.exponentialRampToValueAtTime(0.0005, when + 0.03)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  src.start(when)
}

function scheduleBirdChirp() {
  if (!started) return
  const when = ctx.currentTime + 0.05
  const osc = ctx.createOscillator()
  osc.type = "sine"
  const base = 1600 + Math.random() * 900
  osc.frequency.setValueAtTime(base, when)
  osc.frequency.exponentialRampToValueAtTime(base * 1.4, when + 0.08)
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, when + 0.16)
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(0.045, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0006, when + 0.22)
  osc.connect(gain)
  if (pan) {
    pan.pan.value = Math.random() * 1.6 - 0.8
    gain.connect(pan)
    pan.connect(master)
  } else {
    gain.connect(master)
  }
  osc.start(when)
  osc.stop(when + 0.25)

  birdTimeoutId = setTimeout(scheduleBirdChirp, 14000 + Math.random() * 18000)
}

function scheduler() {
  while (nextStepTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const barInLoop = Math.floor(stepIndex / 8) % BARS_PER_LOOP
    const stepInBar = stepIndex % 8
    const chord = CHORDS[barInLoop]
    const isOffBeat = stepInBar % 2 === 1
    const t = nextStepTime + (isOffBeat ? SWING : 0)

    if (stepInBar === 0) {
      playPad(chord, t, SECONDS_PER_BEAT * BEATS_PER_BAR + SWING)
      playBass(chord.bass, t, SECONDS_PER_BEAT * BEATS_PER_BAR)
    }

    // Sparse, wandering pluck melody — not every 8th note gets a hit.
    const density = stepInBar === 0 ? 0.75 : 0.4
    if (Math.random() < density) {
      const pool = MELODY_POOLS[barInLoop]
      const note = pool[Math.floor(Math.random() * pool.length)]
      const velocity = 0.65 + Math.random() * 0.5
      playPluck(note, t, velocity)
    }

    if (Math.random() < 0.06) playVinylPop(t + Math.random() * EIGHTH)

    stepIndex += 1
    nextStepTime += EIGHTH
  }
}

function ensureContext() {
  if (ctx) return
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return
  ctx = new AudioCtx()

  master = ctx.createGain()
  master.gain.value = readStoredMute() ? 0 : 0.65
  master.connect(ctx.destination)

  padBus = ctx.createGain()
  padBus.gain.value = 1
  padBus.connect(master)

  leadBus = ctx.createGain()
  leadBus.gain.value = 1
  leadBus.connect(master)

  // Continuous soft vinyl hiss bed.
  const hiss = ctx.createBufferSource()
  hiss.buffer = makeNoiseBuffer(2)
  hiss.loop = true
  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = "highpass"
  hissFilter.frequency.value = 4000
  const hissGain = ctx.createGain()
  hissGain.gain.value = 0.012
  hiss.connect(hissFilter)
  hissFilter.connect(hissGain)
  hissGain.connect(master)
  hiss.start()

  muted = readStoredMute()
}

export function startLoFiMusic() {
  ensureContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()
  if (started) return
  started = true
  stepIndex = 0
  nextStepTime = ctx.currentTime + 0.1
  schedulerId = setInterval(scheduler, LOOKAHEAD_MS)
  birdTimeoutId = setTimeout(scheduleBirdChirp, 9000 + Math.random() * 10000)
}

export function stopLoFiMusic() {
  started = false
  if (schedulerId) clearInterval(schedulerId)
  if (birdTimeoutId) clearTimeout(birdTimeoutId)
  schedulerId = null
  birdTimeoutId = null
}

export function setMusicMuted(next) {
  muted = next
  storeMute(next)
  if (master && ctx) {
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(next ? 0 : 0.65, now + 0.25)
  }
  return muted
}

export function toggleLoFiMusicMuted() {
  return setMusicMuted(!muted)
}

export function getLoFiMusicMuted() {
  return ctx ? muted : readStoredMute()
}
