/**
 * Portfolio lead collector (Google Apps Script web app).
 *
 * Receives contact and résumé requests from aaronprince.vercel.app, stores them in a
 * Google Sheet ("Leads"), builds a "Dashboard" tab with the numbers and a short written
 * summary, and emails the owner. Setup steps are in README.md.
 */

var KINDS = ["contact", "resume", "booking", "testimonial"];
var HEADERS = [
  "Timestamp", "ID", "Kind", "Name", "Email", "Topic", "Organisation", "Message",
  "Page", "Referrer", "Source", "Medium", "Campaign", "Device", "Viewport", "Timezone", "Status", "Notes",
  "Token", "Priority", "Intent",
];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var MAX_PER_HOUR = 5; // per email address, so one person cannot flood the sheet

function doGet() {
  return json_({ ok: true, service: "portfolio-leads", available: props_().getProperty("AVAILABLE") === "on" });
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw) return json_({ ok: false, error: "empty" });
    if (raw.length > 20000) return json_({ ok: false, error: "too_large" });

    var body = JSON.parse(raw);
    var f = body.fields || {};
    var m = body.meta || {};
    if (body.action && String(body.action).indexOf("chat_") === 0) return chat_(body);
    if (body.action) return admin_(body);
    var kind = String(body.kind || "").toLowerCase();

    if (f.website) return json_({ ok: true, id: "ignored" }); // honeypot: bots fill hidden fields
    if (KINDS.indexOf(kind) === -1) return json_({ ok: false, error: "bad_kind" });

    var email = clean_(f.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) return json_({ ok: false, error: "bad_email" });
    var name = clean_(f.name, 120);
    var message = clean_(f.message, 5000);
    if (!name) return json_({ ok: false, error: "missing_name" });
    if ((kind === "contact" || kind === "booking" || kind === "testimonial") && !message) return json_({ ok: false, error: "missing_message" });

    // A retry from the browser carries the same client id: answer ok without writing twice.
    var cache = CacheService.getScriptCache();
    var cid = clean_(body.cid, 80);
    if (cid) {
      var seen = cache.get("cid:" + cid);
      if (seen) return json_({ ok: true, id: seen, duplicate: true });
    }

    var isTest = /@test\.invalid$/.test(email);
    if (!isTest && tooMany_(cache, email)) return json_({ ok: false, error: "rate_limited" });

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) return json_({ ok: false, error: "busy" });
    var id = "L-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8);
    try {
      leadsSheet_().appendRow([
        new Date(), id, kind, name, email,
        clean_(f.topic, 120), clean_(f.organisation, 160), message,
        clean_(m.page, 200), clean_(m.referrer, 300), source_(m),
        clean_(m.utm_medium, 80), clean_(m.utm_campaign, 120),
        clean_(m.device, 20), clean_(m.viewport, 20), clean_(m.timezone, 60),
        isTest ? "TEST" : "New", "", "", "", "",
      ]);
    } finally {
      lock.releaseLock();
    }
    if (cid) cache.put("cid:" + cid, id, 600);
    if (!isTest) {
      notify_(kind, id, name, email, clean_(f.topic, 120), message, clean_(f.organisation, 160));
      autoReply_(kind, name, email, clean_(f.topic, 120));
    }
    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: "server" });
  }
}

/* ---------- admin: only answers when the password matches ---------- */

var ADMIN_STATUSES = ["New", "Replied", "Archived"];
var MAX_ADMIN_FAILS = 8; // wrong passwords allowed per 15 minutes, across everyone
var MAX_BATCH = 200;
var COL = { kind: 3, name: 4, email: 5, topic: 6, organisation: 7, message: 8, status: 17, notes: 18, token: 19, priority: 20 };
var ADMIN_KINDS = ["contact", "resume", "chat", "booking", "testimonial"];

/** Compares without stopping at the first difference, so timing reveals nothing. */
function same_(a, b) {
  a = String(a);
  b = String(b);
  var diff = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function isDate_(v) {
  return Object.prototype.toString.call(v) === "[object Date]";
}

function leadFromRow_(values) {
  var row = {};
  for (var c = 0; c < HEADERS.length; c++) {
    var v = values[c];
    if (HEADERS[c] === "Token") continue;
    row[HEADERS[c]] = isDate_(v) ? v.toISOString() : String(v == null ? "" : v).replace(/^'(?=[=+\-@])/, "");
  }
  return row;
}

/** Row number (1-based, header is row 1) of a lead id, or 0. */
function findRow_(sh, id) {
  var ids = sh.getRange(1, 2, sh.getLastRow(), 1).getValues();
  for (var r = 1; r < ids.length; r++) if (ids[r][0] === id) return r + 1;
  return 0;
}

function idsFrom_(body) {
  var ids = body.ids || (body.id ? [body.id] : []);
  if (!Array.isArray(ids) || !ids.length || ids.length > MAX_BATCH) return null;
  return ids.map(String);
}

function admin_(body) {
  var secret = props_().getProperty("ADMIN_KEY");
  if (!secret) return json_({ ok: false, error: "admin_disabled" });
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get("admin:fails") || 0);
  if (fails >= MAX_ADMIN_FAILS) return json_({ ok: false, error: "locked" });
  if (!same_(body.key || "", secret)) {
    cache.put("admin:fails", String(fails + 1), 900);
    return json_({ ok: false, error: "wrong_password" });
  }
  cache.remove("admin:fails");

  var sh = leadsSheet_();
  var action = body.action;

  if (action === "admin_list") {
    var values = sh.getDataRange().getValues();
    var leads = [];
    for (var i = values.length - 1; i >= 1 && leads.length < 1000; i--) leads.push(leadFromRow_(values[i]));
    return json_({ ok: true, leads: leads });
  }

  if (action === "admin_thread") {
    var tid = String(body.id || "");
    var trow = findRow_(sh, tid);
    if (!trow) return json_({ ok: false, error: "not_found" });
    return json_({ ok: true, messages: threadFor_(tid), available: available_() });
  }

  if (action === "admin_reply") {
    var rid = String(body.id || "");
    var rtext = clean_(body.text, 2000);
    if (!rtext) return json_({ ok: false, error: "empty" });
    var rrow = findRow_(sh, rid);
    if (!rrow) return json_({ ok: false, error: "not_found" });
    say_(rid, "aaron", rtext);
    var to = String(sh.getRange(rrow, COL.email).getValue());
    var sendCopy = String(sh.getRange(rrow, COL.status).getValue()) !== "TEST";
    if (sendCopy) sh.getRange(rrow, COL.status).setValue("Replied");
    if (sendCopy) {
      try {
        MailApp.sendEmail({ to: to, replyTo: notifyTo_(), name: "Aaron Prince", subject: "Aaron replied to your chat", body: rtext + "\n\nYou can reply to this email, or carry on in the chat on aaronprince.vercel.app." });
      } catch (err) {
        // the reply is stored and shows in the chat either way
      }
    }
    return json_({ ok: true, messages: threadFor_(rid) });
  }

  if (action === "admin_available") {
    props_().setProperty("AVAILABLE", body.available ? "on" : "off");
    return json_({ ok: true, available: available_() });
  }

  if (action !== "admin_create" && action !== "admin_update" && action !== "admin_delete") {
    return json_({ ok: false, error: "bad_action" });
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return json_({ ok: false, error: "busy" });
  try {
    if (action === "admin_create") {
      var f = body.fields || {};
      var email = clean_(f.email, 200).toLowerCase();
      var name = clean_(f.name, 120);
      var kind = String(f.kind || "contact").toLowerCase();
      var status = String(f.status || "New");
      if (!name) return json_({ ok: false, error: "missing_name" });
      if (!EMAIL_RE.test(email)) return json_({ ok: false, error: "bad_email" });
      if (ADMIN_KINDS.indexOf(kind) === -1) return json_({ ok: false, error: "bad_kind" });
      if (ADMIN_STATUSES.indexOf(status) === -1) return json_({ ok: false, error: "bad_status" });
      var id = "L-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8);
      var rowValues = [
        new Date(), id, kind, name, email, clean_(f.topic, 120), clean_(f.organisation, 160), clean_(f.message, 5000),
        "admin", "", "manual", "", "", "", "", "", status, clean_(f.notes, 2000), "", "", "",
      ];
      sh.appendRow(rowValues);
      return json_({ ok: true, lead: leadFromRow_(rowValues) });
    }

    var ids = idsFrom_(body);
    if (!ids) return json_({ ok: false, error: "bad_ids" });

    if (action === "admin_delete") {
      var rowsToDelete = [];
      ids.forEach(function (x) {
        var r = findRow_(sh, x);
        if (r) rowsToDelete.push(r);
      });
      rowsToDelete.sort(function (p, q) { return q - p; }); // bottom first, so row numbers stay valid
      rowsToDelete.forEach(function (r) { sh.deleteRow(r); });
      return json_({ ok: true, deleted: rowsToDelete.length, missing: ids.length - rowsToDelete.length });
    }

    // admin_update: a status for one or many leads, or edited fields for exactly one.
    var patch = {};
    if (body.status !== undefined) {
      if (ADMIN_STATUSES.indexOf(String(body.status)) === -1) return json_({ ok: false, error: "bad_status" });
      patch[COL.status] = String(body.status);
    }
    var fl = body.fields;
    if (fl) {
      if (ids.length !== 1) return json_({ ok: false, error: "bad_ids" });
      if (fl.name !== undefined) {
        patch[COL.name] = clean_(fl.name, 120);
        if (!patch[COL.name]) return json_({ ok: false, error: "missing_name" });
      }
      if (fl.email !== undefined) {
        patch[COL.email] = clean_(fl.email, 200).toLowerCase();
        if (!EMAIL_RE.test(patch[COL.email])) return json_({ ok: false, error: "bad_email" });
      }
      if (fl.kind !== undefined) {
        if (ADMIN_KINDS.indexOf(String(fl.kind)) === -1) return json_({ ok: false, error: "bad_kind" });
        patch[COL.kind] = String(fl.kind);
      }
      if (fl.topic !== undefined) patch[COL.topic] = clean_(fl.topic, 120);
      if (fl.organisation !== undefined) patch[COL.organisation] = clean_(fl.organisation, 160);
      if (fl.message !== undefined) patch[COL.message] = clean_(fl.message, 5000);
      if (fl.notes !== undefined) patch[COL.notes] = clean_(fl.notes, 2000);
    }
    if (!Object.keys(patch).length) return json_({ ok: false, error: "nothing_to_update" });

    var updated = [];
    ids.forEach(function (x) {
      var r = findRow_(sh, x);
      if (!r) return;
      Object.keys(patch).forEach(function (col) { sh.getRange(r, Number(col)).setValue(patch[col]); });
      updated.push(leadFromRow_(sh.getRange(r, 1, 1, HEADERS.length).getValues()[0]));
    });
    if (!updated.length) return json_({ ok: false, error: "not_found" });
    return json_({ ok: true, updated: updated.length, leads: updated });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- live handoff: a real person behind the assistant ---------- */

var INTENTS = ["about_work", "frustrated_or_complex", "hire_intent", "human_request", "job_opportunity", "smalltalk", "student_help"];
var PRIORITIES = ["hot", "warm", "normal"];
var MAX_THREAD = 300; // messages per conversation

function chatSheet_() {
  var ss = spreadsheet_();
  var sh = ss.getSheetByName("Chat");
  if (!sh) {
    sh = ss.insertSheet("Chat");
    sh.appendRow(["Timestamp", "LeadID", "From", "Text"]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function threadFor_(id) {
  var v = chatSheet_().getDataRange().getValues();
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (v[i][1] === id) out.push({ from: String(v[i][2]), text: String(v[i][3]), at: isDate_(v[i][0]) ? v[i][0].toISOString() : "" });
  }
  return out;
}

function say_(id, from, text) {
  chatSheet_().appendRow([new Date(), id, from, clean_(text, 2000)]);
}

function available_() {
  return props_().getProperty("AVAILABLE") === "on";
}

/** The conversation's row, only when the visitor's secret key matches. */
function chatRow_(cache, id, token) {
  var failKey = "ctf:" + id;
  if (Number(cache.get(failKey) || 0) >= 10) return 0; // a guessed key locks that conversation for 15 minutes
  var sh = leadsSheet_();
  var row = findRow_(sh, String(id || ""));
  var stored = row ? String(sh.getRange(row, COL.token).getValue() || "") : "";
  if (!row || !stored || !same_(String(token || ""), stored)) {
    cache.put(failKey, String(Number(cache.get(failKey) || 0) + 1), 900);
    return 0;
  }
  return row;
}

function chat_(body) {
  var cache = CacheService.getScriptCache();
  var action = body.action;

  if (action === "chat_start") {
    var f = body.fields || {};
    var email = clean_(f.email, 200).toLowerCase();
    var name = clean_(f.name, 120);
    if (!name) return json_({ ok: false, error: "missing_name" });
    if (!EMAIL_RE.test(email)) return json_({ ok: false, error: "bad_email" });
    var cid = clean_(body.cid, 80);
    if (cid) {
      var seen = cache.get("cid:" + cid);
      if (seen) return json_({ ok: true, id: seen.split("|")[0], token: seen.split("|")[1], duplicate: true });
    }
    var isTest = /@test\.invalid$/.test(email);
    if (!isTest && tooMany_(cache, email)) return json_({ ok: false, error: "rate_limited" });

    var meta = body.meta || {};
    var intent = INTENTS.indexOf(String(meta.intent)) === -1 ? "" : String(meta.intent);
    var priority = PRIORITIES.indexOf(String(meta.priority)) === -1 ? "normal" : String(meta.priority);
    var first = clean_(f.message, 2000) || "Asked to speak to a person.";
    var transcript = Array.isArray(body.transcript) ? body.transcript.slice(-20) : [];

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) return json_({ ok: false, error: "busy" });
    var id = "L-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8);
    var token = Utilities.getUuid().replace(/-/g, "");
    try {
      var rowValues = [
        new Date(), id, "chat", name, email, "Live chat", "", first,
        clean_(meta.page, 200), "", "assistant", "", "", clean_(meta.device, 20), "", "",
        isTest ? "TEST" : "New", "", token, priority, intent,
      ];
      leadsSheet_().appendRow(rowValues);
      transcript.forEach(function (t) {
        say_(id, t && t.from === "ai" ? "ai" : "visitor", t && t.text);
      });
      say_(id, "visitor", first);
    } finally {
      lock.releaseLock();
    }
    if (cid) cache.put("cid:" + cid, id + "|" + token, 600);
    if (!isTest) {
      try {
        MailApp.sendEmail({
          to: notifyTo_(),
          replyTo: email,
          subject: "LIVE CHAT (" + priority + "): " + name,
          body: ["A visitor asked for you through the assistant.", "", "Name: " + name, "Email: " + email, intent ? "Looks like: " + intent : "", "", first, "", "Answer in the Chat view at aaronprince.vercel.app/admin, or just reply to this email."].join("\n"),
        });
      } catch (err) {
        // the lead is stored; the email is a convenience
      }
    }
    return json_({ ok: true, id: id, token: token, available: available_() });
  }

  var row = chatRow_(cache, body.id, body.token);
  if (!row) return json_({ ok: false, error: "no_access" });
  var sh = leadsSheet_();

  if (action === "chat_poll") {
    var have = Math.max(0, Number(body.have) || 0);
    var all = threadFor_(String(body.id));
    return json_({ ok: true, messages: all.slice(have), total: all.length, available: available_() });
  }

  if (action === "chat_send") {
    var text = clean_(body.text, 1000);
    if (!text) return json_({ ok: false, error: "empty" });
    var lk = LockService.getScriptLock();
    if (!lk.tryLock(25000)) return json_({ ok: false, error: "busy" });
    try {
      if (threadFor_(String(body.id)).length >= MAX_THREAD) return json_({ ok: false, error: "thread_full" });
      say_(String(body.id), "visitor", text);
      if (sh.getRange(row, COL.status).getValue() !== "TEST") sh.getRange(row, COL.status).setValue("New");
    } finally {
      lk.releaseLock();
    }
    // One email per conversation every 5 minutes, so a chatty visitor does not flood you.
    if (!cache.get("cn:" + body.id) && sh.getRange(row, COL.status).getValue() !== "TEST") {
      cache.put("cn:" + body.id, "1", 300);
      try {
        MailApp.sendEmail({ to: notifyTo_(), replyTo: String(sh.getRange(row, COL.email).getValue()), subject: "Live chat message from " + sh.getRange(row, COL.name).getValue(), body: text + "\n\nAnswer in the Chat view at aaronprince.vercel.app/admin" });
      } catch (err) {
        // ignore mail quota errors
      }
    }
    return json_({ ok: true });
  }
  return json_({ ok: false, error: "bad_action" });
}

/* ---------- helpers ---------- */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Trims, caps the length and defuses spreadsheet formulas (=, +, -, @ at the start). */
function clean_(value, max) {
  var v = value == null ? "" : String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  if (v.length > max) v = v.slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function source_(m) {
  var utm = clean_(m.utm_source, 80);
  if (utm) return utm;
  var ref = String(m.referrer || "");
  var host = ref.match(/^https?:\/\/([^\/?#]+)/i);
  if (host && !/aaronprince\.vercel\.app$/i.test(host[1])) return host[1].replace(/^www\./, "");
  return "direct";
}

function tooMany_(cache, email) {
  var key = "rl:" + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, email).map(function (b) {
    return ("0" + (b & 0xff).toString(16)).slice(-2);
  }).join("");
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 3600);
  return n > MAX_PER_HOUR;
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function spreadsheet_() {
  var id = props_().getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    props_().setProperty("SHEET_ID", active.getId());
    return active;
  }
  var created = SpreadsheetApp.create("Portfolio Leads");
  props_().setProperty("SHEET_ID", created.getId());
  return created;
}

function leadsSheet_() {
  var ss = spreadsheet_();
  var sh = ss.getSheetByName("Leads");
  if (!sh) {
    sh = ss.insertSheet("Leads");
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#ede9fe");
    sh.getRange("A2:A").setNumberFormat("yyyy-mm-dd hh:mm");
    sh.setColumnWidth(8, 420);
  } else if (sh.getLastColumn() < HEADERS.length) {
    // Sheets created before the Notes column existed get the new header.
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setBackground("#ede9fe");
  }
  return sh;
}

function notifyTo_() {
  return props_().getProperty("NOTIFY_EMAIL") || Session.getEffectiveUser().getEmail();
}

function notify_(kind, id, name, email, topic, message, org) {
  try {
    var to = notifyTo_();
    if (!to) return;
    var lines = [
      (kind === "resume" ? "Résumé request" : kind === "booking" ? "Call booking request" : kind === "testimonial" ? "New testimonial (not public until you add it)" : "New contact message") + " (" + id + ")",
      "",
      "Name: " + name,
      "Email: " + email,
    ];
    if (topic) lines.push("Topic: " + topic);
    if (org) lines.push("Company or role: " + org);
    if (message) lines.push("", message);
    lines.push("", "Everything is stored in the Leads sheet: " + spreadsheet_().getUrl());
    MailApp.sendEmail({
      to: to,
      replyTo: email,
      subject: (kind === "resume" ? "Résumé request: " : kind === "booking" ? "BOOKING request: " : kind === "testimonial" ? "Testimonial: " : "Portfolio message: ") + name,
      body: lines.join("\n"),
    });
  } catch (err) {
    // Storing the lead matters more than the email; ignore mail quota errors.
  }
}

/* ---------- automation ---------- */

var MAX_AUTO_REPLIES_PER_DAY = 20; // keeps the form from being used to mail strangers

/**
 * Optional confirmation to the person who wrote in. It is off until you set the script
 * property AUTO_REPLY to "on", because it sends email from your account.
 */
function autoReply_(kind, name, email, topic) {
  try {
    if (props_().getProperty("AUTO_REPLY") !== "on" || kind === "testimonial") return false;
    var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var p = props_();
    var count = p.getProperty("AR_DAY") === today ? Number(p.getProperty("AR_COUNT") || 0) : 0;
    if (count >= MAX_AUTO_REPLIES_PER_DAY) return false;
    var cache = CacheService.getScriptCache();
    var seen = "ar:" + email;
    if (cache.get(seen)) return false; // one confirmation per address per few hours
    cache.put(seen, "1", 21600);
    p.setProperty("AR_DAY", today);
    p.setProperty("AR_COUNT", String(count + 1));

    var first = String(name).split(/\s+/)[0] || "there";
    var body = kind === "resume"
      ? "Hi " + first + ",\n\nThanks for asking for my résumé. I send it by email rather than posting it publicly, and I will reply to you personally soon.\n\nAaron Prince\n\n(This is an automatic confirmation that your request arrived.)"
      : kind === "booking"
      ? "Hi " + first + ",\n\nThanks for asking for a call. I will confirm a time by email or WhatsApp, usually within a day.\n\nAaron Prince\n\n(This is an automatic confirmation that your request arrived. The call is not booked until I confirm it.)"
      : "Hi " + first + ",\n\nThanks for getting in touch" + (topic ? " about " + topic.toLowerCase() : "") + ". I read every message myself and will reply by email, usually within a couple of days.\n\nAaron Prince\n\n(This is an automatic confirmation that your message arrived.)";
    MailApp.sendEmail({
      to: email,
      replyTo: notifyTo_(),
      name: "Aaron Prince",
      subject: kind === "resume" ? "I got your résumé request" : "I got your message",
      body: body,
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Morning email: new leads from the last 24 hours and leads that have waited two days or
 * more without a reply. Sends nothing on quiet days. Run installTriggers once to schedule it.
 */
function sendDigest() {
  var to = notifyTo_();
  if (!to) return { sent: false };
  var values = leadsSheet_().getDataRange().getValues();
  var now = Date.now();
  var DAY = 86400000;
  var fresh = [];
  var stale = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (r[16] !== "New") continue; // only leads still waiting; TEST, Replied and Archived are skipped
    var age = now - (isDate_(r[0]) ? r[0].getTime() : now);
    var item = { name: r[3], email: r[4], kind: r[2], topic: r[5], days: Math.floor(age / DAY) };
    if (age < DAY) fresh.push(item);
    else if (age >= 2 * DAY) stale.push(item);
  }
  if (!fresh.length && !stale.length) return { sent: false };
  var line = function (x) {
    return "- " + x.name + " (" + x.email + ")" + (x.kind === "resume" ? ", résumé request" : x.topic ? ", " + x.topic : "") + (x.days ? ", waiting " + x.days + " days" : "");
  };
  var lines = [];
  if (fresh.length) lines.push("New in the last 24 hours (" + fresh.length + "):", fresh.slice(0, 10).map(line).join("\n"), "");
  if (stale.length) lines.push("Still waiting for a reply after 2+ days (" + stale.length + "):", stale.slice(0, 10).map(line).join("\n"), "");
  lines.push("Reply, mark replied or archive them at aaronprince.vercel.app/admin");
  MailApp.sendEmail({
    to: to,
    subject: "Leads: " + fresh.length + " new, " + stale.length + " waiting",
    body: lines.join("\n"),
  });
  return { sent: true, fresh: fresh.length, stale: stale.length };
}

/** Run once from the editor: schedules sendDigest every morning around 8am. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendDigest") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendDigest").timeBased().everyDays(1).atHour(8).create();
  Logger.log("Daily digest scheduled for about 8am.");
}

/* ---------- one-time setup: run this once from the editor ---------- */

function setup() {
  var ss = spreadsheet_();
  leadsSheet_();
  if (!props_().getProperty("NOTIFY_EMAIL")) {
    props_().setProperty("NOTIFY_EMAIL", Session.getEffectiveUser().getEmail());
  }
  buildDashboard_(ss);
  Logger.log("Ready. Spreadsheet: " + ss.getUrl() + " | emails go to " + props_().getProperty("NOTIFY_EMAIL"));
}

function buildDashboard_(ss) {
  var d = ss.getSheetByName("Dashboard") || ss.insertSheet("Dashboard", 0);
  d.clear();
  d.getCharts().forEach(function (c) { d.removeChart(c); });

  // Test rows (Status = TEST) are left out of every number.
  var real = 'Leads!Q2:Q,"<>TEST"';
  d.getRange("A1").setValue("Portfolio leads").setFontSize(18).setFontWeight("bold");
  d.getRange("A3:B8").setFormulas([
    ["Total leads", '=COUNTIFS(Leads!A2:A,"<>",' + real + ")"],
    ["Last 7 days", '=COUNTIFS(Leads!A2:A,">="&(NOW()-7),' + real + ")"],
    ["Last 30 days", '=COUNTIFS(Leads!A2:A,">="&(NOW()-30),' + real + ")"],
    ["Waiting for a reply", '=COUNTIFS(Leads!Q2:Q,"New")'],
    ["Résumé requests", '=COUNTIFS(Leads!C2:C,"resume",' + real + ")"],
    ["Contact messages", '=COUNTIFS(Leads!C2:C,"contact",' + real + ")"],
  ]);
  d.getRange("A3:A8").setFontWeight("bold");

  d.getRange("A10").setValue("What people ask about").setFontWeight("bold");
  d.getRange("A11").setFormula(
    '=IFERROR(QUERY(Leads!A:Q,"select F, count(F) where F <> \'\' and Q <> \'TEST\' group by F order by count(F) desc label F \'Topic\', count(F) \'Leads\'",1),"No topics yet")'
  );
  d.getRange("D10").setValue("Where they come from").setFontWeight("bold");
  d.getRange("D11").setFormula(
    '=IFERROR(QUERY(Leads!A:Q,"select K, count(K) where K <> \'\' and Q <> \'TEST\' group by K order by count(K) desc label K \'Source\', count(K) \'Leads\'",1),"No sources yet")'
  );
  d.getRange("G10").setValue("Leads per day").setFontWeight("bold");
  d.getRange("G11").setFormula(
    '=IFERROR(QUERY(ARRAYFORMULA(IF((Leads!A2:A="")+(Leads!Q2:Q="TEST"),,INT(Leads!A2:A))),"select Col1, count(Col1) where Col1 is not null group by Col1 order by Col1 desc limit 30 label Col1 \'Day\', count(Col1) \'Leads\'",0),"No leads yet")'
  );
  d.getRange("G12:G41").setNumberFormat("d mmm");

  d.getRange("A20").setValue("The story so far").setFontWeight("bold");
  d.getRange("A21:H21").merge().setWrap(true).setVerticalAlignment("top").setFormula(
    '="In the last 7 days "&B4&IF(B4=1," person got"," people got")&" in touch ("&B5&" in the last 30). "' +
    '&IF(B3=0,"Nothing has come in yet, so there is no pattern to read.",' +
    '"Most asked about: "&IF(A12="","no topic chosen yet",A12)&". Most visitors arrive from: "&IF(D12="","not tracked yet",D12)&". "' +
    '&B6&IF(B6=1," message is"," messages are")&" still waiting for a reply.")'
  );
  d.setRowHeight(21, 70);

  d.setColumnWidths(1, 8, 150);
  var chart = d.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(d.getRange("G11:H41"))
    .setPosition(23, 1, 0, 0)
    .setOption("title", "Leads per day (last 30 days with activity)")
    .setOption("legend", { position: "none" })
    .build();
  d.insertChart(chart);
}
