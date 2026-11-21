import type { ReactNode, SVGProps } from "react";

/**
 * Résumé Studio's icon: a page with a second layer behind it (the art and the words are separate layers) and a check
 * for "ATS-ready". Same line style as the Webber's spider, and inherits the text colour.
 */
export const ResumeStudioIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M8.5 3.5h9a2 2 0 0 1 2 2V16" opacity="0.55" />
    <rect x="4" y="6" width="12.5" height="15" rx="2" fill="currentColor" fillOpacity="0.16" />
    <path d="M7.2 10.5h6.2M7.2 13.5h6.2M7.2 16.5h3" />
    <circle cx="17" cy="18.5" r="3.6" fill="currentColor" fillOpacity="0.2" />
    <path d="m15.4 18.6 1.2 1.2 2.1-2.4" />
  </svg>
);

const tones = {
  violet: "from-violet-400 to-violet-700 text-white",
  amber: "from-amber-200 to-amber-400 text-ink",
} as const;

/** A rounded-square app tile, the shape phones use for app icons. */
export const AppTile = ({ tone, size = "h-16 w-16", children }: { tone: keyof typeof tones; size?: string; children: ReactNode }) => (
  <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-[1.4rem] bg-gradient-to-br shadow-lg ring-1 ring-white/25 ${size} ${tones[tone]}`}>
    {children}
  </span>
);
