export interface Block {
  kind: "name" | "title" | "contact" | "heading" | "role" | "text" | "bullet";
  text: string;
  /** Right-aligned text on the same line (dates). */
  aside?: string;
}

export interface ResumeShape {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  skills: string;
  experience: { role: string; org: string; dates: string; bullets: string[] }[];
  education: { school: string; what: string; dates: string }[];
}

export function resumeBlocks(r: ResumeShape): Block[];
export function sanitizeResume(raw: unknown): ResumeShape;
