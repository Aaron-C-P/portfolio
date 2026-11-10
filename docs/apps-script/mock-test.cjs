// Runs Code.gs against a small mock of Google's services:  node docs/apps-script/mock-test.cjs
// It checks the handler logic only. It cannot check Sheets formulas or real Google quotas.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const rows = [];
const mails = [];
const cacheStore = new Map();
const propStore = new Map([["SHEET_ID", "mock"]]);

const sheet = {
  appendRow: (r) => rows.push(r),
  getSheetByName: () => sheet,
};
const sandbox = {
  ContentService: {
    MimeType: { JSON: "json" },
    createTextOutput: (t) => ({ t, setMimeType() { return this; }, getContent: () => t }),
  },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
  CacheService: {
    getScriptCache: () => ({
      get: (k) => cacheStore.get(k) ?? null,
      put: (k, v) => cacheStore.set(k, v),
    }),
  },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => propStore.get(k) ?? null, setProperty: (k, v) => propStore.set(k, v) }) },
  SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet, getUrl: () => "https://sheet.example" }) },
  Session: { getEffectiveUser: () => ({ getEmail: () => "owner@example.com" }) },
  MailApp: { sendEmail: (m) => mails.push(m) },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    DigestAlgorithm: { MD5: "md5" },
    computeDigest: (_a, s) => [...crypto.createHash("md5").update(s).digest()].map((b) => (b > 127 ? b - 256 : b)),
  },
  Logger: { log() {} },
  console,
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "Code.gs"), "utf8"), sandbox);

const post = (payload) => JSON.parse(sandbox.doPost({ postData: { contents: typeof payload === "string" ? payload : JSON.stringify(payload) } }).getContent());
const lead = (over = {}, fields = {}, meta = {}) => ({
  kind: "contact",
  cid: crypto.randomUUID(),
  fields: { name: "Ada", email: `ada${Math.random().toString(36).slice(2)}@example.com`, topic: "Web", message: "Hello there", ...fields },
  meta: { page: "/contact", referrer: "", device: "desktop", viewport: "1280x800", timezone: "America/Jamaica", ...meta },
  ...over,
});

let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
  if (!ok) failed++;
};

// health
check("GET returns ok", JSON.parse(sandbox.doGet().getContent()).ok === true);

// valid leads
let r = post(lead());
check("valid contact is stored", r.ok && /^L-[0-9a-f]{8}$/.test(r.id) && rows.length === 1);
check("owner is emailed with reply-to set", mails.length === 1 && mails[0].to === "owner@example.com" && mails[0].replyTo === rows[0][4]);
check("row has 17 columns, Status New", rows[0].length === 17 && rows[0][16] === "New");
r = post(lead({ kind: "resume" }, { message: "", topic: "", organisation: "Acme" }));
check("résumé request needs no message", r.ok && rows[1][2] === "resume" && rows[1][6] === "Acme");

// rejection
const before = rows.length;
check("bad kind rejected", post(lead({ kind: "admin" })).error === "bad_kind");
check("bad email rejected", post(lead({}, { email: "nope" })).error === "bad_email");
check("missing name rejected", post(lead({}, { name: " " })).error === "missing_name");
check("contact without message rejected", post(lead({}, { message: "" })).error === "missing_message");
check("broken JSON handled", post("{not json").error === "server");
check("empty body handled", JSON.parse(sandbox.doPost({}).getContent()).error === "empty");
check("oversized body rejected", post("x".repeat(20001)).error === "too_large");
check("honeypot fills are dropped silently", post(lead({}, { website: "spam.com" })).id === "ignored");
check("nothing rejected was stored", rows.length === before);

// safety
post(lead({}, { name: "=HYPERLINK(\"http://evil\")", message: "+1+1" }));
const last = rows[rows.length - 1];
check("formula injection is neutralised", last[3].startsWith("'=") && last[7].startsWith("'+"));
post(lead({}, { message: "y".repeat(9000) }));
check("long messages are capped at 5000", rows[rows.length - 1][7].length === 5000);

// retries and rate limit
const retry = lead();
const first = post(retry);
const again = post(retry);
check("same client id is not written twice", first.id === again.id && again.duplicate === true);
const flood = "flood@example.com";
const results = Array.from({ length: 8 }, () => post(lead({}, { email: flood })));
check("6th message from one address is rate limited", results.filter((x) => x.ok).length === 5 && results[5].error === "rate_limited");
const t = post(lead({}, { email: "load@test.invalid" }));
check("test.invalid addresses are marked TEST, not emailed", t.ok && rows[rows.length - 1][16] === "TEST" && mails.every((m) => !/load@/.test(m.replyTo)));

// source attribution
post(lead({}, {}, { utm_source: "linkedin" }));
post(lead({}, {}, { referrer: "https://www.google.com/search?q=x" }));
post(lead({}, {}, { referrer: "https://aaronprince.vercel.app/work" }));
const srcs = rows.slice(-3).map((x) => x[10]);
check("source: utm, referrer host, then direct", srcs.join() === "linkedin,google.com,direct", srcs.join());

// volume
const t0 = Date.now();
const startRows = rows.length;
const ids = new Set();
for (let i = 0; i < 2000; i++) ids.add(post(lead({}, { email: `u${i}@test.invalid` })).id);
check("2000 leads in a row, all with unique ids", ids.size === 2000 && rows.length === startRows + 2000, `${Date.now() - t0} ms`);

console.log(failed ? `\n${failed} FAILED` : "\nAll passed");
process.exit(failed ? 1 : 0);
