export interface Template {
  id: string;
  name: string;
  note: string;
  font: "helvetica" | "times";
  nameSize: number;
  titleSize: number;
  bodySize: number;
  headingSize: number;
  nameAlign: "left" | "center";
  headingAlign: "left" | "center";
  /** Heading underline thickness in points; 0 means no line. */
  rule: number;
  accent: [number, number, number];
  headingColor: "black" | "accent";
  /** Space above each section, in points. */
  gap: number;
  /** Extra space after each line, in points. */
  lineGap: number;
  bullet: string;
  /** Name of the generated art style in resumeArt.js; empty for none. */
  art: string;
  /** Colours the art draws from. */
  pal: number[][];
  /** True when the header is printed in white on a dark band. */
  band: boolean;
  bandH: number;
}

export const TEMPLATES: Template[];
export function templateById(id: string | undefined | null): Template;
export function isTemplateId(id: unknown): boolean;
