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
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = Buffer.concat(chunks).toString("utf8");

        const { handleTts } = await server.ssrLoadModule("/server/tts-core.js");
        const result = await handleTts({
          method: req.method,
          body,
          headerKey: req.headers["x-openai-key"],
          env: { ...process.env, ...env },
        });
        Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
        res.statusCode = result.status;
        if (result.audio) {
          res.end(Buffer.from(result.audio));
        } else {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.json));
        }
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
