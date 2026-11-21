import { useEffect, useState } from "react";

const query = "(max-width: 767px), (pointer: coarse)";
const read = () => typeof window !== "undefined" && (window.matchMedia(query).matches || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true);

/** True on phones and touch devices: heavy 3D page effects drop to simple fades so scrolling stays smooth. */
export const useLite = () => {
  const [lite, setLite] = useState(read);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setLite(read());
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return lite;
};
