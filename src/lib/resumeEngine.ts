import model from "@/data/bulletModel.json";

/**
 * The résumé optimiser. Three small, honest techniques:
 *  1. Bayesian keyword matching: smoothed term weights from the job posting, and a Beta-prior match score.
 *  2. A bullet-strength classifier (logistic regression, weights in bulletModel.json, trained by scripts/resume).
 *  3. A Thompson-sampling bandit that learns which layout works best from outcomes the user reports.
 * None of this predicts whether someone gets hired. It measures how well a résumé matches a posting and
 * how specific its bullets are, which are things applicant tracking systems and recruiters do look at.
 */

export interface Job {
  role: string;
  org: string;
  dates: string;
  bullets: string[];
}
export interface School {
  school: string;
  what: string;
  dates: string;
}
export interface Resume {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: Job[];
  education: School[];
  skills: string;
}

export const emptyResume = (): Resume => ({
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  summary: "",
  experience: [{ role: "", org: "", dates: "", bullets: ["", ""] }],
  education: [{ school: "", what: "", dates: "" }],
  skills: "",
});

export const exampleResume = (): Resume => ({
  name: "Jordan Brown",
  title: "Customer Support Representative",
  email: "jordan@example.com",
  phone: "876-555-0100",
  location: "Kingston, Jamaica",
  links: "linkedin.com/in/jordanbrown",
  summary: "Support representative who resolves customer problems quickly and explains fixes in plain language.",
  experience: [
    {
      role: "Customer Service Agent",
      org: "Island Retail",
      dates: "2023 - Present",
      bullets: ["Responsible for helping customers", "Resolved 25+ customer tickets per day with a 96% satisfaction score", "Trained 6 new staff on the point-of-sale system"],
    },
  ],
  education: [{ school: "University of Technology", what: "BSc Information Technology", dates: "2021 - 2025" }],
  skills: "Customer support, Troubleshooting, Microsoft Excel, Ticketing systems",
});

// ---------- text helpers ----------
const STOP = new Set(
  "a an the and or of to in for on with at by from as is are was were be been it its this that these those you your we our they their will can may must should would could i me my not no yes if but so than then also more most such per via into about over under up out new all any each other etc able ability including include work working role team teams company job candidate position looking seeking required requirements preferred responsibilities experience strong years year plus have has had provide provides providing excellent skills skill good great well ensure support help helps join make using use used within across while which who what when where how why there here both either among between through during before after above below again further once only own same too very just now get gets getting one two three first second plus".split(" "),
);

export const tokenize = (text: string): string[] => (text.toLowerCase().match(/[a-z][a-z0-9+#.\-]{1,}/g) ?? []).map((t) => t.replace(/[.\-]+$/, "")).filter((t) => t.length > 1);

export interface Keyword {
  term: string;
  weight: number;
}

/**
 * Pulls the terms a posting cares about. Each term's weight is a smoothed frequency (counts plus a
 * prior, so one-off words do not dominate) boosted when it appears in a "required / must / experience" line.
 */
export function extractKeywords(posting: string, limit = 24): Keyword[] {
  const counts = new Map<string, number>();
  const lines = posting.split(/\n+/);
  for (const line of lines) {
    const must = /(required|requirement|must|essential|proficien|experience (with|in)|knowledge of)/i.test(line) ? 1.5 : 1;
    const toks = tokenize(line).filter((t) => !STOP.has(t));
    toks.forEach((t, i) => {
      counts.set(t, (counts.get(t) ?? 0) + must);
      const next = toks[i + 1];
      if (next) counts.set(`${t} ${next}`, (counts.get(`${t} ${next}`) ?? 0) + must * 0.8);
    });
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  const prior = 0.5; // pseudo-count: shrinks rare terms
  return [...counts.entries()]
    .filter(([term, c]) => (term.includes(" ") ? c >= 1.6 : c >= 1.5 || term.length > 3))
    .map(([term, c]) => ({ term, weight: (c + prior) / (total + prior * counts.size) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export const resumeText = (r: Resume): string =>
  [r.title, r.summary, r.skills, ...r.experience.flatMap((j) => [j.role, j.org, ...j.bullets]), ...r.education.flatMap((s) => [s.school, s.what])].join("\n");

export interface Match {
  score: number; // 0..100
  hit: string[];
  missing: string[];
}

/**
 * Posterior-mean coverage. Hits and misses are weighted by keyword importance and combined with a
 * Beta(2, 2) prior, so a short list of keywords cannot swing the score to 0 or 100 on its own.
 */
export function matchScore(r: Resume, keywords: Keyword[]): Match {
  if (keywords.length === 0) return { score: 0, hit: [], missing: [] };
  const hay = ` ${tokenize(resumeText(r)).join(" ")} `;
  const hit: string[] = [];
  const missing: string[] = [];
  let hw = 0;
  let mw = 0;
  for (const k of keywords) {
    const found = hay.includes(` ${k.term} `) || (k.term.length > 4 && hay.includes(` ${k.term.slice(0, -1)}`));
    (found ? hit : missing).push(k.term);
    if (found) hw += k.weight;
    else mw += k.weight;
  }
  const scale = 1 / (hw + mw || 1);
  const n = keywords.length;
  const a = 2 + hw * scale * n;
  const b = 2 + mw * scale * n;
  return { score: Math.round((a / (a + b)) * 100), hit, missing };
}

// ---------- bullet strength ----------
const VERBS = new Set("built reduced increased led designed resolved automated trained diagnosed managed wrote analysed analyzed improved coordinated launched cut presented mentored implemented tested negotiated supported migrated organised organized streamlined developed created delivered saved grew raised fixed optimised optimized introduced rebuilt secured identified halved".split(" "));
const WEAK = /(responsible for|duties|helped with|helped out|worked on|in charge|assisted|team player|hard working|various|general|involved in|tasked|took care|dealt with|part of)/i;

/** Must stay identical to features() in scripts/resume/train.mjs. */
export function bulletFeatures(text: string): number[] {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const first = (words[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
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

export const bulletStrength = (text: string): number => {
  const z = bulletFeatures(text).reduce((s, v, i) => s + v * model.weights[i], 0);
  return 1 / (1 + Math.exp(-z));
};

export interface BulletTip {
  text: string;
  strength: number;
  tip: string;
}

export function bulletTips(r: Resume): BulletTip[] {
  return r.experience
    .flatMap((j) => j.bullets)
    .filter((b) => b.trim())
    .map((text) => {
      const f = bulletFeatures(text);
      const strength = bulletStrength(text);
      const tip =
        f[4] === 1
          ? "This reads like a duty. Say what you did and what changed."
          : f[1] === 0
            ? "Add a number: how many, how much, how fast, how often."
            : f[3] === 0
              ? "Start with a strong action verb such as Built, Reduced, Led or Resolved."
              : f[5] === 0
                ? "Aim for about one or two lines (8 to 28 words)."
                : "Strong: specific and result-focused.";
      return { text, strength, tip };
    });
}

// ---------- layout bandit ----------
export const LAYOUTS = [
  { id: "impact", name: "Impact first", note: "Summary, then experience, then skills. Suits people with relevant jobs." },
  { id: "skills", name: "Skills first", note: "Skills up top. Suits career changers and technical roles." },
  { id: "education", name: "Education first", note: "Education before experience. Suits students and new graduates." },
] as const;
export type LayoutId = (typeof LAYOUTS)[number]["id"];

export type BanditState = Record<LayoutId, { wins: number; losses: number }>;
export const freshBandit = (): BanditState => ({ impact: { wins: 0, losses: 0 }, skills: { wins: 0, losses: 0 }, education: { wins: 0, losses: 0 } });

// Gamma sampler (Marsaglia and Tsang) so we can draw from Beta without a library.
function gamma(k: number): number {
  if (k < 1) return gamma(k + 1) * Math.random() ** (1 / k);
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      const u1 = Math.random() || 1e-12;
      const u2 = Math.random();
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = 1 + c * x;
    } while (v <= 0);
    v = v ** 3;
    const u = Math.random() || 1e-12;
    if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
  }
}
const beta = (a: number, b: number) => {
  const x = gamma(a);
  return x / (x + gamma(b));
};

/** Thompson sampling: draw a plausible success rate for each layout from Beta(1+wins, 1+losses) and pick the highest. */
export function chooseLayout(state: BanditState, prefer?: LayoutId): LayoutId {
  let best: LayoutId = prefer ?? "impact";
  let top = -1;
  for (const l of LAYOUTS) {
    const s = state[l.id];
    // The sensible default starts with a prior of 4 wins and 1 loss, so until real outcomes say otherwise it is
    // usually chosen. Other layouts still get picked sometimes (exploration) and take over if they win more.
    const prior = l.id === prefer ? { w: 4, l: 1 } : { w: 1, l: 1 };
    const draw = beta(prior.w + s.wins, prior.l + s.losses);
    if (draw > top) {
      top = draw;
      best = l.id;
    }
  }
  return best;
}

export const recordOutcome = (state: BanditState, layout: LayoutId, gotInterview: boolean): BanditState => ({
  ...state,
  [layout]: { wins: state[layout].wins + (gotInterview ? 1 : 0), losses: state[layout].losses + (gotInterview ? 0 : 1) },
});

/** A starting guess before any outcomes exist: students lead with education, technical roles with skills. */
export function sensibleDefault(r: Resume): LayoutId {
  const hasJobs = r.experience.some((j) => j.role.trim() && j.bullets.some((b) => b.trim()));
  if (!hasJobs) return "education";
  return /(developer|engineer|analyst|data|it |support|technician)/i.test(r.title) ? "skills" : "impact";
}

// ---------- overall checks ----------
export interface Check {
  ok: boolean;
  text: string;
}
export function basicChecks(r: Resume): Check[] {
  return [
    { ok: !!r.name.trim() && /\S+@\S+\.\S+/.test(r.email) && !!r.phone.trim(), text: "Name, email and phone are all filled in" },
    { ok: r.summary.trim().split(/\s+/).length >= 15 && r.summary.trim().split(/\s+/).length <= 70, text: "Summary is 15 to 70 words" },
    { ok: r.experience.some((j) => j.bullets.filter((b) => b.trim()).length >= 2), text: "At least one job has two or more bullets" },
    { ok: r.skills.split(",").filter((s) => s.trim()).length >= 5, text: "At least five skills listed" },
    { ok: r.education.some((s) => s.school.trim()), text: "Education is listed" },
  ];
}
