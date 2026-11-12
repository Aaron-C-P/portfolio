import { useEffect, useRef, useState } from "react";

/**
 * Moving backdrop for a page. If a video exists at /media/skills-loop.mp4 it plays muted and looping;
 * until you add one, a canvas animation of drifting connected points plays instead. Both sit behind
 * the content, ignore the pointer, and stop for visitors who prefer reduced motion.
 */
const VIDEO = "/media/skills-loop.mp4";

const Canvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const pts = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00025, vy: (Math.random() - 0.5) * 0.00025 }));
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!still) {
          p.x = (p.x + p.vx * 16 + 1) % 1;
          p.y = (p.y + p.vy * 16 + 1) % 1;
        }
      }
      const reach = Math.min(w, 900) * 0.18;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot((pts[i].x - pts[j].x) * w, (pts[i].y - pts[j].y) * h);
          if (d < reach) {
            ctx.strokeStyle = `rgba(139,92,246,${0.35 * (1 - d / reach)})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x * w, pts[i].y * h);
            ctx.lineTo(pts[j].x * w, pts[j].y * h);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(167,139,250,0.55)";
        ctx.beginPath();
        ctx.arc(pts[i].x * w, pts[i].y * h, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const loop = () => {
      if (!document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };
    size();
    window.addEventListener("resize", size);
    if (still) draw();
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);
  return <canvas ref={ref} className="h-full w-full" />;
};

export const LoopBackground = () => {
  const [hasVideo, setHasVideo] = useState(false);
  useEffect(() => {
    // The site rewrites unknown paths to index.html, so check the type, not just the status.
    fetch(VIDEO, { method: "HEAD" })
      .then((r) => setHasVideo(r.ok && (r.headers.get("content-type") ?? "").startsWith("video")))
      .catch(() => setHasVideo(false));
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-70">
      {hasVideo ? <video src={VIDEO} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" /> : <Canvas />}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg,transparent)] via-transparent to-[var(--bg,transparent)]" />
    </div>
  );
};
