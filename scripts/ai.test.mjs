import { test } from "node:test";
import assert from "node:assert/strict";

process.env.OPENROUTER_API_KEY = "k";
process.env.OPENROUTER_MODELS = "a:free,b:free,c:free";
delete process.env.ANTHROPIC_API_KEY;
const { complete } = await import("../api/_ai.js");

test("falls through busy and empty free models and strips <think> blocks", async () => {
  const seen = [];
  globalThis.fetch = async (_u, init) => {
    const model = JSON.parse(init.body).model;
    seen.push(model);
    if (model === "a:free") return new Response("busy", { status: 429 });
    if (model === "b:free") return Response.json({ choices: [{ message: { content: "" } }] });
    return Response.json({ choices: [{ message: { content: "<think>hmm</think>Hello there" } }] });
  };
  const out = await complete({ system: "s", messages: [{ role: "user", content: "hi" }] });
  assert.deepEqual(seen, ["a:free", "b:free", "c:free"]);
  assert.equal(out.text, "Hello there");
});

test("throws when every free model fails, and returns null with no key", async () => {
  globalThis.fetch = async () => new Response("no", { status: 500 });
  await assert.rejects(() => complete({ system: "s", messages: [] }), /All models failed/);
  delete process.env.OPENROUTER_API_KEY;
  assert.equal(await complete({ system: "s", messages: [] }), null);
});
