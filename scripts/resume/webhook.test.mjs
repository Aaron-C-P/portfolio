// Run: node scripts/resume/webhook.test.mjs
// Exercises /api/resume-webhook and /api/resume-unlock with signed sample Lemon Squeezy events. No network.
import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import assert from "node:assert/strict";

process.env.RESUME_WEBHOOK_SECRET = "whsec-test";
process.env.RESUME_CODE_SECRET = "code-secret-test-0123456789";
process.env.RESEND_API_KEY = "re_test";
process.env.RESUME_FROM_EMAIL = "Aaron <orders@example.com>";
process.env.RESUME_VARIANT_ID = "777";

const calls = [];
let emailStatus = 200;
globalThis.fetch = async (url, opts) => {
  calls.push({ url: String(url), body: opts?.body ? JSON.parse(opts.body) : null });
  if (String(url).includes("resend.com")) return new Response("{}", { status: emailStatus });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

const { default: webhook } = await import("../../api/resume-webhook.js");
const { default: unlock } = await import("../../api/resume-unlock.js");
const { makeCode, isDerivedCode } = await import("../../api/_resumeCodes.js");

const run = async (handler, { method = "POST", raw, headers = {}, body }) => {
  const req = raw !== undefined ? Object.assign(Readable.from([Buffer.from(raw)]), { method, headers }) : { method, headers: { "x-forwarded-for": `1.2.3.${Math.random()}`, ...headers }, body };
  const out = {};
  const res = { setHeader() {}, status(s) { out.status = s; return this; }, json(b) { out.body = b; return this; } };
  await handler(req, res);
  return out;
};
const order = (over = {}) => JSON.stringify({ meta: { event_name: "order_created" }, data: { type: "orders", id: "4821", attributes: { status: "paid", user_email: "Buyer@Example.com", user_name: "Buyer", first_order_item: { variant_id: 777 }, ...over } } });
const sign = (raw, secret = "whsec-test") => createHmac("sha256", secret).update(raw).digest("hex");
const post = (raw, sig = sign(raw)) => run(webhook, { raw, headers: { "x-signature": sig } });

let t = 0;
const ok = (name) => console.log(`PASS  ${name}`) || t++;

// 1. paid order: records in sheet, emails the code
let r = await post(order());
assert.equal(r.status, 200);
assert.equal(r.body.emailed, true);
const mail = calls.find((c) => c.url.includes("resend.com"));
const sheet = calls.find((c) => c.url.includes("script.google.com"));
const code = makeCode("4821");
assert.ok(mail.body.text.includes(code), "email contains the code");
assert.deepEqual(mail.body.to, ["buyer@example.com"]);
assert.ok(sheet.body.fields.message.includes(code) && sheet.body.kind === "builder" && sheet.body.cid === "lemon-order-4821");
ok("paid order is recorded in the sheet and the code is emailed");

// 2. the emailed code unlocks; tampering does not
assert.equal((await run(unlock, { body: { code: code.toLowerCase() } })).status, 200);
assert.equal((await run(unlock, { body: { code: "RS-" + code.slice(3, -1) + (code.endsWith("A") ? "B" : "A") } })).status, 401);
assert.equal((await run(unlock, { body: { code: "RS-ZZZ-AAAAAAAA" } })).status, 401);
assert.ok(isDerivedCode(code) && !isDerivedCode("RS-1-AAAAAAAA"));
ok("derived code unlocks, tampered and invented codes are rejected");

// 3. bad signature, unpaid, other product, other event
calls.length = 0;
assert.equal((await post(order(), "deadbeef")).status, 401);
assert.equal((await post(order({ status: "refunded" }))).body.ignored, "not paid");
assert.equal((await post(order({ first_order_item: { variant_id: 1 } }))).body.ignored, "other product");
const sub = JSON.stringify({ meta: { event_name: "subscription_created" }, data: { type: "subscriptions", id: "1", attributes: {} } });
assert.equal((await post(sub)).body.ignored, true);
assert.equal(calls.length, 0, "nothing sent for rejected or ignored events");
ok("bad signature, unpaid, other product and other events do nothing");

// 4. email failure asks the provider to retry, but the sheet still has the code
emailStatus = 500;
calls.length = 0;
r = await post(order({ user_email: "x@example.com" }));
assert.equal(r.status, 502);
assert.ok(calls.some((c) => c.url.includes("script.google.com")));
emailStatus = 200;
ok("email failure returns 502 so the provider retries, and the sheet row exists");

// 5. no email service configured: still 200 and the sheet says to send by hand
delete process.env.RESEND_API_KEY;
calls.length = 0;
r = await post(order({ user_email: "y@example.com" }));
assert.equal(r.status, 200);
assert.equal(r.body.emailed, false);
assert.ok(calls[0].body.fields.message.includes("NOT sent"));
ok("without an email service the sheet row tells you to send the code by hand");

// 6. wrong method and missing config
assert.equal((await run(webhook, { method: "GET", raw: "" })).status, 405);
delete process.env.RESUME_WEBHOOK_SECRET;
assert.equal((await post(order())).status, 503);
ok("GET is refused and a missing secret returns 503");

console.log(`\n${t} groups passed`);
