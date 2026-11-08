export type TutorNote = {
  id: string;
  subject: string;
  title: string;
  keywords: string;
  body: string;
};

/** Short original study notes. The tutor retrieves from these first and cites them. */
export const notes: TutorNote[] = [
  {
    id: "quadratic-formula",
    subject: "Mathematics",
    title: "Solving a quadratic equation",
    keywords: "quadratic equation solve formula discriminant roots completing the square factorise ax2 bx c",
    body: String.raw`A quadratic has the form $ax^2 + bx + c = 0$ with $a \neq 0$. Three methods:

1. **Factorise** when it factorises nicely.
2. **Complete the square** (needed for turning points and for some exam questions).
3. **Quadratic formula**, which always works:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

**Steps**
1. Write the equation in the form $ax^2 + bx + c = 0$.
2. Identify $a$, $b$ and $c$, keeping their signs.
3. Find the discriminant $\Delta = b^2 - 4ac$.
4. If $\Delta > 0$: two different real solutions. If $\Delta = 0$: one repeated solution. If $\Delta < 0$: no real solutions.
5. Substitute into the formula and simplify.

**Example:** solve $2x^2 - 5x - 3 = 0$.

- $a = 2,\ b = -5,\ c = -3$
- $\Delta = (-5)^2 - 4(2)(-3) = 25 + 24 = 49$
- $x = \dfrac{5 \pm 7}{4}$, so $x = 3$ or $x = -\dfrac{1}{2}$

Check: $2(3)^2 - 5(3) - 3 = 18 - 15 - 3 = 0$.`,
  },
  {
    id: "factorising",
    subject: "Mathematics",
    title: "Factorising quadratics",
    keywords: "factorise factorize factor quadratic brackets product sum trinomial difference of two squares",
    body: String.raw`To factorise $x^2 + bx + c$, find two numbers that **multiply to $c$** and **add to $b$**.

**Example:** $x^2 + 5x + 6$. The numbers are $2$ and $3$, so $x^2 + 5x + 6 = (x + 2)(x + 3)$.

When $a \neq 1$, multiply $a \times c$, find two numbers that multiply to that and add to $b$, split the middle term, then factorise by grouping.

**Example:** $2x^2 - 5x - 3$. Here $a \times c = -6$ and the numbers are $-6$ and $1$:

$$2x^2 - 6x + x - 3 = 2x(x - 3) + 1(x - 3) = (2x + 1)(x - 3)$$

**Difference of two squares:** $a^2 - b^2 = (a - b)(a + b)$.

Always expand your answer to check it.`,
  },
  {
    id: "linear-equations",
    subject: "Mathematics",
    title: "Solving linear equations",
    keywords: "linear equation solve unknown balance inverse operations change the subject rearrange",
    body: String.raw`Treat an equation as a balance: whatever you do to one side, do to the other.

**Example:** solve $3x + 5 = 20$.

1. Subtract 5 from both sides: $3x = 15$.
2. Divide both sides by 3: $x = 5$.
3. Check: $3(5) + 5 = 20$.

**Changing the subject** works the same way. Make $x$ the subject of $y = mx + c$:

$$y - c = mx \quad\Rightarrow\quad x = \frac{y - c}{m}$$

Undo operations in the reverse order from how they were applied.`,
  },
  {
    id: "simultaneous",
    subject: "Mathematics",
    title: "Simultaneous equations",
    keywords: "simultaneous equations elimination substitution two unknowns x y system",
    body: String.raw`Two equations, two unknowns. Two methods:

**Elimination:** add or subtract the equations so one letter disappears.

**Example:** $2x + y = 11$ and $x - y = 1$.

1. Add the equations: $3x = 12$, so $x = 4$.
2. Substitute into $x - y = 1$: $4 - y = 1$, so $y = 3$.
3. Check in the first equation: $2(4) + 3 = 11$.

**Substitution:** rearrange one equation (for example $y = x - 1$) and substitute it into the other. This is the method to use when one equation is not linear.

Always check your pair of values in **both** original equations.`,
  },
  {
    id: "indices",
    subject: "Mathematics",
    title: "Laws of indices",
    keywords: "indices powers exponents laws index negative zero fractional surds",
    body: String.raw`For the same base $a$:

- $a^m \times a^n = a^{m+n}$
- $a^m \div a^n = a^{m-n}$
- $(a^m)^n = a^{mn}$
- $a^0 = 1$
- $a^{-n} = \dfrac{1}{a^n}$
- $a^{1/n} = \sqrt[n]{a}$

**Example:** $2^3 \times 2^4 = 2^{7} = 128$.

**Example:** $8^{2/3} = (\sqrt[3]{8})^2 = 2^2 = 4$.

The laws only apply when the **bases are the same**.`,
  },
  {
    id: "consumer-arithmetic",
    subject: "Mathematics",
    title: "Percentages and interest",
    keywords: "percentage percent simple interest compound interest profit loss discount vat tax consumer arithmetic hire purchase",
    body: String.raw`**Percentage of an amount:** $\dfrac{p}{100} \times \text{amount}$.

**Simple interest:**

$$I = \frac{P \times R \times T}{100}$$

where $P$ is the principal, $R$ the rate per year (%) and $T$ the time in years.

**Compound interest:**

$$A = P\left(1 + \frac{R}{100}\right)^n$$

**Example:** \$20 000 at 5% for 3 years.

- Simple: $I = \dfrac{20000 \times 5 \times 3}{100} = 3000$
- Compound: $A = 20000(1.05)^3 = 23\,152.50$, so the interest is \$3 152.50.

**Profit %** $= \dfrac{\text{profit}}{\text{cost price}} \times 100$. Always divide by the **cost price**.`,
  },
  {
    id: "trigonometry",
    subject: "Mathematics",
    title: "Pythagoras and right-angled trigonometry",
    keywords: "trigonometry trig sine cosine tangent sin cos tan soh cah toa pythagoras right angle triangle hypotenuse",
    body: String.raw`**Pythagoras:** in a right-angled triangle, $c^2 = a^2 + b^2$, where $c$ is the hypotenuse (opposite the right angle).

**SOH CAH TOA**

$$\sin\theta = \frac{\text{opp}}{\text{hyp}},\qquad \cos\theta = \frac{\text{adj}}{\text{hyp}},\qquad \tan\theta = \frac{\text{opp}}{\text{adj}}$$

**Steps**
1. Label the sides **relative to the angle** you are using: opposite, adjacent, hypotenuse.
2. Choose the ratio that uses the two sides you have or need.
3. Solve. To find an angle, use the inverse function.

**Example:** opposite $= 3$, adjacent $= 4$. Then $\tan\theta = \dfrac{3}{4}$, so $\theta = \tan^{-1}(0.75) \approx 36.9^\circ$.

Make sure your calculator is in **degree** mode.`,
  },
  {
    id: "statistics",
    subject: "Mathematics",
    title: "Mean, median, mode and range",
    keywords: "statistics mean median mode range average data frequency table",
    body: String.raw`- **Mean** $= \dfrac{\text{sum of values}}{\text{number of values}}$
- **Median** = middle value when the data is in order (for an even count, the mean of the two middle values)
- **Mode** = most frequent value
- **Range** = largest $-$ smallest

**Example:** $3, 5, 5, 7, 10$

- Mean $= \dfrac{30}{5} = 6$
- Median $= 5$
- Mode $= 5$
- Range $= 10 - 3 = 7$

For a **frequency table**, the mean is $\dfrac{\sum fx}{\sum f}$.`,
  },
  {
    id: "probability",
    subject: "Mathematics",
    title: "Probability",
    keywords: "probability chance event outcomes sample space independent with replacement without replacement tree diagram",
    body: String.raw`$$P(A) = \frac{\text{number of favourable outcomes}}{\text{total number of outcomes}}$$

Probabilities are between $0$ and $1$, and $P(\text{not } A) = 1 - P(A)$.

**Example:** a bag has 3 red and 5 blue counters. $P(\text{red}) = \dfrac{3}{8}$.

For **independent** events (with replacement), multiply:

$$P(\text{red then red}) = \frac{3}{8} \times \frac{3}{8} = \frac{9}{64}$$

**Without replacement**, the second fraction changes:

$$P(\text{red then red}) = \frac{3}{8} \times \frac{2}{7} = \frac{3}{28}$$

"And" usually means multiply along branches of a tree diagram. "Or" means add the branches.`,
  },
  {
    id: "sets",
    subject: "Mathematics",
    title: "Sets and Venn diagrams",
    keywords: "sets venn diagram union intersection complement universal subset notation",
    body: String.raw`- $A \cup B$ (union): in $A$ or $B$ or both
- $A \cap B$ (intersection): in both $A$ and $B$
- $A'$ (complement): in the universal set $\xi$ but not in $A$

$$n(A \cup B) = n(A) + n(B) - n(A \cap B)$$

**Example:** $n(A) = 12$, $n(B) = 9$, $n(A \cap B) = 4$. Then $n(A \cup B) = 12 + 9 - 4 = 17$.

**Venn diagram tip:** fill in the **intersection first**, then the rest of each set, then what is outside both.`,
  },
  {
    id: "sba-structure",
    subject: "School-Based Assessment (SBA)",
    title: "Structuring an SBA write-up",
    keywords: "sba school based assessment structure write-up report introduction method findings conclusion mark scheme",
    body: `Requirements differ by subject, so always follow **your own subject's SBA guide and mark scheme**. A common shape:

1. **Title and aim:** what exactly are you finding out?
2. **Introduction:** background and why the question matters.
3. **Method:** what you did, in order, so someone else could repeat it.
4. **Presentation of data:** tables and graphs with titles and units.
5. **Analysis and discussion:** what the data shows and why.
6. **Conclusion:** answer the aim directly, then note limitations.
7. **References.**

Work from the mark scheme: tick off each mark point as you write it. Your teacher can tell you what a full-mark answer looks like, so ask early and use their feedback on a draft.`,
  },
  {
    id: "paragraph-peel",
    subject: "English",
    title: "Writing a strong paragraph (PEEL)",
    keywords: "english essay paragraph writing peel point evidence explain link argument topic sentence",
    body: `Use **PEEL** for each paragraph:

- **Point:** one clear idea in a topic sentence.
- **Evidence:** a fact, quotation or example that supports it.
- **Explain:** say *how* the evidence proves your point. This is where most marks are won.
- **Link:** connect back to the question or lead into the next paragraph.

Start a **new paragraph for each new point**. Finish with a conclusion that sums up your points without adding new ones. Read your work aloud to catch missing words and long, tangled sentences.`,
  },
  {
    id: "study-method",
    subject: "Study skills",
    title: "Studying so it sticks",
    keywords: "study revise revision memory learn exam prepare recall practice past papers plan",
    body: `- **Active recall:** close the book and write down what you remember, then check. This works better than rereading.
- **Spaced practice:** short sessions over several days beat one long session.
- **Past papers:** do them under time, then mark them and sort mistakes into *careless*, *method* and *did not know*.
- **Explain it simply:** if you can teach it to someone else, you understand it.
- **Fix the cause:** for every wrong answer, redo a similar question until it is right without help.`,
  },
];

export const subjects = ["Any subject", ...Array.from(new Set(notes.map((n) => n.subject)))];

const stop = new Set("a an the and or of to in on for with is are was be how do does i me my we you your what why when can it this that as at by from show tell about please help solve".split(" "));
const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stop.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));

const docs = notes.map((n) => ({
  note: n,
  title: new Set(tokens(n.title)),
  keys: new Set(tokens(n.keywords)),
  body: tokens(n.body),
}));
const df = new Map<string, number>();
docs.forEach((d) => new Set([...d.title, ...d.keys, ...d.body]).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
const idf = (t: string) => Math.log(1 + docs.length / (df.get(t) ?? docs.length));

/** Keyword retrieval (TF-IDF with title and keyword boosts). Returns the best matching notes, best first. */
export function retrieve(query: string, subject = "Any subject", limit = 3): TutorNote[] {
  const q = tokens(query);
  if (!q.length) return [];
  return docs
    .filter((d) => subject === "Any subject" || d.note.subject === subject)
    .map((d) => {
      let score = 0;
      for (const t of q) {
        const tf = d.body.filter((b) => b === t).length;
        const w = (d.title.has(t) ? 3 : 0) + (d.keys.has(t) ? 2 : 0) + Math.min(tf, 3) * 0.4;
        score += w * idf(t);
      }
      return { note: d.note, score };
    })
    .filter((r) => r.score > 1.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.note);
}
