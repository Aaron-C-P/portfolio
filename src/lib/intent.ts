import model from "@/data/intentModel.json";

/**
 * Intent classifier for the assistant: TF-IDF features and a multinomial logistic regression,
 * trained offline by scripts/intent/train.mjs (or train_sklearn.py) and shipped as JSON.
 * The tokenising and maths here must match the trainer exactly.
 */
export type Intent = "about_work" | "frustrated_or_complex" | "hire_intent" | "human_request" | "job_opportunity" | "smalltalk" | "student_help";

const index = new Map<string, number>(model.vocab.map((t, i) => [t, i]));

const grams = (text: string): string[] => {
  const words = text.toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  const out = [...words];
  for (let i = 0; i < words.length - 1; i++) out.push(`${words[i]} ${words[i + 1]}`);
  return out;
};

export function classify(text: string): { label: Intent; confidence: number; known: boolean } {
  const counts = new Map<number, number>();
  for (const g of grams(text)) {
    const i = index.get(g);
    if (i !== undefined) counts.set(i, (counts.get(i) ?? 0) + 1);
  }
  const x = [...counts].map(([i, c]) => [i, c * model.idf[i]] as const);
  const norm = Math.sqrt(x.reduce((s, [, v]) => s + v * v, 0));
  if (!norm) return { label: "smalltalk", confidence: 0, known: false }; // no word the model has seen
  const z = model.coef.map((w, k) => model.intercept[k] + x.reduce((s, [i, v]) => s + (w[i] * v) / norm, 0));
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, b) => a + b, 0);
  const best = e.indexOf(Math.max(...e));
  return { label: model.classes[best] as Intent, confidence: e[best] / sum, known: true };
}

export type Handoff = { offer: boolean; priority: "hot" | "warm" | "normal"; why: string };

/**
 * When should a person step in? The model is only 76% accurate overall but about 90% right when
 * it is confident, so it is used as a gate: confident signals escalate, doubt also escalates.
 */
export function handoffFor(text: string, turnsSoFar: number): Handoff & { intent: Intent; confidence: number } {
  const c = classify(text);
  const base = { intent: c.label, confidence: c.confidence };
  const strong = c.confidence >= 0.5;
  if (c.label === "human_request" && c.confidence >= 0.35) return { ...base, offer: true, priority: "hot", why: "asked for a person" };
  if (c.label === "frustrated_or_complex" && strong) return { ...base, offer: true, priority: "hot", why: "frustrated or complex" };
  if (c.label === "hire_intent" && strong) return { ...base, offer: true, priority: "hot", why: "wants to hire" };
  if (c.label === "job_opportunity" && strong) return { ...base, offer: true, priority: "hot", why: "job opportunity" };
  if (c.label === "student_help" && strong) return { ...base, offer: true, priority: "warm", why: "student help" };
  if (!strong && (c.label !== "smalltalk" || !c.known) && turnsSoFar >= 1) return { ...base, offer: true, priority: "normal", why: "not sure what you need" };
  return { ...base, offer: false, priority: "normal", why: "" };
}
