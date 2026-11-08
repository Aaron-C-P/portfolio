export type Glyph = "snowflake" | "sparkle" | "ornament" | "heart" | "petal" | "sun" | "leaf" | "confetti";

export type Season = {
  key: string;
  /** Short greeting shown on the landing page. */
  greeting: string;
  /** Floating shapes, cycled through in order. */
  glyphs: Glyph[];
  /** Colours for the shapes, cycled through in order. */
  colors: string[];
  /** Tailwind classes for the three soft background glows. */
  blobs: [string, string, string];
  /** "fall" drifts down, "rise" floats up. */
  motion: "fall" | "rise";
};

const seasons: Record<string, Season> = {
  christmas: {
    key: "christmas",
    greeting: "Merry Christmas from Mandeville",
    glyphs: ["snowflake", "ornament", "sparkle", "snowflake", "ornament"],
    colors: ["#60a5fa", "#ef4444", "#f59e0b", "#22c55e", "#93c5fd"],
    blobs: ["bg-red-500/30", "bg-amber-400/30", "bg-emerald-500/25"],
    motion: "fall",
  },
  valentine: {
    key: "valentine",
    greeting: "Happy Valentine's Day",
    glyphs: ["heart", "heart", "sparkle"],
    colors: ["#ec4899", "#f43f5e", "#fb7185"],
    blobs: ["bg-pink-500/30", "bg-rose-400/25", "bg-violet/25"],
    motion: "rise",
  },
  spring: {
    key: "spring",
    greeting: "Happy Easter and a bright spring",
    glyphs: ["petal", "petal", "sparkle"],
    colors: ["#f472b6", "#fbbf24", "#a78bfa", "#34d399"],
    blobs: ["bg-pink-400/25", "bg-yellow-300/30", "bg-emerald-400/25"],
    motion: "fall",
  },
  summer: {
    key: "summer",
    greeting: "Enjoy the summer sunshine",
    glyphs: ["sun", "sparkle", "sun"],
    colors: ["#f59e0b", "#fb923c", "#facc15", "#38bdf8"],
    blobs: ["bg-amber-400/35", "bg-orange-400/25", "bg-sky-400/25"],
    motion: "rise",
  },
  independence: {
    key: "independence",
    greeting: "Happy Independence, Jamaica",
    glyphs: ["confetti", "sparkle", "confetti"],
    colors: ["#16a34a", "#facc15", "#111827"],
    blobs: ["bg-emerald-500/30", "bg-yellow-400/30", "bg-zinc-700/20"],
    motion: "fall",
  },
  school: {
    key: "school",
    greeting: "Back to school: let's make it a good term",
    glyphs: ["leaf", "sparkle", "leaf"],
    colors: ["#f97316", "#eab308", "#dc2626", "#7647eb"],
    blobs: ["bg-orange-400/25", "bg-violet/30", "bg-yellow-300/25"],
    motion: "fall",
  },
};

/** Picks the landing-page season from the date (month is 1 to 12). */
export function seasonFor(date = new Date(), override?: string | null): Season {
  if (override && seasons[override]) return seasons[override];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (m >= 11 || m === 12 || (m === 1 && d <= 6)) return seasons.christmas;
  if (m === 2 && d <= 14) return seasons.valentine;
  if (m === 3 || m === 4) return seasons.spring;
  if (m >= 5 && m <= 7) return seasons.summer;
  if (m === 8 && d <= 10) return seasons.independence;
  return seasons.school;
}
