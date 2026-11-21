import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "theme";

const stored = (): Theme => {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light"; // light unless the visitor chose dark
  } catch {
    return "light";
  }
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
