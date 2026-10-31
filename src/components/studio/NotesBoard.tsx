import type { ReactNode } from "react";
import { motion } from "framer-motion";

const INK = "#2a2438";
const VIO = "#6a3fe0";
const AMB = "#c2780a";
const GRN = "#1d8a5a";

/** A line that draws itself when the card scrolls into view. */
const Draw = ({ d, c = INK, w = 2, dash, delay = 0 }: { d: string; c?: string; w?: number; dash?: string; delay?: number }) => (
  <motion.path
    d={d}
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={dash}
    initial={{ pathLength: 0 }}
    whileInView={{ pathLength: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.1, delay }}
  />
);

const T = ({ x, y, children, c = INK, s = 13 }: { x: number; y: number; children: ReactNode; c?: string; s?: number }) => (
  <text x={x} y={y} fill={c} fontSize={s} fontFamily="Caveat, cursive" fontWeight={700}>
    {children}
  </text>
);

const Frame = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 240 150" className="h-auto w-full" role="presentation" aria-hidden="true">
    {children}
  </svg>
);

const cards: { title: string; note: string; rot: number; art: ReactNode }[] = [
  {
    title: "one lock, forty people",
    note: "reads out of the lock, jittered retries, idempotency keys (simulated: 9 errors to 0)",
    rot: -2,
    art: (
      <Frame>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={20 + i * 16} cy={50} r={6} fill="none" stroke={INK} strokeWidth={2} />
        ))}
        <Draw d="M108 50 H140" c={AMB} />
        <rect x="140" y="30" width="34" height="40" rx="5" fill="none" stroke={AMB} strokeWidth="2.5" />
        <Draw d="M148 30 v-8 a9 9 0 0 1 18 0 v8" c={AMB} delay={0.3} />
        <T x={146} y={55} c={AMB} s={14}>lock</T>
        <Draw d="M174 50 H205" c={INK} delay={0.5} />
        <Draw d="M60 100 q40 -30 90 0 t60 0" c={GRN} dash="5 5" delay={0.6} />
        <T x={20} y={125} c={GRN} s={15}>reads skip the lock</T>
      </Frame>
    ),
  },
  {
    title: "Packet Tracer, CCNA labs",
    note: "networking foundations: subnets, routing, switching",
    rot: 1.5,
    art: (
      <Frame>
        <rect x="14" y="60" width="34" height="24" rx="3" fill="none" stroke={INK} strokeWidth="2" />
        <rect x="14" y="100" width="34" height="24" rx="3" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="105" cy="92" r="16" fill="none" stroke={VIO} strokeWidth="2.5" />
        <circle cx="175" cy="60" r="16" fill="none" stroke={AMB} strokeWidth="2.5" />
        <Draw d="M48 72 L90 88 M48 112 L90 98 M120 86 L160 66" delay={0.2} />
        <Draw d="M191 60 q30 0 30 -25 q-30 -5 -30 25" c={GRN} delay={0.6} />
        <T x={86} y={125} c={VIO} s={14}>switch</T>
        <T x={156} y={96} c={AMB} s={14}>router</T>
      </Frame>
    ),
  },
  {
    title: "PostgreSQL, schema first",
    note: "keys, joins, indexes: the part that keeps data honest",
    rot: -1,
    art: (
      <Frame>
        <rect x="14" y="20" width="70" height="46" rx="4" fill="none" stroke={INK} strokeWidth="2" />
        <rect x="150" y="20" width="76" height="46" rx="4" fill="none" stroke={INK} strokeWidth="2" />
        <rect x="80" y="92" width="80" height="44" rx="4" fill="none" stroke={VIO} strokeWidth="2" />
        <T x={22} y={38} s={14}>customers</T>
        <T x={158} y={38} s={14}>orders</T>
        <T x={92} y={110} c={VIO} s={14}>order_items</T>
        <Draw d="M84 43 H150" c={AMB} delay={0.2} />
        <Draw d="M188 66 V80 H120 V92" c={AMB} delay={0.5} />
        <T x={96} y={38} c={AMB} s={12}>1 : n</T>
      </Frame>
    ),
  },
  {
    title: "catch the duplicate",
    note: "validate, check, then write to the ledger and the audit log",
    rot: 2,
    art: (
      <Frame>
        <rect x="10" y="50" width="52" height="30" rx="5" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M110 40 l24 25 l-24 25 l-24 -25 z" fill="none" stroke={AMB} strokeWidth="2.5" />
        <rect x="170" y="30" width="56" height="26" rx="5" fill="none" stroke={GRN} strokeWidth="2" />
        <rect x="170" y="80" width="56" height="26" rx="5" fill="none" stroke={VIO} strokeWidth="2" />
        <T x={16} y={70} s={14}>payment</T>
        <T x={97} y={69} c={AMB} s={12}>seen?</T>
        <T x={180} y={48} c={GRN} s={14}>ledger</T>
        <T x={178} y={98} c={VIO} s={14}>audit log</T>
        <Draw d="M62 65 H86" delay={0.1} />
        <Draw d="M134 65 L150 43 H170" c={GRN} delay={0.4} />
        <Draw d="M110 90 L110 110 H168 V96" c={VIO} dash="4 4" delay={0.7} />
      </Frame>
    ),
  },
  {
    title: "tamper-evident records",
    note: "every move has a holder, a place and a reason; a correction never hides the original",
    rot: -1.5,
    art: (
      <Frame>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={14 + i * 78} y="40" width="62" height="44" rx="5" fill="none" stroke={INK} strokeWidth="2" />
            <T x={22 + i * 78} y={60} s={13}>entry {i + 1}</T>
            <T x={22 + i * 78} y={76} c={VIO} s={11}>hash</T>
          </g>
        ))}
        <Draw d="M76 62 H92 M154 62 H170" c={VIO} delay={0.2} />
        <Draw d="M200 90 q10 25 -20 30" c={AMB} delay={0.6} />
        <T x={90} y={125} c={AMB} s={14}>correction, tagged</T>
      </Frame>
    ),
  },
  {
    title: "KPIs a manager reads",
    note: "revenue, growth, a moving average, day-of-week patterns (illustrative data)",
    rot: 1,
    art: (
      <Frame>
        {[40, 62, 50, 88, 74, 104].map((h, i) => (
          <motion.rect
            key={i}
            x={20 + i * 22}
            width="14"
            rx="2"
            fill={VIO}
            opacity={0.8}
            initial={{ height: 0, y: 130 }}
            whileInView={{ height: h, y: 130 - h }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
          />
        ))}
        <Draw d="M25 100 L47 84 L69 92 L91 62 L113 70 L135 40" c={AMB} w={2.5} delay={0.5} />
        <T x={160} y={50} c={AMB} s={15}>7-day avg</T>
        <T x={160} y={72} s={14}>+ growth</T>
      </Frame>
    ),
  },
  {
    title: "the best you can do within a limit",
    note: "Lagrange: the objective touches the constraint at one point",
    rot: -2,
    art: (
      <Frame>
        <Draw d="M20 130 V15 M20 130 H225" />
        <Draw d="M40 25 Q120 60 205 125" c={AMB} w={2.5} delay={0.2} />
        <Draw d="M70 125 Q120 20 190 35" c={VIO} dash="5 4" delay={0.5} />
        <circle cx="130" cy="83" r="5" fill={GRN} />
        <T x={150} y={70} c={GRN} s={14}>tangent point</T>
        <T x={28} y={30} c={VIO} s={13}>objective</T>
        <T x={168} y={118} c={AMB} s={13}>constraint</T>
      </Frame>
    ),
  },
  {
    title: "robotics, maths, physics",
    note: "interests, not credentials: two joints, two angles, one sine wave",
    rot: 1.5,
    art: (
      <Frame>
        <Draw d="M40 120 L40 70 L90 40" c={INK} w={4} />
        <circle cx="40" cy="120" r="6" fill={INK} />
        <circle cx="40" cy="70" r="5" fill="none" stroke={VIO} strokeWidth="2" />
        <circle cx="90" cy="40" r="5" fill="none" stroke={VIO} strokeWidth="2" />
        <Draw d="M40 100 a20 20 0 0 1 8 -22" c={AMB} delay={0.3} />
        <T x={52} y={96} c={AMB} s={14}>θ1</T>
        <T x={98} y={44} c={AMB} s={14}>θ2</T>
        <Draw d="M120 100 q15 -45 30 0 t30 0 t30 0" c={GRN} w={2.5} delay={0.5} />
        <T x={130} y={125} c={GRN} s={14}>y = A sin(ωt)</T>
      </Frame>
    ),
  },
  {
    title: "perspective sets the path",
    note: "progress is rarely a straight line; resilience is recalibration",
    rot: -1,
    art: (
      <Frame>
        <Draw d="M20 130 V15 M20 130 H225" />
        <Draw d="M25 120 C70 110 80 90 110 85 S150 70 170 45 S205 25 218 22" c={GRN} w={3} delay={0.2} />
        <Draw d="M25 120 L218 40" c={INK} dash="4 5" w={1.5} delay={0.6} />
        <T x={30} y={30} c={GRN} s={14}>growth through challenges</T>
        <T x={120} y={120} s={13}>the straight line we expect</T>
      </Frame>
    ),
  },
];

/** A hand-drawn study wall in the spirit of a sketchnote board: concepts from my own projects and learning. */
export const NotesBoard = () => (
  <div className="rounded-[2rem] border border-line bg-raise p-4 md:p-8">
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <motion.li
          key={c.title}
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
          className="relative rounded-md bg-[#f4efe0] p-4 pb-5 text-[#2a2438] shadow-xl shadow-black/30"
        >
          <span aria-hidden="true" className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] bg-[#feeeaf]/80 shadow" />
          <div className="rounded p-2" style={{ background: "rgba(255,255,255,0.7)" }}>{c.art}</div>
          <p className="mt-3 font-hand text-2xl leading-tight">{c.title}</p>
          <p className="mt-1 text-sm text-[#5b5470]">{c.note}</p>
        </motion.li>
      ))}
    </ul>
  </div>
);
