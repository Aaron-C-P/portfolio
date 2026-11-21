import { useEffect, useState } from "react";

/** Becomes true after a short delay. Scroll-triggered animations use it as a safety net so content is never left invisible. */
export const useLate = (ms = 2200): boolean => {
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLate(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return late;
};
