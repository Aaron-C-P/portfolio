// Trains the assistant's intent model.   node scripts/intent/train.mjs
//
// Same recipe as scikit-learn's  TfidfVectorizer(ngram_range=(1, 2)) + LogisticRegression(C=10):
// TF-IDF features (smooth idf, L2 norm) feeding a multinomial logistic regression with L2 penalty.
// It is written in plain Node because the owner's PC blocks scipy, so scikit-learn cannot run there.
// scripts/intent/train_sklearn.py is the scikit-learn version and writes the same JSON format.
//
// It reports 5-fold cross-validated accuracy, so the number you see is on examples the model
// was NOT trained on, then trains on everything and writes src/data/intentModel.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const C = Number(process.env.C ?? 3); // inverse regularisation strength, same meaning as in scikit-learn
const ITERATIONS = 600;

export const tokens = (text) => {
  const words = text.toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  const grams = [...words];
  for (let i = 0; i < words.length - 1; i++) grams.push(`${words[i]} ${words[i + 1]}`);
  return grams;
};

export const load = () =>
  fs
    .readFileSync(path.join(here, "examples.txt"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("|");
      return { label: l.slice(0, i).trim(), text: l.slice(i + 1).trim() };
    });

export function fit(rows, classes) {
  const docs = rows.map((r) => tokens(r.text));
  const df = new Map();
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const vocab = [...df.keys()].sort();
  const index = new Map(vocab.map((t, i) => [t, i]));
  const n = rows.length;
  const idf = vocab.map((t) => Math.log((1 + n) / (1 + df.get(t))) + 1);

  const vectorise = (grams) => {
    const counts = new Map();
    grams.forEach((g) => index.has(g) && counts.set(index.get(g), (counts.get(index.get(g)) ?? 0) + 1));
    let norm = 0;
    const entries = [...counts].map(([i, c]) => {
      const v = c * idf[i];
      norm += v * v;
      return [i, v];
    });
    norm = Math.sqrt(norm) || 1;
    return entries.map(([i, v]) => [i, v / norm]);
  };

  const X = docs.map(vectorise);
  const y = rows.map((r) => classes.indexOf(r.label));
  const K = classes.length;
  const D = vocab.length;
  const W = Array.from({ length: K }, () => new Float64Array(D));
  const b = new Float64Array(K);
  // Adam on:  C * sum(log loss) + 0.5 * |W|^2   (scikit-learn's objective, intercept unpenalised)
  const mW = W.map((w) => new Float64Array(w.length));
  const vW = W.map((w) => new Float64Array(w.length));
  const mb = new Float64Array(K);
  const vb = new Float64Array(K);
  const lr = 0.05;
  for (let it = 1; it <= ITERATIONS; it++) {
    const gW = W.map((w) => Float64Array.from(w)); // gradient of the penalty is W itself
    const gb = new Float64Array(K);
    for (let r = 0; r < n; r++) {
      const z = new Float64Array(K);
      for (let k = 0; k < K; k++) {
        let s = b[k];
        for (const [i, v] of X[r]) s += W[k][i] * v;
        z[k] = s;
      }
      const max = Math.max(...z);
      let sum = 0;
      for (let k = 0; k < K; k++) sum += z[k] = Math.exp(z[k] - max);
      for (let k = 0; k < K; k++) {
        const err = C * (z[k] / sum - (k === y[r] ? 1 : 0));
        gb[k] += err;
        for (const [i, v] of X[r]) gW[k][i] += err * v;
      }
    }
    const adam = (g, m, v, p, scale) => {
      for (let j = 0; j < g.length; j++) {
        m[j] = 0.9 * m[j] + 0.1 * g[j];
        v[j] = 0.999 * v[j] + 0.001 * g[j] * g[j];
        p[j] -= (scale * (m[j] / (1 - 0.9 ** it))) / (Math.sqrt(v[j] / (1 - 0.999 ** it)) + 1e-8);
      }
    };
    for (let k = 0; k < K; k++) adam(gW[k], mW[k], vW[k], W[k], lr);
    adam(gb, mb, vb, b, lr);
  }
  return { vocab, idf, W, b, classes, vectorise: (text) => vectorise(tokens(text)) };
}

export function predict(model, text) {
  const x = model.vectorise(text);
  const z = model.classes.map((_, k) => model.b[k] + x.reduce((s, [i, v]) => s + model.W[k][i] * v, 0));
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, c) => a + c, 0);
  const p = e.map((v) => v / sum);
  const best = p.indexOf(Math.max(...p));
  return { label: model.classes[best], confidence: p[best], p };
}

// ---- run ----
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = load();
  const classes = [...new Set(rows.map((r) => r.label))].sort();
  console.log(`${rows.length} examples, ${classes.length} classes: ${classes.join(", ")}`);

  // Stratified, shuffled (seeded) 5-fold cross-validation.
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const byClass = classes.map((c) => rows.filter((r) => r.label === c).sort(() => rand() - 0.5));
  const folds = Array.from({ length: 5 }, () => []);
  byClass.forEach((list) => list.forEach((r, i) => folds[i % 5].push(r)));
  const confusion = classes.map(() => classes.map(() => 0));
  let right = 0;
  let total = 0;
  const confs = [];
  folds.forEach((test, f) => {
    const train = folds.flatMap((x, j) => (j === f ? [] : x));
    const m = fit(train, classes);
    test.forEach((r) => {
      const p = predict(m, r.text);
      confusion[classes.indexOf(r.label)][classes.indexOf(p.label)]++;
      total++;
      if (p.label === r.label) right++;
      confs.push({ ok: p.label === r.label, c: p.confidence });
    });
  });
  console.log(`\n5-fold cross-validated accuracy: ${((100 * right) / total).toFixed(1)}%  (${right}/${total})`);
  console.log("\nper class (recall):");
  classes.forEach((c, i) => {
    const n = confusion[i].reduce((a, v) => a + v, 0);
    console.log(`  ${c.padEnd(22)} ${((100 * confusion[i][i]) / n).toFixed(0)}%  of ${n}`);
  });
  const sure = confs.filter((x) => x.c >= 0.5);
  const unsure = confs.filter((x) => x.c < 0.5);
  console.log(`\nconfidence >= 0.5: ${sure.length} predictions, ${((100 * sure.filter((x) => x.ok).length) / (sure.length || 1)).toFixed(0)}% correct`);
  console.log(`confidence <  0.5: ${unsure.length} predictions, ${((100 * unsure.filter((x) => x.ok).length) / (unsure.length || 1)).toFixed(0)}% correct`);

  const model = fit(rows, classes);
  const round = (v) => Math.round(v * 1000) / 1000;
  const out = {
    version: 1,
    trainedOn: rows.length,
    cvAccuracy: Math.round((1000 * right) / total) / 1000,
    classes,
    vocab: model.vocab,
    idf: model.idf.map(round),
    coef: model.W.map((w) => Array.from(w, round)),
    intercept: Array.from(model.b, round),
  };
  const dest = path.join(here, "..", "..", "src", "data", "intentModel.json");
  fs.writeFileSync(dest, JSON.stringify(out));
  console.log(`\nwrote ${path.relative(process.cwd(), dest)} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);
}
