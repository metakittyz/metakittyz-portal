// A recorded track, for the places where the generated score isn't the point.
//
// The Overture opens with "The Awakening" rather than the synthesised score.
// The score is built to sit under an app indefinitely without repeating; the
// intro is ninety seconds with a shape of its own, and a real recording holds
// that better than anything generated bar by bar can.
//
// Plain HTMLAudioElement rather than Web Audio. All this needs is play, loop,
// fade and duck, and an audio element does those with far fewer moving parts
// than a graph — and it streams, so playback starts before the whole file has
// arrived.

export const AWAKENING = "the-awakening.mp3";

/** Respect a base path, so a deploy under a subdirectory still finds it. */
function url(name) {
  const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
  return `${base.replace(/\/$/, "")}/${name}`;
}

let el = null;
let fade = null;
let target = 0; // where the volume is heading
let level = 0.55; // the un-ducked ceiling
let ducked = false;

function ramp(to, seconds) {
  target = to;
  cancelAnimationFrame(fade);
  if (!el) return;
  const from = el.volume;
  const t0 = performance.now();
  const step = (now) => {
    if (!el) return;
    const p = Math.min(1, (now - t0) / (seconds * 1000));
    el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
    if (p < 1) fade = requestAnimationFrame(step);
    else if (to === 0) el.pause();
  };
  fade = requestAnimationFrame(step);
}

function want() {
  return ducked ? level * 0.3 : level;
}

/**
 * Start the track. Must be called from a user gesture — same browser rule the
 * Overture's title card exists to satisfy.
 *
 * Resolves false if it can't play, so the caller can fall back to the
 * generated score rather than running the intro in silence.
 */
export async function playTrack(name = AWAKENING, { volume = 0.55, loop = true } = {}) {
  level = volume;
  if (!el) {
    el = new Audio(url(name));
    el.loop = loop;
    el.preload = "auto";
  }
  el.volume = 0;
  try {
    await el.play();
  } catch {
    return false; // blocked, missing, or undecodable — the caller decides
  }
  ramp(want(), 2.5);
  return true;
}

export function stopTrack(seconds = 2) {
  if (!el) return;
  ramp(0, seconds);
}

export function isTrackPlaying() {
  return !!el && !el.paused;
}

export function setTrackVolume(v) {
  level = Math.max(0, Math.min(1, v));
  if (el && !el.paused) ramp(want(), 0.3);
}

/** Down under the guide, like everything else here that makes noise. */
export function duckTrack(on) {
  ducked = on;
  if (el && !el.paused) ramp(want(), on ? 0.35 : 1.6);
}

/** Free the element entirely — used when leaving the intro for good. */
export function releaseTrack() {
  cancelAnimationFrame(fade);
  if (el) {
    el.pause();
    el.src = "";
    el = null;
  }
  ducked = false;
}
