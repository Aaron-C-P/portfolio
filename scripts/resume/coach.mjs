// Run: node scripts/resume/coach.mjs            -> coaching report (also written to docs/resume-coach-report.md)
//      node scripts/resume/coach.mjs --apply    -> also folds every APPROVED inbox entry into src/data/myResume.json
// Then commit and push: the résumé page uses the master directly, so the next deploy has the update.
import { readFileSync, writeFileSync } from "node:fs";
import { coach, applyLog } from "../../src/lib/resumeCoach.js";

const MASTER = new URL("../../src/data/myResume.json", import.meta.url);
const LOG = new URL("../../src/data/resumeLog.json", import.meta.url);
const REPORT = new URL("../../docs/resume-coach-report.md", import.meta.url);
const read = (u) => JSON.parse(readFileSync(u, "utf8"));
const write = (u, v) => writeFileSync(u, JSON.stringify(v, null, 2) + "\n");

let master = read(MASTER);
let log = read(LOG);
const today = new Date();

if (process.argv.includes("--apply")) {
  const r = applyLog(master, log, today);
  if (r.applied.length) {
    write(MASTER, r.master);
    write(LOG, r.log);
    console.log(`Applied ${r.applied.length} approved entr${r.applied.length === 1 ? "y" : "ies"} to the master résumé:`);
    for (const e of r.applied) console.log(`  + ${e.kind}: ${e.text || e.title || e.what}`);
    master = r.master;
    log = r.log;
  } else console.log("Nothing approved to apply.");
}

const { findings, moves } = coach(master, log, today);
const lines = [`# Résumé coach report`, ``, `Master last updated ${master.updated}. Inbox: ${log.entries.length} waiting, ${(log.applied || []).length} applied so far.`, ``, `## Next moves`, ...(moves.length ? moves.map((m) => `- ${m}`) : ["- Nothing urgent. Keep logging what you build."]), ``, `## Findings`, ...(findings.length ? findings.map((f) => `- **${f.level}** (${f.where}): ${f.msg}`) : ["- All clear."])];
writeFileSync(REPORT, lines.join("\n") + "\n");
console.log("\n" + lines.join("\n"));
