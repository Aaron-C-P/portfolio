import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const daysToChristmas = (now = new Date()) => {
  const xmas = new Date(now.getFullYear(), 11, 25);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((xmas.getTime() - today.getTime()) / 86400000);
};

/** Small countdown pill for the hero. */
export const ChristmasCountdown = () => {
  const d = daysToChristmas();
  const text = d > 1 ? `${d} days to Christmas` : d === 1 ? "Christmas is tomorrow" : d === 0 ? "Merry Christmas!" : "Happy New Year";
  return <span className="mb-4 ml-2 inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-600">{text}</span>;
};

const lights = [
  [100, 82, "#ef4444"], [78, 108, "#fbbf24"], [124, 120, "#60a5fa"], [62, 146, "#ef4444"], [100, 150, "#22c55e"], [138, 152, "#fbbf24"],
  [48, 182, "#60a5fa"], [84, 186, "#ef4444"], [118, 184, "#fbbf24"], [152, 186, "#22c55e"],
] as const;

/** Decorated tree with presents, shown in the hero on wider screens. */
export const ChristmasTree = () => (
  <svg aria-hidden="true" viewBox="0 0 200 260" className="absolute bottom-6 right-6 hidden w-36 drop-shadow-xl lg:block xl:w-44">
    <defs>
      <linearGradient id="tree" x1="0" x2="1">
        <stop offset="0" stopColor="#14532d" />
        <stop offset="0.5" stopColor="#15803d" />
        <stop offset="1" stopColor="#14532d" />
      </linearGradient>
      <filter id="tree-glow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    <rect x="90" y="196" width="20" height="22" fill="#78350f" />
    <path d="M100 30 L150 100 H128 L170 160 H140 L190 200 H10 L60 160 H30 L72 100 H50 Z" fill="url(#tree)" />
    <path d="M100 6 l5 14 15 1-12 9 4 15-12-9-12 9 4-15-12-9 15-1z" fill="#fbbf24" style={{ animation: "twinkle 2s ease-in-out infinite" }} />
    {lights.map(([x, y, c], i) => (
      <g key={i} style={{ animation: `twinkle 2.2s ease-in-out ${-i * 0.37}s infinite` }}>
        <circle cx={x} cy={y} r="7" fill={c} filter="url(#tree-glow)" />
        <circle cx={x} cy={y} r="3.5" fill={c} />
      </g>
    ))}
    <rect x="14" y="218" width="42" height="34" rx="2" fill="#dc2626" />
    <rect x="31" y="218" width="8" height="34" fill="#fbbf24" />
    <rect x="14" y="231" width="42" height="7" fill="#fbbf24" opacity="0.9" />
    <rect x="132" y="224" width="52" height="28" rx="2" fill="#1d4ed8" />
    <rect x="154" y="224" width="8" height="28" fill="#f1f5f9" />
    <rect x="62" y="232" width="34" height="20" rx="2" fill="#15803d" />
    <rect x="75" y="232" width="8" height="20" fill="#fbbf24" />
  </svg>
);

/** Seasonal call-out that points at the Christmas cake platform. */
export const ChristmasBanner = () => (
  <section aria-label="Christmas" className="mx-auto max-w-6xl px-5 pt-14">
    <Link
      to="/work/chef-hudsons-christmas-cakes"
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-red-400/50 bg-gradient-to-r from-red-500/15 via-amber-300/15 to-emerald-500/15 p-6 transition hover:border-red-500 md:flex-row md:items-center md:justify-between md:p-8"
    >
      <div>
        <p className="font-hand text-3xl text-red-600">It's Christmas cake season</p>
        <p className="mt-1 max-w-2xl text-soft">The best example of my work is a live ordering platform built for a baker taking Christmas orders. See how it handles the rush.</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 font-semibold text-red-600">
        Read the case study <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  </section>
);
