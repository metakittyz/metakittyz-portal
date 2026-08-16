// Serverless proxy to OpenAI's text-to-speech.
//
// Why a proxy at all: an OpenAI key must never ship in a browser bundle, and
// calling api.openai.com directly from a page is unreliable across browsers.
// This function keeps the key server-side and is the only thing the client
// talks to.
//
// Deploys as-is on Vercel (`api/tts.js`). For Netlify or Cloudflare, the body
// of `synthesize` is the part to reuse.
//
// Key resolution, in order:
//   1. OpenAI_EternalRuler in the environment (the right way — never leaves the server)
//   2. OPENAI_API_KEY, for anyone using the conventional name
//   3. an `x-openai-key` header from the client (bring-your-own-key; see README)

const ALLOWED_VOICES = ["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"];
const ALLOWED_MODELS = ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"];
const MAX_INPUT = 4000;

export async function synthesize({ input, voice, instructions, speed, model, apiKey }) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      response_format: "mp3",
      // `instructions` is only honoured by the gpt-4o-mini-tts model; the
      // older tts-1 models ignore it, so only send it where it does something.
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
  return Buffer.from(await res.arrayBuffer());
}

export default async function handler(req, res) {
  const apiKey =
    process.env.OpenAI_EternalRuler || process.env.OPENAI_API_KEY || req.headers["x-openai-key"];

  // GET is a free health check: it says whether this route is really the TTS
  // function and whether a key is present, without spending anything at
  // OpenAI. The `service` marker matters — a static host answers unknown paths
  // with index.html, and the client must be able to tell that apart.
  if (req.method === "GET") {
    res.status(200).json({ service: "eternal-ruler-tts", keyPresent: !!apiKey });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  if (!apiKey) {
    res.status(401).json({
      error: "no_key",
      message:
        "No OpenAI key. Set OpenAI_EternalRuler on the server, or paste a key in the app's Voice Library.",
    });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { input, voice = "shimmer", instructions, speed, model = "gpt-4o-mini-tts" } = body;

  if (!input || typeof input !== "string") {
    res.status(400).json({ error: "bad_input", message: "input must be a non-empty string" });
    return;
  }
  if (input.length > MAX_INPUT) {
    res.status(400).json({ error: "too_long", message: `input must be under ${MAX_INPUT} characters` });
    return;
  }
  if (!ALLOWED_VOICES.includes(voice)) {
    res.status(400).json({ error: "bad_voice", message: `voice must be one of ${ALLOWED_VOICES.join(", ")}` });
    return;
  }
  if (!ALLOWED_MODELS.includes(model)) {
    res.status(400).json({ error: "bad_model", message: `model must be one of ${ALLOWED_MODELS.join(", ")}` });
    return;
  }

  try {
    const audio = await synthesize({ input, voice, instructions, speed, model, apiKey });
    res.setHeader("Content-Type", "audio/mpeg");
    // The client caches in IndexedDB too; this just helps repeat prewarms.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(audio);
  } catch (err) {
    res.status(err.status || 502).json({
      error: "openai_failed",
      message: err.message,
      detail: err.detail,
    });
  }
}
