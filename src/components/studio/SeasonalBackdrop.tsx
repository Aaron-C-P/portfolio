import type { ReactNode } from "react";
import { ChristmasScene } from "@/components/studio/ChristmasScene";
import type { Glyph, Season } from "@/lib/season";

const shapes: Record<Glyph, ReactNode> = {
  snowflake: (
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
      <path d="M9.5 3.8L12 6l2.5-2.2M9.5 20.2L12 18l2.5 2.2" />
    </g>
  ),
  sparkle: <path fill="currentColor" d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" />,
  ornament: (
    <g>
      <rect x="10" y="1" width="4" height="4" rx="1" fill="#a16207" />
      <circle cx="12" cy="14" r="8" fill="currentColor" />
      <path d="M6.5 13c2-1.5 4-1.5 6 0s4 1.5 5.5 0" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  heart: <path fill="currentColor" d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.8-8 11-8 11z" />,
  petal: <path fill="currentColor" d="M12 2c5 4 6 10 0 20C6 12 7 6 12 2z" />,
  sun: (
    <g fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" stroke="none" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" fill="none" />
    </g>
  ),
  leaf: <path fill="currentColor" d="M20 3C9 3 4 9 4 15c0 3 2 6 5 6 7 0 11-7 11-18zM4 21c3-5 7-8 12-11" />,
  confetti: <rect x="6" y="3" width="12" height="18" rx="2" fill="currentColor" />,
};

const slots = [5, 12, 19, 27, 35, 43, 52, 60, 68, 76, 84, 92];

/** Floating shapes that follow the season. Purely decorative. */
export const SeasonalBackdrop = ({ season }: { season: Season }) => (
  <>
    <div className={`absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl ${season.blobs[0]}`} style={{ animation: "drift 9s ease-in-out infinite" }} />
    <div className={`absolute -right-20 top-1/3 h-80 w-80 rounded-full blur-3xl ${season.blobs[1]}`} style={{ animation: "drift2 11s ease-in-out infinite" }} />
    <div className={`absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl ${season.blobs[2]}`} style={{ animation: "drift 13s ease-in-out infinite reverse" }} />
    {season.key === "christmas" ? <ChristmasScene /> : slots.map((x, i) => {
      const glyph = season.glyphs[i % season.glyphs.length];
      const size = 22 + ((i * 7) % 5) * 6;
      const fall = season.motion === "fall";
      return (
        <svg
          key={x}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="absolute"
          style={{
            left: `${x}%`,
            top: fall ? "-4%" : undefined,
            bottom: fall ? undefined : "-4%",
            color: season.colors[i % season.colors.length],
            opacity: 0.85,
            ["--dx" as string]: `${i % 2 ? 36 : -36}px`,
            animation: `${fall ? "fall" : "rise"} ${10 + (i % 5) * 2}s linear ${-i * 1.7}s infinite`,
          }}
        >
          {shapes[glyph]}
        </svg>
      );
    })}
  </>
);
