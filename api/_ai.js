// Shared AI helper for every /api function (chat, tutor, résumé coach).
//
// Primary: OpenRouter free models. A one-time $10 credit purchase on OpenRouter lifts the free
// ":free" models to 1000 requests/day, which is plenty for a portfolio.
// Set OPENROUTER_API_KEY in Vercel. Optional: OPENROUTER_MODELS = comma-separated list, best first.
// Fallback: ANTHROPIC_API_KEY (paid) if there is no OpenRouter key.
// With neither key, complete() returns null and callers show their offline fallback.

const DEFAULT_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-coder:free",
  "deepseek/deepseek-chat-v3.1:free",
  "z-ai/glm-4.5-air:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
const ANTHROPIC_MODEL = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
const MAX_TRIES = Number(process.env.OPENROUTER_MAX_ATTEMPTS || 4);

export const aiConfigured = () => !!(process.env.OPENROUTER_API_KEY || process.env.AI_FALLBACK_API_KEY || process.env.ANTHROPIC_API_KEY);

const models = () => {
  const own = (process.env.OPENROUTER_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return own.length ? own : DEFAULT_MODELS;
};

// Some free models wrap their answer in reasoning tags. Remove them.
const tidy = (t) => String(t || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

async function openAiCompatible({ base, key, list, system, messages, maxTokens }) {
  let lastErr = "no reply";
  for (const model of list.slice(0, MAX_TRIES)) {
    try {
      const r = await fetch(`${base}/chat/completions`, {
        method: "POST",
        signal: AbortSignal.timeout(Number(process.env.OPENROUTER_TIMEOUT_MS || 25000)),
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
          "http-referer": process.env.SITE_URL || "https://aaronprince.dev",
          "x-title": "Aaron Prince portfolio",
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.6, messages: [{ role: "system", content: system }, ...messages] }),
      });
      if (!r.ok) {
        lastErr = `${model} ${r.status}`;
        continue; // busy, rate limited or gone: try the next free model
      }
      const data = await r.json();
      const text = tidy(data?.choices?.[0]?.message?.content);
      if (text) return { text, model };
      lastErr = `${model} empty`;
    } catch (e) {
      lastErr = `${model} ${e?.name === "TimeoutError" ? "timeout" : e?.message}`;
    }
  }
  throw new Error(`All models failed (${lastErr})`);
}

async function anthropic({ system, messages, maxTokens }) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const data = await r.json();
  const text = (data?.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return { text, model: ANTHROPIC_MODEL };
}

/** Returns { text, model }, or null when no AI key is configured. Throws if every provider fails.
 *  Order: OpenRouter free models, then a second OpenAI-compatible router (AI_FALLBACK_*), then Anthropic. */
export async function complete({ system, messages, maxTokens = 500 }) {
  const errors = [];
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await openAiCompatible({ base: "https://openrouter.ai/api/v1", key: process.env.OPENROUTER_API_KEY, list: models(), system, messages, maxTokens });
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (process.env.AI_FALLBACK_API_KEY && process.env.AI_FALLBACK_BASE_URL && process.env.AI_FALLBACK_MODEL) {
    try {
      const base = process.env.AI_FALLBACK_BASE_URL.replace(/\/+$/, "");
      return await openAiCompatible({ base, key: process.env.AI_FALLBACK_API_KEY, list: process.env.AI_FALLBACK_MODEL.split(",").map((s) => s.trim()).filter(Boolean), system, messages, maxTokens });
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await anthropic({ system, messages, maxTokens });
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (errors.length) throw new Error(errors.join(" | "));
  return null;
}
