// Run: node scripts/resume/webhook.test.mjs
// Exercises the paid flow end to end with no network: signed Lemon Squeezy events, code checks (valid, tampered,
// expired, refunded, shared too widely) and the server-built PDF. A fake Upstash store stands in for the real one.
import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import assert from "node:assert/strict";

process.env.RESUME_WEBHOOK_SECRET = "whsec-test";
process.env.RESUME_CODE_SECRET = "code-secret-test-0123456789";
process.env.RESEND_API_KEY = "re_test";
process.env.RESUME_FROM_EMAIL = "Aaron <orders@example.com>";
process.env.RESUME_VARIANT_ID = "777";
process.env.RESUME_MAX_DOWNLOADS = "3";
process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.test";
process.env.UPSTASH_REDIS_REST_TOKEN = "tok";

const calls = [];
let emailStatus = 200;
const kv = new Map();
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.startsWith("https://fake.upstash.test")) {
    const [c, k, v] = JSON.parse(opts.body);
    if (c === "INCR") kv.set(k, (kv.get(k) || 0) + 1);
    if (c === "SET") kv.set(k, v);
    return new Response(JSON.stringify({ result: c === "INCR" ? kv.get(k) : c === "GET" ? kv.get(k) ?? null : "OK" }));
  }
  calls.push({ url: u, body: opts?.body ? JSON.parse(opts.body) : null });
  if (u.includes("resend.com")) return new Response("{}", { status: emailStatus });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

const { default: webhook } = await import("../../api/resume-webhook.js");
const { default: unlock } = await import("../../api/resume-unlock.js");
const { default: pdf } = await import("../../api/resume-pdf.js");
const { makeCode, verifyCode } = await import("../../api/_resumeCodes.js");
const { buildResumePdf } = await import("../../src/lib/resumePdfBuilder.js");
const { resumeBlocks, sanitizeResume } = await import("../../src/lib/resumeBlocks.js");
const { jsPDF } = await import("jspdf");

let n = 0;
const run = async (handler, { method = "POST", raw, headers = {}, body }) => {
  const h = { "x-forwarded-for": `9.8.7.${Math.floor(Math.random() * 250)}`, ...headers };
  const req = raw !== undefined ? Object.assign(Readable.from([Buffer.from(raw)]), { method, headers: h }) : { method, headers: h, body };
  const out = { headers: {} };
  const res = { setHeader(k, v) { out.headers[k.toLowerCase()] = v; }, status(s) { out.status = s; return this; }, json(b) { out.body = b; return this; }, send(b) { out.bytes = b; return this; } };
  await handler(req, res);
  return out;
};
const order = (over = {}, id = "4821", event = "order_created") => JSON.stringify({ meta: { event_name: event }, data: { type: "orders", id, attributes: { status: "paid", user_email: "Buyer@Example.com", user_name: "Buyer", first_order_item: { variant_id: 777 }, ...over } } });
const sign = (raw) => createHmac("sha256", "whsec-test").update(raw).digest("hex");
const post = (raw, sig = sign(raw)) => run(webhook, { raw, headers: { "x-signature": sig } });
const ok = (name) => console.log(`PASS  ${name}`) || n++;

const resume = { name: "Jordan Brown", title: "Support Representative", email: "j@example.com", phone: "876-555-0100", location: "Kingston", links: "", summary: "Support rep who fixes problems fast.", skills: "Excel, Zendesk, Troubleshooting, Customer service, Typing",
  experience: [{ role: "Agent", org: "Island Retail", dates: "2023 - Present", bullets: ["Resolved 25+ tickets per day with a 96% satisfaction score", "Trained 6 new staff"] }], education: [{ school: "UTech", what: "BSc IT", dates: "2021 - 2025" }] };

// 1. Paid order: sheet row + email with the code
let r = await post(order());
assert.equal(r.status, 200);
assert.equal(r.body.emailed, true);
const code = makeCode("4821");
const mail = calls.find((c) => c.url.includes("resend.com"));
const sheet = calls.find((c) => c.url.includes("script.google.com"));
assert.ok(mail.body.text.includes(code) && mail.body.text.includes("90 days"));
assert.ok(sheet.body.fields.message.includes(code) && sheet.body.kind === "builder");
ok("paid order is recorded in the sheet and the code is emailed");

// 2. Code rules
assert.equal((await verifyCode(code.toLowerCase())).ok, true);
assert.equal((await verifyCode(code.slice(0, -1) + (code.endsWith("A") ? "B" : "A"))).ok, false, "tampered");
assert.equal((await verifyCode("RS-ZZZ-1-AAAAAAAA")).ok, false, "invented");
const old = makeCode("4821", process.env.RESUME_CODE_SECRET, Math.floor(Date.now() / 1000) - 91 * 86400);
assert.equal((await verifyCode(old)).reason, "expired");
assert.equal((await run(unlock, { body: { code } })).status, 200);
assert.equal((await run(unlock, { body: { code: old } })).body.reason, "expired");
ok("valid code works; tampered, invented and expired codes are rejected");

// 3. Server PDF: needs a code, contains real text, no images
assert.equal((await run(pdf, { body: { resume } })).status, 401);
assert.equal((await run(pdf, { body: { code: "nope", resume } })).status, 401);
r = await run(pdf, { body: { code, resume } });
assert.equal(r.status, 200);
assert.equal(r.headers["content-type"], "application/pdf");
assert.equal(r.headers["cache-control"], "no-store");
assert.ok(r.bytes.subarray(0, 5).toString() === "%PDF-");
const plain = buildResumePdf(jsPDF, sanitizeResume(resume), false).output();
const lines = [...plain.matchAll(/\((.*?)(?<!\\)\)\s*Tj/g)].map((m) => m[1]);
for (const b of resumeBlocks(resume)) assert.ok(lines.some((l) => l.includes(b.text.slice(0, 20))), `missing in PDF text: ${b.text}`);
assert.ok(!/\/Subtype\s*\/Image/.test(plain), "no images");
ok("PDF is only built for a valid code, and contains every line as real text with no images");

// 4. Download cap (3) stops a shared code
await run(pdf, { body: { code, resume } });
assert.equal((await run(pdf, { body: { code, resume } })).status, 200); // 3rd
const capped = await run(pdf, { body: { code, resume } }); // 4th
assert.equal(capped.status, 429);
assert.equal(capped.body.reason, "limit");
ok("a code stops working after its download limit");

// 5. Refund revokes the code
const code2 = makeCode("5000");
assert.equal((await run(pdf, { body: { code: code2, resume } })).status, 200);
calls.length = 0;
r = await post(order({ status: "refunded" }, "5000", "order_refunded"));
assert.equal(r.status, 200);
assert.equal(r.body.revoked, true);
assert.equal((await run(pdf, { body: { code: code2, resume } })).body.reason, "revoked");
assert.equal((await run(unlock, { body: { code: code2 } })).body.reason, "revoked");
assert.ok(calls[0].body.fields.topic === "Résumé Studio REFUND");
ok("a refund switches the code off and is logged to the sheet");

// 6. Rejected and ignored webhook events do nothing
calls.length = 0;
assert.equal((await post(order(), "deadbeef")).status, 401);
assert.equal((await post(order({ status: "pending" }, "9")) ).body.ignored, "not paid");
assert.equal((await post(order({ first_order_item: { variant_id: 1 } }, "10"))).body.ignored, "other product");
assert.equal(calls.length, 0);
ok("bad signature, unpaid and other products do nothing");

// 7. Email failure retries; without Resend the sheet says to send by hand
emailStatus = 500;
assert.equal((await post(order({ user_email: "x@example.com" }, "11"))).status, 502);
emailStatus = 200;
delete process.env.RESEND_API_KEY;
calls.length = 0;
r = await post(order({ user_email: "y@example.com" }, "12"));
assert.equal(r.body.emailed, false);
assert.ok(calls[0].body.fields.message.includes("NOT sent"));
ok("email failure asks for a retry; no email service means send by hand");

// 8. Input limits on the PDF request
assert.equal(sanitizeResume({ name: "x".repeat(5000), experience: Array(50).fill({ role: "r", bullets: Array(50).fill("b") }) }).experience.length, 12);
assert.equal(sanitizeResume(null).name, "");
ok("oversized or malformed résumé input is trimmed safely");

// 9. Manual codes still work and are not tied to expiry
process.env.RESUME_CODES = "RS-HAND1";
assert.equal((await verifyCode("rs-hand1")).ok, true);
ok("manually issued codes work too");

console.log(`\n${n} groups passed`);
