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

export const TTS_ENDPOINT = "/api/tts";

/** Stable cache key. Changing preset, model or wording produces a new entry. */
export function cacheKey(presetId, model, text) {
  return `tts:${presetId}:${model}:${hashString(text).toString(36)}`;
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
 * Is a natural voice actually reachable? Cheap probe used to decide whether to
 * show the feature as live or as "needs a key". Deliberately generates one very
 * short line so the answer is real rather than assumed.
 */
export async function probe(apiKey) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["x-openai-key"] = apiKey;
    const res = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ input: "Here.", voice: "shimmer", model: "gpt-4o-mini-tts" }),
    });
    if (res.ok) return { ok: true };
    const payload = await res.json().catch(() => ({}));
    return { ok: false, code: payload.error === "no_key" || res.status === 401 ? "no_key" : "failed", message: payload.message };
  } catch {
    return { ok: false, code: "offline", message: "No route to the voice service. Is the API function deployed?" };
  }
}
