// OpenAI text-to-speech, cached.
//
// The cache is the whole design. Every generated line is stored in IndexedDB
// keyed by (preset, model, text), so:
//   · each line is paid for exactly once, ever
//   · the second play is instant, with no network round-trip
//   · once a protocol is prewarmed it runs fully offline
//
// If anything fails — no key, no network, an API error — the caller falls back
// to the device voice. The guide is never silent because of this module.

import { clips } from "./audio.js";
import { hashString } from "./util.js";
import { VOICE_PRESETS, deliveryTag } from "../data/voices.js";

export const TTS_ENDPOINT = "/api/tts";

/**
 * Stable cache key. Changing the preset, its delivery, the model or the
 * wording all produce a new entry.
 *
 * The delivery fingerprint matters: without it, retuning a preset to sound
 * more human would silently keep serving the old audio for every line already
 * generated, and the retune would appear to have done nothing.
 */
export function cacheKey(presetId, model, text) {
  return `tts:${presetId}:${deliveryTag(presetId)}:${model}:${hashString(text).toString(36)}`;
}

export async function cached(presetId, model, text) {
  try {
    return (await clips.get(cacheKey(presetId, model, text))) || null;
  } catch {
    return null;
  }
}

/** How much of a set of lines is already generated. */
export async function cacheReport(presetId, model, texts) {
  let have = 0;
  let bytes = 0;
  for (const t of texts) {
    const blob = await cached(presetId, model, t);
    if (blob) {
      have++;
      bytes += blob.size || 0;
    }
  }
  return { have, total: texts.length, bytes };
}

/**
 * Delete audio generated under a delivery that no longer exists — the old
 * recordings left behind when a preset is retuned. Without this they sit in
 * IndexedDB forever, unreachable and taking up space. Cheap, and safe to call
 * on every visit to the Voice Library.
 */
export async function pruneStaleDeliveries() {
  try {
    const live = new Set(VOICE_PRESETS.map((p) => `tts:${p.id}:${deliveryTag(p.id)}:`));
    const stale = (await clips.keys()).filter(
      (k) => String(k).startsWith("tts:") && ![...live].some((p) => String(k).startsWith(p))
    );
    await Promise.all(stale.map((k) => clips.delete(k)));
    return stale.length;
  } catch {
    return 0;
  }
}

export async function clearCache() {
  try {
    const keys = await clips.keys();
    await Promise.all(keys.filter((k) => String(k).startsWith("tts:")).map((k) => clips.delete(k)));
    return keys.filter((k) => String(k).startsWith("tts:")).length;
  } catch {
    return 0;
  }
}

/**
 * Fetch one line from the proxy and cache it. Returns a Blob.
 * Throws a tagged error the UI can explain: no_key | offline | failed.
 */
export async function generate({ presetId, model, text, voice, instructions, speed, apiKey, signal }) {
  const headers = { "Content-Type": "application/json" };
  // Only sent when the user has opted into bring-your-own-key; with a
  // server-side OPENAI_API_KEY this header is absent entirely.
  if (apiKey) headers["x-openai-key"] = apiKey;

  let res;
  try {
    res = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({ input: text, voice, instructions, speed, model }),
    });
  } catch (err) {
    const e = new Error("Could not reach the voice service.");
    e.code = err?.name === "AbortError" ? "aborted" : "offline";
    throw e;
  }

  if (!res.ok) {
    let payload = {};
    try {
      payload = await res.json();
    } catch {
      /* non-JSON error body */
    }
    const e = new Error(payload.message || `Voice service returned ${res.status}`);
    e.code = res.status === 401 || payload.error === "no_key" ? "no_key" : "failed";
    e.status = res.status;
    throw e;
  }

  const blob = await res.blob();
  if (!blob.size) {
    const e = new Error("The voice service returned empty audio.");
    e.code = "failed";
    throw e;
  }
  try {
    await clips.put(cacheKey(presetId, model, text), blob);
  } catch {
    // Cache write failure is survivable — the audio still plays this once.
  }
  return blob;
}

/** Cache first, network second. */
export async function getAudio(opts) {
  const hit = await cached(opts.presetId, opts.model, opts.text);
  if (hit) return { blob: hit, fromCache: true };
  const blob = await generate(opts);
  return { blob, fromCache: false };
}

/**
 * Is a natural voice actually reachable? A free GET health check — it costs
 * nothing at OpenAI and distinguishes the three failures that matter:
 *
 *   no_route — nothing is serving /api/tts. A plain static host, or the
 *              published artifact preview, whose sandbox blocks all network.
 *   no_key   — the function is there but has no OpenAI key.
 *   offline  — the request itself failed.
 */
export async function probe(apiKey) {
  let res;
  try {
    const headers = {};
    if (apiKey) headers["x-openai-key"] = apiKey;
    res = await fetch(TTS_ENDPOINT, { method: "GET", headers });
  } catch {
    return { ok: false, code: "offline", message: "The request could not be sent." };
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  // A static host answers unknown paths with index.html, not our JSON marker.
  if (!payload || payload.service !== "eternal-ruler-tts") {
    return {
      ok: false,
      code: "no_route",
      message: "Nothing is serving /api/tts here.",
    };
  }
  if (!payload.keyPresent) {
    return { ok: false, code: "no_key", message: "The voice service is running but has no OpenAI key." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Availability, resolved once per session.
//
// Without this, every single line on a static host would fire a doomed request
// and then fall back — adding a network timeout to every spoken line. We ask
// once, remember, and stop trying.
// ---------------------------------------------------------------------------

let availability = null; // null = not asked yet
let inFlight = null;

export function knownAvailability() {
  return availability;
}

export function resetAvailability() {
  availability = null;
  inFlight = null;
}

export async function ensureAvailable(apiKey) {
  if (availability) return availability;
  if (!inFlight) {
    inFlight = probe(apiKey).then((r) => {
      availability = r;
      inFlight = null;
      return r;
    });
  }
  return inFlight;
}
