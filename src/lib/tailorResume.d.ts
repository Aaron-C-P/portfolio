import type { Resume } from "./resumeEngine";

export interface Master {
  updated: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  links: string;
  defaultFocus: string;
  focuses: Record<string, { label: string; blurb: string; title: string; summary: string; keywords: string[] }>;
  highlights: { id: string; w: number; tags: string[]; text: string }[];
  jobs: { id: string; org: string; role: string; dates: string; max: number; focusMax?: Record<string, number>; lead?: string[]; only?: string[]; bullets: { w: number; tags: string[]; text: string }[] }[];
  projects: { id: string; w: number; tags: string[]; title: string; stack: string; text: string }[];
  skills: { name: string; tags: string[] }[];
  certs: { what: string; who: string; year: string; tags: string[]; w: number }[];
  education: { school: string; what: string; dates: string };
  awards: string;
  extras: string;
}

export interface Tailored {
  focus: string;
  focusLabel: string;
  matched: string[];
  resume: Resume;
}

export function detectFocus(master: Master, posting: string): { focus: string | null; scores: Record<string, number> };
export function tailor(master: Master, opts?: { focus?: string; posting?: string; contact?: boolean; today?: Date | string }): Tailored;
