// Platform-neutral TTS handler.
//
// Every hosting target wants a different function signature — Netlify v2 wants
// (Request) => Response, Vercel wants (req, res), Vite's dev middleware wants
// raw node streams. So the actual logic lives here once, and each adapter is a
// dozen lines of translation. One place to fix, one place to test.

export const ALLOWED_VOICES = [
  "alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer",
];
export const ALLOWED_MODELS = ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"];
export const MAX_INPUT = 4000;

/**
 * Key resolution, in order:
 *   1. OpenAI_EternalRuler in the environment (never leaves the server)
 *   2. OPENAI_API_KEY, for the conventional name
 *   3. an x-openai-key header from the client (bring-your-own-key)
 */
export function resolveKey(env = {}, headerKey = null) {
  return env.OpenAI_EternalRuler || env.OPENAI_API_KEY || headerKey || null;
}

export async function synthesize({ input, voice, instructions, speed, model, apiKey }) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      voice,
      input,
      response_format: "mp3",
      // Only gpt-4o-mini-tts honours `instructions`; the tts-1 models ignore
      // it, so don't send it where it does nothing.
      ...(model === "gpt-4o-mini-tts" && instructions ? { instructions } : {}),
      ...(speed ? { speed } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`OpenAI returned ${res.status}`);
    err.status = res.status;
    err.detail = detail.slice(0, 500);
    throw err;
  }
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * The whole endpoint, as data.
 * Returns { status, headers, json } or { status, headers, audio: Uint8Array }.
 */
export async function handleTts({ method, body, headerKey, env }) {
  const apiKey = resolveKey(env, headerKey);

  // A free health check. It costs nothing at OpenAI and lets the client tell a
  // real function apart from a static host answering with index.html — hence
  // the `service` marker.
  if (method === "GET") {
    return {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      json: { service: "eternal-ruler-tts", keyPresent: !!apiKey },
    };
  }

  if (method !== "POST") {
    return { status: 405, json: { error: "method", message: "POST only" } };
  }

  if (!apiKey) {
    return {
      status: 401,
      json: {
        error: "no_key",
        message:
          "No OpenAI key. Set OpenAI_EternalRuler on the server, or paste a key in the app's Voice Library.",
      },
    };
  }

  let parsed = body;
  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      return { status: 400, json: { error: "bad_json", message: "Body must be JSON" } };
    }
  }
  parsed = parsed || {};

  const { input, voice = "shimmer", instructions, speed, model = "gpt-4o-mini-tts" } = parsed;

  if (!input || typeof input !== "string") {
    return { status: 400, json: { error: "bad_input", message: "input must be a non-empty string" } };
  }
  if (input.length > MAX_INPUT) {
    return { status: 400, json: { error: "too_long", message: `input must be under ${MAX_INPUT} characters` } };
  }
  if (!ALLOWED_VOICES.includes(voice)) {
    return { status: 400, json: { error: "bad_voice", message: `voice must be one of ${ALLOWED_VOICES.join(", ")}` } };
  }
  if (!ALLOWED_MODELS.includes(model)) {
    return { status: 400, json: { error: "bad_model", message: `model must be one of ${ALLOWED_MODELS.join(", ")}` } };
  }

  try {
    const audio = await synthesize({ input, voice, instructions, speed, model, apiKey });
    return {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        // The client caches in IndexedDB as well; this just helps repeat prewarms.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      audio,
    };
  } catch (err) {
    return {
      status: err.status || 502,
      json: { error: "openai_failed", message: err.message, detail: err.detail },
    };
  }
}
