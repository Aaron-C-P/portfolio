// Generated art for the résumé templates. Every piece is plain vector shapes (polygons, circles, lines), never an
// image, so a PDF reader or applicant tracking system still sees only the real text. The shapes are drawn first and
// sit behind the text, in light tints (or a very dark band with white text) so the words stay easy to read.
//
// The art is seeded from the person's name: the same person always gets the same design, and two people with
// different names get different ones. The browser preview and the server PDF both call artFor(), so they match.
// Coordinates are PDF points on a US Letter page (612 x 792). `edge` shapes repeat on every page.

export const PAGE_W = 612;
export const PAGE_H = 792;
const W = PAGE_W;

const mix = (c, a) => c.map((v) => Math.round(255 - (255 - v) * a)); // colour c at strength a, on white
export const hashSeed = (s) => {
  let h = 2166136261;
  for (const ch of String(s || "resume")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const prng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rect = (x, y, w, h, c, extra) => ({ k: "poly", pts: [x, y, x + w, y, x + w, y + h, x, y + h], c, fill: true, ...extra });
const dot = (x, y, r, c) => ({ k: "circle", x, y, r, c, fill: true });
const pick = (rng, pal) => pal[Math.floor(rng() * pal.length)];

const GENERATORS = {
  // Layered soft waves across the top.
  waves(rng, pal) {
    const ph = rng() * 6;
    return [0, 1, 2].map((i) => {
      const base = 112 - i * 22;
      const amp = 7 + rng() * 9;
      const f = 0.012 + rng() * 0.012;
      const pts = [0, 0];
      for (let x = 0; x <= W; x += 12) pts.push(x, base + amp * Math.sin(x * f + ph + i));
      pts.push(W, 0);
      return { k: "poly", pts, c: mix(pal[i % pal.length], [0.14, 0.22, 0.32][i]), fill: true };
    });
  },
  // A dark band with fine diagonal lines and a gold edge. The name is printed in white on it.
  band(rng, pal, t) {
    const out = [rect(0, 0, W, t.bandH, pal[0])];
    const step = 12 + Math.floor(rng() * 10);
    for (let x = 0; x < W - 70; x += step) out.push({ k: "poly", pts: [x, t.bandH, x + 70, 0], c: pal[1], stroke: true, w: 1 });
    out.push(rect(0, t.bandH, W, 3, pal[2]));
    return out;
  },
  // A small symmetrical pixel pattern, like an identicon, made from the name.
  mosaic(rng, pal) {
    const cell = 13;
    const x0 = W - 54 - 5 * cell;
    const out = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (rng() < 0.5) continue;
        const c = mix(pick(rng, pal), 0.5);
        out.push(rect(x0 + col * cell, 34 + row * cell, cell - 2, cell - 2, c));
        if (col < 2) out.push(rect(x0 + (4 - col) * cell, 34 + row * cell, cell - 2, cell - 2, c));
      }
    }
    return out;
  },
  // Rising concentric discs in the top corner.
  sunrise(rng, pal) {
    const cx = W - 26 - rng() * 30;
    return [190, 150, 112, 76, 44].map((r, i) => dot(cx, -8, r, mix(pal[i % pal.length], 0.1 + i * 0.07)));
  },
  // Colour blocks down the left edge of every page, plus a few squares at the top.
  blocks(rng, pal) {
    const out = [];
    let y = 0;
    let i = 0;
    while (y < PAGE_H) {
      const h = Math.min(PAGE_H - y, 40 + rng() * 90);
      out.push(rect(0, y, 16, h, pal[i++ % pal.length], { edge: true }));
      y += h;
    }
    for (let n = 0; n < 3; n++) out.push(rect(W - 54 - n * 22, 32 + n * 8, 18, 18, mix(pick(rng, pal), 0.4)));
    return out;
  },
  // Scattered dots across the header.
  confetti(rng, pal) {
    const out = [];
    for (let n = 0; n < 38; n++) out.push(dot(rng() * W, rng() * 135, 2 + rng() * 6, mix(pick(rng, pal), 0.25 + rng() * 0.2)));
    return out;
  },
  // Overlapping triangles in the top right.
  geo(rng, pal) {
    const out = [];
    for (let n = 0; n < 7; n++) {
      const bx = 300 + rng() * 280;
      const by = rng() * 90;
      const pts = [bx, by, bx + 30 + rng() * 60, by + rng() * 30, bx + rng() * 50, by + 40 + rng() * 40];
      out.push({ k: "poly", pts, c: mix(pick(rng, pal), 0.16 + rng() * 0.22), fill: true });
    }
    return out;
  },
  // Thin concentric rings in the top right.
  rings(rng, pal) {
    const cx = W - 80 - rng() * 20;
    const out = [];
    for (let i = 0; i < 7; i++) out.push({ k: "circle", x: cx, y: 52, r: 18 + i * 15, c: mix(pal[i % pal.length], 0.35), stroke: true, w: 1.2 });
    return out;
  },
  // Contour lines like a map.
  topo(rng, pal) {
    const ph = rng() * 6;
    const out = [];
    for (let i = 0; i < 8; i++) {
      const pts = [];
      for (let x = 0; x <= W; x += 10) pts.push(x, 18 + i * 17 + 9 * Math.sin(x * 0.017 + i * 0.7 + ph) + 5 * Math.sin(x * 0.041 + i * 1.3));
      out.push({ k: "poly", pts, c: mix(pal[i % pal.length], 0.4), stroke: true, w: 0.8 });
    }
    return out;
  },
};

/** The decoration for a template and a name: a flat list of vector shapes. Empty for a plain template. */
export function artFor(template, name, variant = 0) {
  const gen = GENERATORS[template.art];
  if (!gen) return [];
  const v = Number.isInteger(variant) && variant > 0 ? variant % 100 : 0;
  // A remix reseeds the shapes and rotates which colour goes where. The dark band keeps its own colours.
  const pal = template.band || !v ? template.pal : template.pal.map((_, i, a) => a[(i + v) % a.length]);
  return gen(prng(hashSeed(`${name}|${template.id}|${v}`)), pal, template);
}

/** Accepts a remix number from untrusted input: a whole number 0 to 99, else 0. */
export const cleanVariant = (v) => (Number.isInteger(v) && v >= 0 && v < 100 ? v : 0);
