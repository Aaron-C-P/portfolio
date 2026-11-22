// OpenRouter free-model registry, fallback chain and the daily request budget.
//
// OpenRouter gives free ":free" models a daily request cap: 50/day on a fresh account and
// 1000/day once you have bought $10 of credits at any point. We count every upstream attempt
// (including failed ones, which OpenRouter also counts) so the app can stop cleanly before
// hitting the wall instead of erroring half way through a build.
import { config } from './config.js';
import { q, now } from './db.js';

export const providerName = () => {
  const p = config.ai.provider;
  if (p === 'openrouter' && config.ai.openrouter.apiKey) return 'openrouter';
  if (p === 'anthropic' && config.ai.apiKey) return 'anthropic';
  return 'none';
};

// Good at long HTML output, listed best-first. Used when the live catalogue can't be fetched.
export const FALLBACK_MODELS = [
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA: Nemotron 3 Ultra (strongest free model)' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder (best for web pages)' },
  { id: 'openai/gpt-oss-120b:free', name: 'OpenAI: gpt-oss-120b' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1' },
  { id: 'z-ai/glm-4.5-air:free', name: 'Z.ai: GLM 4.5 Air (fast)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta: Llama 3.3 70B' },
];

let cache = { at: 0, models: null };

// Live list of free text models with enough context to hold a web page.
async function fetchFree() {
  const res = await fetch(`${config.ai.openrouter.baseUrl}/models`, {
    signal: AbortSignal.timeout(8000),
    headers: { authorization: `Bearer ${config.ai.openrouter.apiKey}` },
  });
  if (!res.ok) throw new Error(`models ${res.status}`);
  const { data } = await res.json();
  return data
    .filter((m) => {
      const free = /:free$/.test(m.id) || (Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0);
      const text = !m.architecture?.output_modalities || m.architecture.output_modalities.includes('text');
      return free && text && (m.context_length || 0) >= 32000;
    })
    .map((m) => ({ id: m.id, name: m.name || m.id, context: m.context_length || 0 }));
}

// Preferred order: configured list first, then known-good ones, then whatever else is free.
function rank(live) {
  const wanted = config.ai.openrouter.models.length ? config.ai.openrouter.models : FALLBACK_MODELS.map((m) => m.id);
  const byId = new Map(live.map((m) => [m.id, m]));
  const out = [];
  for (const id of wanted) {
    const known = byId.get(id) || FALLBACK_MODELS.find((m) => m.id === id);
    if (known && (byId.size === 0 || byId.has(id))) out.push({ id, name: known.name || id });
  }
  for (const m of live) if (!out.some((o) => o.id === m.id)) out.push({ id: m.id, name: m.name });
  return out;
}

export async function listModels() {
  if (providerName() !== 'openrouter') return [];
  if (cache.models && Date.now() - cache.at < 3600_000) return cache.models;
  let models;
  try {
    models = rank(await fetchFree());
    if (!models.length) throw new Error('empty');
  } catch (e) {
    models = rank([]);
    if (cache.models) models = cache.models; // keep the last good list if the catalogue is down
    else console.warn(`[ai] could not load the OpenRouter model list (${e.message}); using built-in list`);
  }
  cache = { at: Date.now(), models };
  return models;
}

export function resetModelCache() {
  cache = { at: 0, models: null };
}

// Chosen model first (if it is a valid free model), then the rest in ranked order.
export async function resolveModelChain(chosen) {
  const list = (await listModels()).map((m) => m.id);
  const pick = String(chosen || '').trim();
  const first = pick && (list.includes(pick) || /:free$/.test(pick)) ? [pick] : [];
  return [...first, ...list.filter((id) => id !== pick)];
}

export function isAllowedModel(id) {
  return !id || /^[\w.\-/]+(:free)?$/.test(String(id)) && /:free$/.test(String(id));
}

// ---- daily budget (resets at 00:00 UTC, like OpenRouter) ----
const dayStart = () => {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export async function recordCall(model, ok) {
  await q.run('INSERT INTO ai_calls (model, ok, created_at) VALUES (?, ?, ?)', model, ok ? 1 : 0, now());
}

export async function dailyBudget() {
  const limit = config.ai.openrouter.dailyLimit;
  const used = (await q.get('SELECT COUNT(*) AS n FROM ai_calls WHERE created_at >= ?', dayStart())).n;
  return { limit, used, left: Math.max(0, limit - used) };
}
