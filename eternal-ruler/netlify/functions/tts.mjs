// Netlify Functions v2 adapter.
//
// `config.path` mounts this directly at /api/tts, so no redirect is needed —
// netlify.toml still carries one as a fallback for older build images.
//
// Set the key in: Netlify → Site configuration → Environment variables
//   OpenAI_EternalRuler = sk-...

import { handleTts } from "../../server/tts-core.js";

export default async (request) => {
  const result = await handleTts({
    method: request.method,
    body: request.method === "POST" ? await request.text() : null,
    headerKey: request.headers.get("x-openai-key"),
    env: process.env,
  });

  if (result.audio) {
    return new Response(result.audio, { status: result.status, headers: result.headers });
  }
  return new Response(JSON.stringify(result.json), {
    status: result.status,
    headers: { "Content-Type": "application/json", ...(result.headers || {}) },
  });
};

export const config = { path: "/api/tts" };
