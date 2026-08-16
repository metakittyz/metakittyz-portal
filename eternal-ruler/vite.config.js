import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serves `api/tts.js` during `npm run dev` so the natural voice works locally
 * without deploying anything. In production the same file runs as a real
 * serverless function; this plugin does nothing in a build.
 */
function ttsDevApi(env) {
  return {
    name: "tts-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/tts", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "POST only" }));
          return;
        }
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = Buffer.concat(chunks).toString("utf8");

        // Reuse the real handler by shimming the bits of req/res it uses.
        const { default: handler } = await server.ssrLoadModule("/api/tts.js");
        // Mirror whichever name is present in .env into the handler's scope.
        if (env.OpenAI_EternalRuler) process.env.OpenAI_EternalRuler = env.OpenAI_EternalRuler;
        if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
        await handler(
          { method: "POST", headers: req.headers, body },
          {
            statusCode: 200,
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              res.statusCode = code;
              return this;
            },
            json(obj) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(obj));
            },
            send(buf) {
              res.end(buf);
            },
          }
        );
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), ttsDevApi(env)],
    server: { port: 5174 },
  };
});
