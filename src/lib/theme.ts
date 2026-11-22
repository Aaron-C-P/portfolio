import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "theme";

/** Light by day, dark from 7pm to 7am, unless the visitor has picked one with the toggle. */
export const byTimeOfDay = (d = new Date()): Theme => (d.getHours() >= 19 || d.getHours() < 7 ? "dark" : "light");

const stored = (): Theme => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* no storage: follow the clock */
  }
  return byTimeOfDay();
};

export const applyTheme = (t: Theme) => {
  document.documentElement.setAttribute("data-theme", t);
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(stored);
  useEffect(() => applyTheme(theme), [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const n: Theme = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, n);
      } catch {
        /* private mode: applies for this visit only */
      }
      return n;
    });
  }, []);
  return { theme, toggle };
};
