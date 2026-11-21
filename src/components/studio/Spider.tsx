import type { SVGProps } from "react";

/** The Webber's spider: a round body, a small head and eight bent legs. Inherits the text colour. */
export const Spider = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <ellipse cx="12" cy="14" rx="3.6" ry="4.4" fill="currentColor" fillOpacity="0.18" />
    <circle cx="12" cy="8.2" r="1.9" fill="currentColor" fillOpacity="0.18" />
    <path d="M9 11.5 5 8 2.5 9.5M8.6 14.2 3.5 14.2 2 17M9 16.8 5.5 20 4 22M15 11.5 19 8 21.5 9.5M15.4 14.2 20.5 14.2 22 17M15 16.8 18.5 20 20 22" />
    <path d="M12 2v4.4" strokeDasharray="1.2 1.6" />
  </svg>
);
