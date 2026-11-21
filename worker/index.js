// Cloudflare Worker: hosts the AI endpoints off Vercel. Same handlers as /api, so there is one copy of the prompts.
//   POST /api/chat       the AI clone
//   POST /api/tutor      the tutor
//   POST /api/resume-ai  the Résumé Studio coach
// Secrets (wrangler secret put ...): OPENROUTER_API_KEY, optionally AI_FALLBACK_API_KEY.
// Vars (wrangler.toml): ALLOWED_ORIGINS (comma separated, e.g. https://yoursite.com).
import chat from "../api/chat.js";
import tutor from "../api/tutor.js";
import resumeAi from "../api/resume-ai.js";

const ROUTES = { "/api/chat": chat, "/api/tutor": tutor, "/api/resume-ai": resumeAi };

function cors(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes("*") || allowed.includes(origin);
  return {
    "access-control-allow-origin": allowed.includes("*") ? "*" : ok ? origin : allowed[0] || "",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

/** Runs a Vercel-style (req, res) handler and turns the result into a Response. */
async function run(handler, request, headers) {
  const text = await request.text();
  const req = {
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body: text,
    socket: { remoteAddress: request.headers.get("cf-connecting-ip") || "unknown" },
  };
  // Trust Cloudflare's client address for the rate limiter, not a header the caller can set.
  req.headers["x-forwarded-for"] = request.headers.get("cf-connecting-ip") || "unknown";
  let status = 200;
  let payload = "";
  const out = new Headers(headers);
  const res = {
    setHeader: (k, v) => out.set(k, String(v)),
    status(n) {
      status = n;
      return this;
    },
    json(o) {
      out.set("content-type", "application/json");
      payload = JSON.stringify(o);
      return this;
    },
    end(s = "") {
      payload = s;
      return this;
    },
  };
  await handler(req, res);
  return new Response(payload, { status, headers: out });
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (pathname === "/health") return Response.json({ ok: true, ai: !!(env.OPENROUTER_API_KEY || env.AI_FALLBACK_API_KEY || env.ANTHROPIC_API_KEY) }, { headers });
    const handler = ROUTES[pathname];
    if (!handler) return Response.json({ error: "Not found" }, { status: 404, headers });
    // Secrets and vars arrive on `env`; the shared helpers read process.env (nodejs_compat populates it).
    for (const [k, v] of Object.entries(env)) if (typeof v === "string") process.env[k] = v;
    try {
      return await run(handler, request, headers);
    } catch (e) {
      console.error("worker error", e);
      return Response.json({ error: "Server error" }, { status: 500, headers });
    }
  },
};
