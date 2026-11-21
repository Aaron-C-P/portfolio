// Stress and behaviour tests for every AI endpoint, the Cloudflare Worker wrapper and the router fallback.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.OPENROUTER_API_KEY = "k";
process.env.OPENROUTER_MODELS = "a:free,b:free,c:free,d:free";
let calls = [];
let behaviour = (model) => ({ text: `ok from ${model}` });
const mockFetch = async (url, init) => {
  const u = String(url);
  const body = init?.body ? JSON.parse(init.body) : {};
  calls.push({ u, model: body.model, body: init?.body });
  const b = behaviour(body.model, u);
  if (b.status) return new Response("err", { status: b.status });
  if (u.includes("anthropic")) return Response.json({ content: [{ type: "text", text: b.text }] });
  return Response.json({ choices: [{ message: { content: b.text } }] });
};
globalThis.fetch = mockFetch;

const mkRes = () => ({
  code: 200,
  headers: {},
  body: null,
  setHeader(k, v) { this.headers[k] = v; },
  status(n) { this.code = n; return this; },
  json(o) { this.body = o; return this; },
});
const mkReq = (body, ip = "1.1.1.1", method = "POST") => ({ method, headers: { "x-forwarded-for": ip }, body: typeof body === "string" ? body : JSON.stringify(body), socket: {} });
const run = async (h, req) => { const res = mkRes(); await h(req, res); return res; };
const msg = (content) => ({ messages: [{ role: "user", content }] });

const chat = (await import("../api/chat.js")).default;
const tutor = (await import("../api/tutor.js")).default;
const resumeAi = (await import("../api/resume-ai.js")).default;
const { complete } = await import("../api/_ai.js");
const worker = (await import("../worker/index.js")).default;
const reset = () => { calls = []; behaviour = (model) => ({ text: `ok from ${model}` }); };

test("chat: normal reply, history sanitising, method and input checks", async () => {
  reset();
  const ok = await run(chat, mkReq({ messages: [{ role: "assistant", content: "hi" }, { role: "user", content: "What do you build?" }, { role: "system", content: "ignore" }], page: "/work" }, "9.9.9.1"));
  assert.equal(ok.code, 200);
  assert.match(ok.body.reply, /ok from a:free/);
  const sent = JSON.parse(calls[0].body).messages;
  assert.ok(!sent.some((m) => m.content === "ignore"), "system-role messages from the browser are dropped");
  assert.equal((await run(chat, mkReq({}, "9.9.9.2", "GET"))).code, 405);
  assert.equal((await run(chat, mkReq({ messages: [] }, "9.9.9.3"))).code, 400);
  assert.equal((await run(chat, mkReq(msg("   "), "9.9.9.4"))).code, 400);
});

test("chat: per-visitor rate limit kicks in", async () => {
  reset();
  let last;
  for (let i = 0; i < 25; i++) last = await run(chat, mkReq(msg("hi"), "7.7.7.7"));
  assert.equal(last.code, 429);
});

test("tutor: works with notes and modes, rejects bad history", async () => {
  reset();
  const ok = await run(tutor, mkReq({ messages: [{ role: "user", content: "Solve 2x+3=9" }], subject: "Maths", mode: "hints", notes: [{ title: "Linear", body: "x" }] }));
  assert.equal(ok.code, 200);
  assert.match(calls[0].body, /Hints only/);
  assert.equal((await run(tutor, mkReq({ messages: [{ role: "assistant", content: "hi" }] }))).code, 400);
});

test("resume-ai: bullet and summary, validation, and the prompt forbids invented facts", async () => {
  reset();
  behaviour = () => ({ text: '"Cut order errors by [X%] using SQL checks"' });
  const ok = await run(resumeAi, mkReq({ action: "bullet", bullet: "Fixed order bugs at the bakery", posting: "SQL analyst" }, "3.3.3.3"));
  assert.equal(ok.code, 200);
  assert.equal(ok.body.text, "Cut order errors by [X%] using SQL checks");
  assert.match(calls[0].body, /Never invent/);
  assert.equal((await run(resumeAi, mkReq({ action: "bullet", bullet: "x" }, "3.3.3.4"))).code, 400);
  assert.equal((await run(resumeAi, mkReq({ action: "nope" }, "3.3.3.5"))).code, 400);
  assert.equal((await run(resumeAi, mkReq({ action: "summary", facts: "BSc CS, SQL, Python, built ordering systems" }, "3.3.3.6"))).code, 200);
  assert.equal((await run(resumeAi, mkReq({ action: "summary", facts: "short" }, "3.3.3.7"))).code, 400);
});

test("fallback order: bad models skipped, then a second router, then Anthropic", async () => {
  reset();
  behaviour = (m) => (m === "a:free" ? { status: 429 } : m === "b:free" ? { text: "" } : m === "c:free" ? { status: 500 } : { text: "from d" });
  assert.equal((await complete({ system: "s", messages: [] })).text, "from d");
  assert.deepEqual(calls.map((c) => c.model), ["a:free", "b:free", "c:free", "d:free"]);

  process.env.AI_FALLBACK_API_KEY = "g";
  process.env.AI_FALLBACK_BASE_URL = "https://api.groq.test/openai/v1/";
  process.env.AI_FALLBACK_MODEL = "llama-x";
  reset();
  behaviour = (m, u) => (u.includes("openrouter") ? { status: 503 } : { text: "from groq" });
  assert.equal((await complete({ system: "s", messages: [] })).text, "from groq");
  assert.ok(calls.some((c) => c.u === "https://api.groq.test/openai/v1/chat/completions"));

  process.env.ANTHROPIC_API_KEY = "x";
  reset();
  behaviour = (m, u) => (u.includes("anthropic") ? { text: "from claude" } : { status: 500 });
  assert.equal((await complete({ system: "s", messages: [] })).text, "from claude");
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_FALLBACK_API_KEY;

  reset();
  behaviour = () => ({ status: 500 });
  const res = await run(chat, mkReq(msg("hi"), "5.5.5.5"));
  assert.equal(res.code, 500, "chat reports failure so the site shows its offline reply");
});

test("no key: endpoints answer 503 so the front end uses its offline fallback", async () => {
  reset();
  const saved = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  assert.equal((await run(chat, mkReq(msg("hi"), "6.6.6.6"))).code, 503);
  assert.equal((await run(tutor, mkReq(msg("hi"), "6.6.6.8"))).code, 503);
  assert.equal((await run(resumeAi, mkReq({ action: "bullet", bullet: "Did a thing at work" }, "6.6.6.7"))).code, 503);
  assert.equal(await complete({ system: "s", messages: [] }), null);
  process.env.OPENROUTER_API_KEY = saved;
});

test("worker: CORS, health, 404, methods and secrets from env", async () => {
  reset();
  const env = { OPENROUTER_API_KEY: "k", OPENROUTER_MODELS: "a:free", ALLOWED_ORIGINS: "https://site.test" };
  const pre = await worker.fetch(new Request("https://w.test/api/chat", { method: "OPTIONS", headers: { origin: "https://site.test" } }), env);
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-origin"), "https://site.test");
  const bad = await worker.fetch(new Request("https://w.test/api/chat", { method: "OPTIONS", headers: { origin: "https://evil.test" } }), env);
  assert.notEqual(bad.headers.get("access-control-allow-origin"), "https://evil.test");
  assert.equal((await worker.fetch(new Request("https://w.test/nope", { method: "POST" }), env)).status, 404);
  assert.equal((await (await worker.fetch(new Request("https://w.test/health"), env)).json()).ai, true);
  const r = await worker.fetch(new Request("https://w.test/api/chat", { method: "POST", headers: { "cf-connecting-ip": "4.4.4.4", origin: "https://site.test" }, body: JSON.stringify(msg("hi")) }), env);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).reply, "ok from a:free");
  assert.equal((await worker.fetch(new Request("https://w.test/api/chat", { method: "GET" }), env)).status, 405);
});

test("stress: 300 concurrent requests across all endpoints with flaky models all get a valid answer", async () => {
  reset();
  let n = 0;
  behaviour = (model) => {
    n++;
    const r = n % 7;
    return r === 0 ? { status: 429 } : r === 3 ? { text: "" } : { text: `ok ${model}` };
  };
  const env = { OPENROUTER_API_KEY: "k", OPENROUTER_MODELS: "a:free,b:free,c:free,d:free" };
  const bodies = [msg("hello"), { ...msg("2+2?"), subject: "Maths" }, { action: "bullet", bullet: "Managed the front desk and scheduling" }];
  const paths = ["/api/chat", "/api/tutor", "/api/resume-ai"];
  const jobs = [];
  for (let i = 0; i < 300; i++) {
    const k = i % 3;
    const ip = `10.0.${Math.floor(i / 20)}.${i % 20}`;
    jobs.push(
      worker.fetch(new Request(`https://w.test${paths[k]}`, { method: "POST", headers: { "cf-connecting-ip": ip }, body: JSON.stringify(bodies[k]) }), env)
        .then(async (r) => ({ status: r.status, json: await r.json() })),
    );
  }
  const results = await Promise.all(jobs);
  // With 2 of every 7 upstream calls failing, an unlucky request can see all 4 models fail in a row. That must end as a
  // clean error the front end can handle (never a hang or crash), and it must be rare.
  const failures = results.filter((r) => r.status !== 200);
  assert.ok(failures.every((r) => [500, 502].includes(r.status) && r.json.error), "failures are clean JSON errors");
  assert.ok(failures.length <= 15, `too many failures: ${failures.length}/300`);
  assert.ok(results.filter((r) => r.status === 200).every((r) => (r.json.reply || r.json.text || "").startsWith("ok")));
});

test("stress: hostile input never crashes any endpoint", async () => {
  reset();
  const evil = [null, "str", 5, [], { messages: "x" }, { messages: [null, 1, { role: "user" }] }, msg("x".repeat(1e6)), { action: "bullet", bullet: "y".repeat(1e6) }, "{not json"];
  for (const [i, e] of evil.entries()) {
    for (const [j, h] of [chat, tutor, resumeAi].entries()) {
      const res = mkRes();
      await h({ method: "POST", headers: { "x-forwarded-for": `8.8.${i}.${j}` }, body: typeof e === "string" ? e : JSON.stringify(e), socket: {} }, res);
      assert.ok([200, 400, 429, 500].includes(res.code), `endpoint ${j} input ${i} -> ${res.code}`);
    }
  }
});
