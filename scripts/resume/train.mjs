// Trains the bullet-strength model (logistic regression on a few readable features) and writes
// src/data/bulletModel.json. Run:  node scripts/resume/train.mjs
// The features are defined in src/lib/resumeEngine.ts (bulletFeatures) and MUST match FEATURES below.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

export const FEATURES = ["bias", "hasNumber", "hasPercentOrMoney", "startsWithVerb", "weakPhrase", "lengthOk", "tooShort", "firstPerson", "hasResultWord"];

const VERBS = new Set("built reduced increased led designed resolved automated trained diagnosed managed wrote analysed analyzed improved coordinated launched cut presented mentored implemented tested negotiated supported migrated organised organized streamlined developed created delivered saved grew raised fixed optimised optimized introduced rebuilt secured identified halved".split(" "));
const WEAK = /(responsible for|duties|helped with|helped out|worked on|in charge|assisted|team player|hard working|various|general|involved in|tasked|took care|dealt with|part of)/i;

export function features(text) {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const first = (words[0] || "").toLowerCase().replace(/[^a-z]/g, "");
  return [
    1,
    /\d/.test(t) ? 1 : 0,
    /(\d\s?%|\$\s?\d|\d\s?(k|m)\b)/i.test(t) ? 1 : 0,
    VERBS.has(first) ? 1 : 0,
    WEAK.test(t) ? 1 : 0,
    words.length >= 8 && words.length <= 28 ? 1 : 0,
    words.length < 6 ? 1 : 0,
    /\b(i|my|me)\b/i.test(t) ? 1 : 0,
    /(reduc|increas|improv|cut|sav|grew|rais|halv|fill|recover|secur|deliver)/i.test(t) ? 1 : 0,
  ];
}

const rows = fs
  .readFileSync(path.join(here, "examples.txt"), "utf8")
  .split(/\r?\n/)
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => {
    const i = l.indexOf("|");
    return { y: l.slice(0, i).trim() === "strong" ? 1 : 0, x: features(l.slice(i + 1)) };
  });

const sigmoid = (z) => 1 / (1 + Math.exp(-z));
function fit(data, epochs = 4000, lr = 0.3, l2 = 0.01) {
  const w = new Array(FEATURES.length).fill(0);
  for (let e = 0; e < epochs; e++) {
    const g = new Array(w.length).fill(0);
    for (const { x, y } of data) {
      const p = sigmoid(x.reduce((s, v, i) => s + v * w[i], 0));
      x.forEach((v, i) => (g[i] += (p - y) * v));
    }
    w.forEach((_, i) => (w[i] -= (lr * (g[i] + (i ? l2 * w[i] : 0))) / data.length));
  }
  return w;
}
const predict = (w, x) => sigmoid(x.reduce((s, v, i) => s + v * w[i], 0));

// 5-fold cross validation so the accuracy is not measured on the training rows.
const shuffled = [...rows].sort(() => 0.5 - Math.random());
let right = 0;
for (let k = 0; k < 5; k++) {
  const test = shuffled.filter((_, i) => i % 5 === k);
  const train = shuffled.filter((_, i) => i % 5 !== k);
  const w = fit(train);
  right += test.filter((r) => (predict(w, r.x) >= 0.5 ? 1 : 0) === r.y).length;
}
const weights = fit(rows);
const model = { features: FEATURES, weights: weights.map((v) => +v.toFixed(4)), examples: rows.length, cvAccuracy: +(right / rows.length).toFixed(3), trainer: "train.mjs" };
fs.writeFileSync(path.join(root, "src/data/bulletModel.json"), JSON.stringify(model, null, 2) + "\n");
console.log(`trained on ${rows.length} bullets, 5-fold CV accuracy ${model.cvAccuracy}`);
console.log(Object.fromEntries(FEATURES.map((f, i) => [f, model.weights[i]])));
