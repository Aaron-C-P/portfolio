import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import * as CANNON from "cannon-es";

/**
 * A live 3D physics world behind every page. Real rigid-body physics (cannon-es) drawn with three.js.
 * The world changes behaviour with where the visitor is on the site, and they can push it around:
 *   float  - drifting in zero gravity (home, writing, feed, about)
 *   pile   - gravity on: objects fall and stack on the bottom edge (work, services)
 *   orbit  - pulled into a slow orbit (skills, journey)
 *   gather - drawn toward the page's call to action (contact, book, pay)
 * Moving the pointer repels objects, clicking sends out a shockwave, scrolling drags them, and changing
 * page throws everything into the next mood. It stays off for visitors who prefer reduced motion.
 */
type Mood = "float" | "pile" | "orbit" | "gather";

const MOODS: Record<string, Mood> = { "/work": "pile", "/services": "pile", "/skills": "orbit", "/journey": "orbit", "/contact": "gather", "/book": "gather", "/pay": "gather" };
const moodFor = (p: string): Mood => MOODS[p] ?? (p.startsWith("/work/") ? "pile" : "float");
const OFF = (p: string) => p.startsWith("/admin") || p === "/intro";

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#f5e6c8", "#fbbf24", "#6d28d9"];
const FOV = 50;
const DEPTH = 16;

const PhysicsBackdrop = () => {
  const { pathname } = useLocation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const mood = useRef<Mood>(moodFor(pathname));
  const off = useRef(OFF(pathname));
  const burst = useRef<() => void>(() => undefined);

  useEffect(() => {
    mood.current = moodFor(pathname);
    off.current = OFF(pathname);
    burst.current();
  }, [pathname]);

  useEffect(() => {
    const el = canvas.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the site simply has no backdrop
    }
    // If the browser drops the GPU context (low memory), stop quietly instead of throwing every frame.
    let lost = false;
    el.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      lost = true;
    });
    el.addEventListener("webglcontextrestored", () => (lost = false));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = DEPTH;
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(5, 8, 6);
    scene.add(sun);

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    world.defaultContactMaterial.restitution = 0.55;
    world.defaultContactMaterial.friction = 0.15;

    // Invisible walls keep everything inside the visible screen.
    const walls = Array.from({ length: 6 }, () => {
      const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      world.addBody(b);
      return b;
    });
    let halfW = 8;
    let halfH = 5;
    const place = () => {
      halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * DEPTH;
      halfW = halfH * camera.aspect;
      const [floor, ceil, left, right, back, front] = walls;
      floor.position.set(0, -halfH, 0);
      floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      ceil.position.set(0, halfH, 0);
      ceil.quaternion.setFromEuler(Math.PI / 2, 0, 0);
      left.position.set(-halfW, 0, 0);
      left.quaternion.setFromEuler(0, Math.PI / 2, 0);
      right.position.set(halfW, 0, 0);
      right.quaternion.setFromEuler(0, -Math.PI / 2, 0);
      back.position.set(0, 0, -3);
      front.position.set(0, 0, 3);
      front.quaternion.setFromEuler(0, Math.PI, 0);
    };

    const small = window.innerWidth < 768;
    const count = small ? 12 : 24;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const things = Array.from({ length: count }, (_, i) => {
      const r = 0.45 + Math.random() * 0.75;
      const geo: THREE.BufferGeometry = [new THREE.IcosahedronGeometry(r, 0), new THREE.OctahedronGeometry(r * 1.15), new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4), new THREE.SphereGeometry(r, 20, 14), new THREE.TorusGeometry(r * 0.8, r * 0.3, 12, 24)][i % 5];
      const mat = new THREE.MeshStandardMaterial({ color: COLORS[i % COLORS.length], roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.88 });
      geometries.push(geo);
      materials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      const body = new CANNON.Body({ mass: r * r * r * 2, shape: new CANNON.Sphere(r * 0.95), linearDamping: 0.2, angularDamping: 0.1 });
      body.position.set((Math.random() * 2 - 1) * 6, (Math.random() * 2 - 1) * 4, (Math.random() * 2 - 1) * 2);
      body.angularVelocity.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      world.addBody(body);
      return { mesh, body, r };
    });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      place();
      things.forEach(({ body }) => {
        body.position.x = Math.max(-halfW + 1, Math.min(halfW - 1, body.position.x));
        body.position.y = Math.max(-halfH + 1, Math.min(halfH - 1, body.position.y));
      });
    };
    resize();
    window.addEventListener("resize", resize);

    // Pointer and scroll
    const pointer = { x: 0, y: 0, on: false };
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      pointer.on = true;
    };
    const onLeave = () => (pointer.on = false);
    const onDown = (e: PointerEvent) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2 * halfW;
      const py = -(e.clientY / window.innerHeight - 0.5) * 2 * halfH;
      things.forEach(({ body }) => {
        const dx = body.position.x - px;
        const dy = body.position.y - py;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 7) body.applyImpulse(new CANNON.Vec3((dx / d) * (1 - d / 7) * 14 * body.mass, (dy / d) * (1 - d / 7) * 14 * body.mass, 0));
      });
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      const dy = Math.max(-120, Math.min(120, window.scrollY - lastY));
      lastY = window.scrollY;
      things.forEach(({ body }) => body.applyImpulse(new CANNON.Vec3(0, dy * 0.03 * body.mass, 0)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // A page change throws everything toward the next mood.
    burst.current = () =>
      things.forEach(({ body }) => body.applyImpulse(new CANNON.Vec3((Math.random() - 0.5) * 12 * body.mass, (Math.random() - 0.3) * 12 * body.mass, (Math.random() - 0.5) * 4 * body.mass)));

    const tmp = new CANNON.Vec3();
    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 1 / 30);
      if (document.hidden || off.current || lost) return;
      const t = clock.elapsedTime;
      const m = mood.current;
      world.gravity.set(0, m === "pile" ? -9 : 0, 0);
      const px = pointer.x * halfW;
      const py = pointer.y * halfH;

      things.forEach(({ body }, i) => {
        body.linearDamping = m === "float" ? 0.15 : m === "pile" ? 0.05 : 0.45;
        const p = body.position;
        if (m === "float") {
          body.applyForce(tmp.set(Math.sin(t * 0.5 + i) * 0.9 * body.mass, Math.cos(t * 0.4 + i * 1.3) * 0.9 * body.mass, 0));
        } else if (m === "orbit") {
          const dx = p.x;
          const dy = p.y;
          const d = Math.hypot(dx, dy) || 1;
          body.applyForce(tmp.set((-dx * 1.1 + (-dy / d) * 3.2) * body.mass, (-dy * 1.1 + (dx / d) * 3.2) * body.mass, (-2 - p.z) * body.mass));
        } else if (m === "gather") {
          body.applyForce(tmp.set((halfW * 0.5 - p.x) * 0.9 * body.mass, (-halfH * 0.25 - p.y) * 0.9 * body.mass, (-1 - p.z) * body.mass));
        }
        if (pointer.on) {
          const dx = p.x - px;
          const dy = p.y - py;
          const d = Math.hypot(dx, dy);
          if (d < 3.2 && d > 0.001) body.applyForce(tmp.set((dx / d) * (1 - d / 3.2) * 55 * body.mass, (dy / d) * (1 - d / 3.2) * 55 * body.mass, 0));
        }
      });

      world.step(1 / 60, dt, 3);
      things.forEach(({ mesh, body }) => {
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      });
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
      burst.current = () => undefined;
      geometries.forEach((g) => g.dispose());
      materials.forEach((x) => x.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 -z-10 opacity-50 ${OFF(pathname) ? "hidden" : ""}`}>
      <canvas ref={canvas} className="h-full w-full" />
    </div>
  );
};

export default PhysicsBackdrop;
