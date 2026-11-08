const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Layered snowfall: far flakes are small and blurred, near ones larger and faster. */
const flakes = Array.from({ length: 70 }, (_, i) => {
  const depth = rand(i + 1); // 0 far, 1 near
  return {
    left: rand(i + 50) * 100,
    size: 2 + depth * 7,
    blur: (1 - depth) * 1.6,
    opacity: 0.55 + depth * 0.4,
    duration: 16 - depth * 8 + rand(i + 9) * 4,
    delay: -rand(i + 20) * 20,
    sway: (rand(i + 70) - 0.5) * 90,
  };
});

const COLORS = ["#ef4444", "#fbbf24", "#22c55e", "#60a5fa", "#f97316"];
const W = 1200;
const SWAGS = 6;
const SW = W / SWAGS;
const SAG = 38;

// Bulbs sit on each swag: a quadratic curve that dips between the pins.
const bulbs = Array.from({ length: SWAGS * 4 }, (_, i) => {
  const swag = Math.floor(i / 4);
  const t = ((i % 4) + 0.5) / 4;
  const x0 = swag * SW;
  const x = x0 + t * SW;
  const y = 2 * t * (1 - t) * SAG * 2 + 6; // quadratic with control point at 2*SAG
  const slope = (1 - 2 * t) * -4 * SAG * 0 + (2 * (1 - 2 * t) * SAG * 2) / SW;
  return { x, y, angle: Math.atan(slope) * (180 / Math.PI), color: COLORS[i % COLORS.length], delay: -rand(i + 3) * 3 };
});

const wire = Array.from({ length: SWAGS }, (_, s) => `${s === 0 ? "M" : ""}${s === 0 ? "0 6" : ""} Q ${s * SW + SW / 2} ${6 + SAG * 2} ${(s + 1) * SW} 6`).join(" ");

const baubles = [
  { left: "62%", len: 70, r: 20, color: "#dc2626", delay: 0 },
  { left: "72%", len: 120, r: 26, color: "#b45309", delay: -1.2 },
  { left: "83%", len: 56, r: 17, color: "#15803d", delay: -2.1 },
  { left: "91%", len: 100, r: 22, color: "#1d4ed8", delay: -0.6 },
];

/** Realistic Christmas backdrop: falling snow, twinkling string lights and swinging baubles. */
export const ChristmasScene = () => (
  <>
    <svg aria-hidden="true" viewBox={`0 0 ${W} 100`} preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-14 w-full">
      <defs>
        <filter id="bulb-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d={wire} fill="none" stroke="#1f3d2b" strokeWidth="2.2" strokeLinecap="round" />
      {bulbs.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}>
          <rect x="-3" y="-2" width="6" height="7" rx="1.5" fill="#1f3d2b" />
          <g style={{ animation: `twinkle 2.4s ease-in-out ${b.delay}s infinite` }}>
            <ellipse cx="0" cy="13" rx="9" ry="12" fill={b.color} filter="url(#bulb-glow)" opacity="0.8" />
            <ellipse cx="0" cy="12" rx="5" ry="8" fill={b.color} />
            <ellipse cx="-1.6" cy="9" rx="1.4" ry="3" fill="#fff" opacity="0.65" />
          </g>
        </g>
      ))}
    </svg>

    {baubles.map((b, i) => (
      <div key={i} className="absolute top-14 hidden origin-top md:block" style={{ left: b.left, animation: `swing 5s ease-in-out ${b.delay}s infinite` }}>
        <div className="mx-auto w-px bg-zinc-500/60" style={{ height: b.len }} />
        <svg width={b.r * 2} height={b.r * 2 + 8} viewBox={`0 0 ${b.r * 2} ${b.r * 2 + 8}`} className="-ml-[calc(var(--r)*1px)] block" style={{ ["--r" as string]: b.r }}>
          <defs>
            <radialGradient id={`bg${i}`} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.18" stopColor={b.color} />
              <stop offset="1" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
          </defs>
          <rect x={b.r - 4} y="0" width="8" height="8" rx="1.5" fill="#d4a017" />
          <circle cx={b.r} cy={b.r + 8} r={b.r} fill={b.color} />
          <circle cx={b.r} cy={b.r + 8} r={b.r} fill={`url(#bg${i})`} />
        </svg>
      </div>
    ))}

    {flakes.map((f, i) => (
      <span
        key={i}
        className="absolute top-0 rounded-full bg-white"
        style={{
          left: `${f.left}%`,
          width: f.size,
          height: f.size,
          opacity: f.opacity,
          filter: `blur(${f.blur}px)`,
          boxShadow: "0 0 3px 1px rgba(96,140,200,0.55)",
          ["--sway" as string]: `${f.sway}px`,
          animation: `snow ${f.duration}s linear ${f.delay}s infinite`,
        }}
      />
    ))}
  </>
);
