import type { Template } from "./resumeTemplates.js";

export interface Shape {
  k: "poly" | "circle";
  /** poly: x,y pairs in points. */
  pts?: number[];
  x?: number;
  y?: number;
  r?: number;
  c: number[];
  fill?: boolean;
  stroke?: boolean;
  w?: number;
  /** Repeats on every page. */
  edge?: boolean;
}

export const PAGE_W: number;
export const PAGE_H: number;
export function hashSeed(s: string | undefined | null): number;
export function artFor(template: Template, name: string | undefined | null): Shape[];
