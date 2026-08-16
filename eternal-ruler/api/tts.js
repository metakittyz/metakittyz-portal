// Vercel adapter. The logic lives in server/tts-core.js — see that file.
//
// Set the key in: Vercel → Project → Settings → Environment Variables
//   OpenAI_EternalRuler = sk-...

import { handleTts } from "../server/tts-core.js";

export default async function handler(req, res) {
  const result = await handleTts({
    method: req.method,
    body: req.body,
    headerKey: req.headers["x-openai-key"],
    env: process.env,
  });

  Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  if (result.audio) {
    res.status(result.status).send(Buffer.from(result.audio));
    return;
  }
  res.status(result.status).json(result.json);
}
