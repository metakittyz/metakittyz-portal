// THE VOICE — guidance spoken aloud.
//
// Uses the browser's built-in speechSynthesis. No API key, no server, works
// offline. The trade-off is honest: voice quality depends entirely on what's
// installed on the device, and a few systems ship no female voice at all. The
// picker in Settings lets you choose any voice the device has.

import { clips } from "./audio.js";
import { getAudio } from "./tts.js";
import { DEFAULT_PRESET, presetById } from "../data/voices.js";

let cachedVoices = null;
const listeners = new Set();

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Names that are female voices across macOS, iOS, Windows and Android. */
const FEMALE_NAMES = [
  "samantha", "victoria", "karen", "moira", "tessa", "fiona", "serena", "allison",
  "ava", "susan", "vicki", "kathy", "princess", "zira", "hazel", "eva", "catherine",
  "linda", "heera", "female", "woman", "aria", "jenny", "michelle", "sonia", "libby",
  "natasha", "clara", "amber", "ana", "emma", "olivia", "isha", "salli", "joanna",
  "kendra", "kimberly", "ivy", "nicole", "amy", "emily", "raveena", "aditi",
];

const MALE_NAMES = [
  "alex", "daniel", "fred", "tom", "david", "mark", "james", "george", "oliver",
  "male", "man", "guy", "aaron", "arthur", "gordon", "lee", "rishi", "ryan",
  "matthew", "brian", "justin", "joey", "russell", "diego", "miguel", "thomas",
];

/**
 * Whole-word match. Substring matching is wrong here in both directions:
 * "sa(man)tha" and "(Ana)stasia" would read as male, and "fe(male)" contains
 * "male". Names are bounded by non-letters, so anchor on those.
 */
function hasWord(haystack, word) {
  return new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, "i").test(haystack);
}

function scoreVoice(v) {
  const n = (v.name || "").toLowerCase();
  let score = 0;
  if (FEMALE_NAMES.some((f) => hasWord(n, f))) score += 100;
  if (MALE_NAMES.some((m) => hasWord(n, m))) score -= 100;
  // Explicit gender hints some engines expose in the name string.
  if (hasWord(n, "female")) score += 60;
  if (hasWord(n, "male")) score -= 60;
  if (v.localService) score += 10; // local voices don't need the network
  if ((v.lang || "").toLowerCase().startsWith("en")) score += 20;
  if (v.default) score += 2;
  return score;
}

export function getVoices() {
  if (!speechSupported()) return [];
  const list = window.speechSynthesis.getVoices() || [];
  if (list.length) cachedVoices = list;
  return cachedVoices || [];
}

/** Best available female-sounding voice, or the best fallback. */
export function pickGuideVoice(preferredURI) {
  const voices = getVoices();
  if (!voices.length) return null;
  if (preferredURI) {
    const exact = voices.find((v) => v.voiceURI === preferredURI);
    if (exact) return exact;
  }
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

export function isLikelyFemale(voice) {
  return !!voice && scoreVoice(voice) >= 100;
}

/** Voices load asynchronously in most browsers. */
export function onVoicesReady(fn) {
  if (!speechSupported()) return () => {};
  listeners.add(fn);
  const handler = () => {
    getVoices();
    listeners.forEach((l) => l());
  };
  window.speechSynthesis.addEventListener?.("voiceschanged", handler);
  if (getVoices().length) fn();
  return () => {
    listeners.delete(fn);
    window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
  };
}

// Chrome silently stops utterances longer than ~15s unless it's nudged.
let keepAlive = null;
function startKeepAlive() {
  clearInterval(keepAlive);
  keepAlive = setInterval(() => {
    const s = window.speechSynthesis;
    if (s.speaking && !s.paused) {
      s.pause();
      s.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 10000);
}

export function stopSpeaking() {
  if (!speechSupported()) return;
  clearInterval(keepAlive);
  window.speechSynthesis.cancel();
}

/**
 * Speak text with the guide voice. Cancels anything already in flight so the
 * app never talks over itself.
 */
export function speak(text, settings = {}, { onEnd } = {}) {
  if (!speechSupported() || !text) return false;
  const { voiceURI, rate = 0.92, pitch = 1.02, volume = 1 } = settings;
  stopSpeaking();

  const u = new SpeechSynthesisUtterance(String(text));
  const v = pickGuideVoice(voiceURI);
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  u.rate = rate;
  u.pitch = pitch;
  u.volume = volume;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  window.speechSynthesis.speak(u);
  startKeepAlive();
  return true;
}

/** Speak a sequence with pauses between — used for step-by-step guidance. */
export function speakLines(lines, settings = {}) {
  const text = lines.filter(Boolean).join(". … ");
  return speak(text, settings);
}

// ---------------------------------------------------------------------------
// Presets and own-voice playback
// ---------------------------------------------------------------------------

/** Resolve a preset to an actual device voice, honouring a manual override. */
export function resolvePreset(presetId, overrideURI) {
  const preset = presetById[presetId] || presetById[DEFAULT_PRESET];
  const voices = getVoices();
  if (overrideURI) {
    const exact = voices.find((v) => v.voiceURI === overrideURI);
    if (exact) return { preset, voice: exact };
  }
  // First device voice matching one of the preset's preferred names…
  for (const want of preset.prefer || []) {
    const hit = voices.find((v) => hasWord((v.name || "").toLowerCase(), want));
    if (hit) return { preset, voice: hit };
  }
  // …otherwise the best female-sounding voice available.
  return { preset, voice: pickGuideVoice() };
}

/** Turn the stored voice settings into the shape `speak` wants. */
export function settingsFor(voiceState) {
  const { preset, voice } = resolvePreset(voiceState.presetId, voiceState.voiceURI);
  return {
    voiceURI: voice?.voiceURI || "",
    rate: voiceState.rateOffset ? preset.rate + voiceState.rateOffset : preset.rate,
    pitch: voiceState.pitchOffset ? preset.pitch + voiceState.pitchOffset : preset.pitch,
    preset,
    voice,
  };
}

let currentAudio = null;

export function stopClip() {
  if (currentAudio) {
    currentAudio.pause();
    if (currentAudio.src.startsWith("blob:")) URL.revokeObjectURL(currentAudio.src);
    currentAudio = null;
  }
}

export function stopAll() {
  stopSpeaking();
  stopClip();
}

/** Play a blob through the shared audio channel. */
function playBlob(blob, onEnd) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  const done = () => {
    stopClip();
    onEnd?.();
  };
  audio.onended = done;
  audio.onerror = done;
  return audio.play().then(() => true);
}

/**
 * Speak one addressable line, in this order:
 *
 *   1. your own recording of that exact line, if you made one
 *   2. the preset's OpenAI voice, from cache or generated once and cached
 *   3. the device's speech synthesis
 *
 * Every step falls through to the next on failure, so the guide is never
 * silent — no key, no network and no microphone all still produce a voice.
 */
export async function speakLine(lineId, text, voiceState, { onEnd } = {}) {
  if (!voiceState.enabled || !text) return false;
  stopAll();

  // 1. your own voice
  if (voiceState.presetId === "own" && lineId) {
    try {
      const blob = await clips.get(`guide:${lineId}`);
      if (blob) return await playBlob(blob, onEnd);
    } catch {
      /* fall through */
    }
  }

  // 2. the natural voice
  if (voiceState.engine === "openai") {
    const preset = presetById[voiceState.presetId] || presetById[DEFAULT_PRESET];
    if (preset.openai) {
      try {
        const { blob } = await getAudio({
          presetId: preset.id,
          model: voiceState.model || "gpt-4o-mini-tts",
          text,
          voice: preset.openai.voice,
          instructions: preset.openai.instructions,
          speed: preset.openai.speed,
          apiKey: voiceState.apiKey || undefined,
        });
        return await playBlob(blob, onEnd);
      } catch (err) {
        // Deliberately quiet: a missing key or a dead network should degrade
        // to the device voice, not interrupt someone mid-practice.
        if (err?.code !== "aborted") console.info("Natural voice unavailable, using the device voice.", err?.message);
      }
    }
  }

  // 3. the device voice
  return speak(text, settingsFor(voiceState), { onEnd });
}
