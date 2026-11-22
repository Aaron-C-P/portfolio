import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useLite } from "@/lib/lite";

/**
 * A card that floats gently and tilts toward the pointer in 3D, with a moving shine. On phones and for visitors who
 * prefer less motion it stays flat and still.
 */
export const Tilt3D = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const calm = useReducedMotion();
  const lite = useLite();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 14 });
  const shine = useTransform(px, [-0.5, 0.5], ["20%", "80%"]);

  if (calm || lite) return <div className={className}>{children}</div>;

  const move = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-3xl shadow-2xl shadow-violet/30"
      >
        {children}
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)", backgroundSize: "250% 100%", backgroundPositionX: shine }} />
      </motion.div>
    </div>
  );
};
