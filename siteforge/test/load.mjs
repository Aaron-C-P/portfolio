// Load test: runs the real SiteForge server against a flaky fake OpenRouter and drives it over HTTP.
//   node test/load.mjs            (not part of `npm test`; it starts servers and takes a few seconds)
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const PAGE = (n) => `<!DOCTYPE html><html><head><title>Site ${n}</title></head><body><h1>Site ${n}</h1></body></html>`;
let upstream = 0;
const fake = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url === "/models") {
      res.setHeader("content-type", "application/json");
      return res.end(JSON.stringify({ data: ["a", "b", "c", "d"].map((x) => ({ id: `${x}/m:free`, name: x, context_length: 64000, pricing: { prompt: "0", completion: "0" } })) }));
    }
    const n = ++upstream;
    const r = n % 5;
    if (r === 0) { res.writeHead(429); return res.end("{}"); }
    if (r === 1) { res.writeHead(200, { "content-type": "text/event-stream" }); return res.end("data: " + JSON.stringify({ choices: [{ delta: { content: "sorry, no page" } }] }) + "\n\ndata: [DONE]\n\n"); }
    res.writeHead(200, { "content-type": "text/event-stream" });
    const html = "SUMMARY: ok\n" + PAGE(n);
    for (const part of html.match(/[\s\S]{1,25}/g)) res.write("data: " + JSON.stringify({ choices: [{ delta: { content: part } }] }) + "\n\n");
    res.write("data: " + JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 5, completion_tokens: 9 } }) + "\n\ndata: [DONE]\n\n");
    res.end();
  });
});
await new Promise((r) => fake.listen(0, r));

const PORT = 3077;
const base = `http://localhost:${PORT}`;
const env = {
  ...process.env, PORT: String(PORT), DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), "sf-load-")),
  OPENROUTER_API_KEY: "k", OPENROUTER_BASE_URL: `http://127.0.0.1:${fake.address().port}`, OPENROUTER_DAILY_LIMIT: "1000",
  AI_LIMIT_TRIAL: "1000", ADMIN_EMAILS: "",
};
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const server = spawn(process.execPath, ["src/server.js"], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
for (let i = 0; i < 50 && !log.includes("AI:"); i++) await new Promise((r) => setTimeout(r, 100));
assert.ok(log.includes("OpenRouter free models"), log);

const call = async (jar, method, url, body) => {
  const r = await fetch(base + url, { method, headers: { "content-type": "application/json", cookie: jar.c || "", "x-forwarded-for": jar.ip || "1.2.3.4" }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get("set-cookie");
  if (sc) jar.c = sc.split(",").map((x) => x.split(";")[0]).join("; ");
  return { status: r.status, json: await r.json().catch(() => null) };
};
const poll = async (jar, id) => {
  for (let i = 0; i < 200; i++) {
    const { json } = await call(jar, "GET", `/api/jobs/${id}`);
    if (json.job.status !== "running") return json.job;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("job never finished");
};

const USERS = 25;
const t0 = Date.now();
const results = await Promise.all(
  Array.from({ length: USERS }, async (_, i) => {
    const jar = { ip: `10.1.0.${i + 1}` };
    const su = await call(jar, "POST", "/api/auth/signup", { email: `u${i}@load.test`, password: "password123", name: `U${i}` });
    assert.equal(su.status, 200, "signup");
    const models = await call(jar, "GET", "/api/ai/models");
    assert.equal(models.json.models.length, 4);
    const made = await call(jar, "POST", "/api/sites", { brief: { name: `Load Shop ${i}`, type: "Shop" }, model: "a/m:free" });
    assert.equal(made.status, 200, JSON.stringify(made.json));
    const job = await poll(jar, made.json.jobId);
    assert.equal(job.status, "done", JSON.stringify(job));
    const sid = made.json.site.id;
    const edit = await call(jar, "POST", `/api/sites/${sid}/ai-edit`, { instruction: "Add a price list" });
    assert.equal(edit.status, 200, JSON.stringify(edit.json));
    const ej = await poll(jar, edit.json.jobId);
    assert.ok(["done", "error"].includes(ej.status));
    const pub = await call(jar, "POST", `/api/sites/${sid}/publish`);
    assert.equal(pub.status, 200, JSON.stringify(pub.json));
    const page = await fetch(`${base}/s/${made.json.site.slug}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<h1>|Load Shop/);
    return { editOk: ej.status === "done" };
  }),
);
const ms = Date.now() - t0;
const bad = await call({}, "GET", "/api/ai/models");
assert.equal(bad.status, 401, "models endpoint needs login");
console.log(`PASS: ${USERS} users signed up, built, AI-edited and published in ${ms} ms; AI edits ok: ${results.filter((r) => r.editOk).length}/${USERS}; upstream calls: ${upstream}`);
server.kill();
fake.close();
process.exit(0);
