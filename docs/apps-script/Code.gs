/**
 * Portfolio lead collector (Google Apps Script web app).
 *
 * Receives contact and résumé requests from aaronprince.vercel.app, stores them in a
 * Google Sheet ("Leads"), builds a "Dashboard" tab with the numbers and a short written
 * summary, and emails the owner. Setup steps are in README.md.
 */

var KINDS = ["contact", "resume"];
var HEADERS = [
  "Timestamp", "ID", "Kind", "Name", "Email", "Topic", "Organisation", "Message",
  "Page", "Referrer", "Source", "Medium", "Campaign", "Device", "Viewport", "Timezone", "Status",
];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var MAX_PER_HOUR = 5; // per email address, so one person cannot flood the sheet

function doGet() {
  return json_({ ok: true, service: "portfolio-leads" });
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw) return json_({ ok: false, error: "empty" });
    if (raw.length > 20000) return json_({ ok: false, error: "too_large" });

    var body = JSON.parse(raw);
    var f = body.fields || {};
    var m = body.meta || {};
    if (body.action) return admin_(body);
    var kind = String(body.kind || "").toLowerCase();

    if (f.website) return json_({ ok: true, id: "ignored" }); // honeypot: bots fill hidden fields
    if (KINDS.indexOf(kind) === -1) return json_({ ok: false, error: "bad_kind" });

    var email = clean_(f.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) return json_({ ok: false, error: "bad_email" });
    var name = clean_(f.name, 120);
    var message = clean_(f.message, 5000);
    if (!name) return json_({ ok: false, error: "missing_name" });
    if (kind === "contact" && !message) return json_({ ok: false, error: "missing_message" });

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
        isTest ? "TEST" : "New",
      ]);
    } finally {
      lock.releaseLock();
    }
    if (cid) cache.put("cid:" + cid, id, 600);
    if (!isTest) notify_(kind, id, name, email, clean_(f.topic, 120), message, clean_(f.organisation, 160));
    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: "server" });
  }
}

/* ---------- admin: only answers when the password matches ---------- */

var ADMIN_STATUSES = ["New", "Replied", "Archived"];
var MAX_ADMIN_FAILS = 8; // wrong passwords allowed per 15 minutes, across everyone

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
  if (body.action === "admin_list") {
    var values = sh.getDataRange().getValues();
    var leads = [];
    for (var i = values.length - 1; i >= 1 && leads.length < 1000; i--) {
      var row = {};
      for (var c = 0; c < HEADERS.length; c++) {
        var v = values[i][c];
        row[HEADERS[c]] = v instanceof Date ? v.toISOString() : String(v == null ? "" : v).replace(/^'(?=[=+\-@])/, "");
      }
      leads.push(row);
    }
    return json_({ ok: true, leads: leads });
  }
  if (body.action === "admin_update") {
    var status = String(body.status || "");
    if (ADMIN_STATUSES.indexOf(status) === -1) return json_({ ok: false, error: "bad_status" });
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) return json_({ ok: false, error: "busy" });
    try {
      var ids = sh.getRange(1, 2, sh.getLastRow(), 1).getValues();
      for (var r = 1; r < ids.length; r++) {
        if (ids[r][0] === body.id) {
          sh.getRange(r + 1, 17).setValue(status);
          return json_({ ok: true });
        }
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: false, error: "not_found" });
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
  }
  return sh;
}

function notify_(kind, id, name, email, topic, message, org) {
  try {
    var to = props_().getProperty("NOTIFY_EMAIL") || Session.getEffectiveUser().getEmail();
    if (!to) return;
    var lines = [
      (kind === "resume" ? "Résumé request" : "New contact message") + " (" + id + ")",
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
      subject: (kind === "resume" ? "Résumé request: " : "Portfolio message: ") + name,
      body: lines.join("\n"),
    });
  } catch (err) {
    // Storing the lead matters more than the email; ignore mail quota errors.
  }
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
