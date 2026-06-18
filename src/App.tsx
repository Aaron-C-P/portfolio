import { useState, useEffect, useRef } from "react";
import { useForm, ValidationError } from "@formspree/react";
import profilePhoto from "@/assets/portfolio/profile-photo.jpg";
import egzitMockup from "@/assets/portfolio/egzit-mockup.png";
import bnsPreorder from "@/assets/portfolio/bns-preorder.png";
import preqApp from "@/assets/portfolio/preq-app.png";

/* ============================================================
   Inline SVG icons
   ============================================================ */
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM19 19h-3v-5.6c0-1.3-.5-2.2-1.7-2.2-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3V8h3v1.5c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.1V19z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="1" />
    <path d="m2 6 10 7L22 6" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);
const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
  </svg>
);

/* ============================================================
   Data
   ============================================================ */
const RESUME_URL =
  "https://drive.google.com/file/d/1EnEtEyJYoFUAIWK48TKc4A0S18dQROjx/view?usp=sharing";

// Résumé is being updated — blocked for now.
// Flip RESUME_AVAILABLE to true to restore the download link.
const RESUME_AVAILABLE: boolean = false;
const RESUME_REQUEST =
  "mailto:aaron7prince@gmail.com?subject=" +
  encodeURIComponent("Résumé request") +
  "&body=" +
  encodeURIComponent(
    "Hi Aaron,\n\nCould you please send your latest résumé when it's ready? Thank you!"
  );

const navItems = [
  { id: "hero", label: "HOME" },
  { id: "ai", label: "AI" },
  { id: "work", label: "WORK" },
  { id: "career", label: "CAREER" },
  { id: "stack", label: "STACK" },
  { id: "writing", label: "WRITING" },
  { id: "contact", label: "CONTACT" },
];

const marqueeTechs = [
  "JavaScript", "TypeScript", "React", "Next.js", "Redux", "Tailwind",
  "Node.js", "REST API", "GraphQL", "PostgreSQL", "MySQL", "Docker",
  "Kubernetes", "AWS", "Postman", "LangGraph", "RAG", "GitHub",
];

const secondaryProjects = [
  {
    ref: "REF_005",
    title: "Orbita Commerce",
    sub: "Relational E-Commerce",
    desc: "Full-stack storefront with secure checkout, role-based access control, and stored procedures for order processing — prepared statements against SQL injection (OWASP) and composite indexing for performance.",
    tags: ["PHP", "MySQL", "RBAC"],
    href: "https://github.com/Aaron-C-P/Orbita",
    icon: "github" as const,
  },
  {
    ref: "REF_006",
    title: "Vault Guardian",
    sub: "Encrypted Password Manager",
    desc: "A secure tool for password storage and generation using industry-standard encryption practices to keep user credentials safe at rest and in transit.",
    tags: ["TypeScript", "Cryptography", "Security"],
    href: "https://github.com/Aaron-C-P/vault-keeper-simple-key",
    icon: "github" as const,
  },
  {
    ref: "REF_007",
    title: "Hurricane Watch JA",
    sub: "Real-Time Weather Monitoring",
    desc: "A live hurricane and weather monitoring app for Jamaica with real-time camera feeds and storm updates during severe-weather events.",
    tags: ["JavaScript", "APIs", "Real-time"],
    href: "https://safe-eye.netlify.app/#storm-tracker",
    icon: "external" as const,
  },
  {
    ref: "REF_008",
    title: "R Code Data Lab",
    sub: "QR Data Platform",
    desc: "A platform exploring QR-code data storage, chunking for larger files, and session authentication — built with a technical, cybersecurity-focused aesthetic. Generator, size analyzer, and chunking demos.",
    tags: ["React", "QR Code", "Auth"],
    href: null,
    icon: "none" as const,
  },
  {
    ref: "REF_009",
    title: "Smart Baby Bed Set",
    sub: "IoT Safety & Accessibility",
    desc: "A human-centered smart bed designed to minimize SIDS risk and support caregivers with disabilities — automated temperature regulation, gentle rocking, and multimodal (tactile / visual / audio) alerts. Spans software engineering, networking, databases, QA, and HCI.",
    tags: ["IoT", "C++", "HCI"],
    href: null,
    icon: "none" as const,
  },
  {
    ref: "REF_010",
    title: "More on GitHub",
    sub: "Full Repository Archive",
    desc: "Explore the complete archive of repositories, experiments, and works in progress — including coursework and ongoing builds.",
    tags: ["github.com/Aaron-C-P"],
    href: "https://github.com/Aaron-C-P",
    icon: "card-link" as const,
  },
];

const stackCats = [
  {
    no: "/01",
    name: "Front-End",
    chips: ["React", "Next.js", "TypeScript", "JavaScript", "Redux", "Tailwind CSS", "Nuxt / Vue", "Accessible UI"],
  },
  {
    no: "/02",
    name: "Back-End",
    chips: ["Node.js", "Express", "Python", "REST APIs", "GraphQL", "Microservices"],
  },
  {
    no: "/03",
    name: "Databases",
    chips: ["PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase", "Azure SQL"],
  },
  {
    no: "/04",
    name: "Cloud & DevOps",
    chips: ["Docker", "Kubernetes", "AWS", "CI/CD", "GitHub", "Postman", "VS Code", "Jira"],
  },
  {
    no: "/05",
    name: "Security & Compliance",
    chips: ["Secure Coding", "OWASP / SQLi Prevention", "RBAC", "Data Integrity"],
  },
  {
    no: "/06",
    name: "AI Engineering",
    chips: ["LangGraph", "RAG", "Claude Code", "Prompt Engineering", "Human-Validated"],
  },
];

const writingItems = [
  {
    no: "001",
    title: "Gentle Architect: The Lonely Build",
    meta: "Self-Published Book · 2026",
    href: "https://www.amazon.com/s?k=Gentle+Architect+The+Lonely+Build",
  },
  {
    no: "002",
    title: "Caricature Art Popularity Across Jamaica",
    meta: "Jamaica Gleaner · Growth & Jobs · 2026",
    href: "https://jamaica-gleaner.com/article/news/20260210/growth-jobs-caricature-art-popularity-across-jamaica",
  },
  {
    no: "003",
    title: "GenAI, Future Role & Professionalization of Foreign Language Teachers",
    meta: "Co-Author · Academic · 2025",
    href: null,
  },
  {
    no: "004",
    title: "Lines of Frustration: The Aftermath of Chaos",
    meta: "Jamaica Gleaner · Op-Ed · 2025",
    href: "https://jamaica-gleaner.com/article/letters/20251115/lines-frustration-aftermath-chaos",
  },
  {
    no: "005",
    title: "Enhancing Education Without Replacing Traditional Methods",
    meta: "Jamaica Observer · Op-Ed · 2024",
    href: "https://www.jamaicaobserver.com/2024/05/30/enhancing-education-without-replacing-traditional-methods/",
  },
];

const recognition = [
  { no: "R/01", txt: "NCB Grant Awardee — 3 consecutive quarters", sub: "Merit Funding" },
  { no: "R/02", txt: "Top Student — Software Engineering", sub: "Academic" },
  { no: "R/03", txt: "GPA 3.5 · Honor Roll standing", sub: "Academic" },
  { no: "R/04", txt: "Sagicor Scholarship Interview Candidate", sub: "Shortlisted" },
  { no: "R/05", txt: "Leadership Recognition", sub: "Service" },
  { no: "R/06", txt: "Published in national press & academia", sub: "Writing" },
];

const suggestedQuestions = [
  "What do you build?",
  "Tell me about EGZIT",
  "What's Jamoment?",
  "Your tech stack?",
  "How can I reach you?",
];

// deterministic bar/gap widths (px) for the badge barcode (even idx = bar)
const barcodePattern = [
  3, 2, 1, 2, 4, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1,
  3, 2, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 1, 2, 3, 1, 2, 1,
];

/* ============================================================
   Offline fallback for the AI clone (used if /api/chat is
   unavailable — e.g. local dev, or no API key set on Vercel)
   ============================================================ */
function localReply(raw: string): string {
  const t = raw.toLowerCase();
  const has = (...ks: string[]) => ks.some((k) => t.includes(k));
  if (has("hello", "hi ", "hey", " yo", "gwaan", "good morning", "good day", "greet"))
    return "Hey! Good to meet you. Ask me about my projects, my stack, or how to get in touch.";
  if (has("egzit"))
    return "EGZIT is my full-stack moving-logistics marketplace — AI-assisted inventory, QR tracking, real-time WebSockets, geospatial routing, and Stripe checkout. Built with React, TypeScript, PostgreSQL and Supabase.";
  if (has("bns", "scotia", "lunch"))
    return "BNS Lunch Pre-Order is a live internal tool I built for Bank of Nova Scotia staff in Mandeville — a clean UI over a Google Sheets backend with duplicate-submission control so each order lands exactly once.";
  if (has("preq", "taj", "queue", "tax admin"))
    return "SoftQ / TAJ Pre-Queue is a real-time scheduling system for Tax Administration Jamaica. The key piece is concurrency-safe booking — no double-booking — which cuts in-person wait times.";
  if (has("jamoment"))
    return 'Jamoment is my own venture: a marketplace for authentic Jamaican experiences with verified local hosts and an AI "Dream Engine" for curation — built so tourism money stays local. Real places, real people, real moments.';
  if (has("orbita"))
    return "Orbita Commerce is a full-stack storefront — secure checkout, role-based access control, and stored procedures, with prepared statements against SQL injection. PHP + MySQL.";
  if (has("vault"))
    return "Vault Guardian is an encrypted password manager — secure storage and generation using industry-standard encryption, keeping credentials safe at rest and in transit.";
  if (has("hurricane", "weather", "storm"))
    return "Hurricane Watch JA is a real-time weather-monitoring app for Jamaica with live camera feeds and storm updates during severe weather.";
  if (has("hire", "available", "reach", "contact", "email", "work with", "collab", "resume", "cv", "open to"))
    return "I'm open to full-stack / web-developer roles, remote-friendly. The best way to reach me is aaron7prince@gmail.com, or the contact form lower down. My résumé is being updated right now — email me and I'll send the latest copy.";
  if (has("stack", "tech", "language", "framework", "tool", "skill"))
    return "Front end: React, Next.js, TypeScript, Tailwind, Redux. Back end: Node, Python, REST + GraphQL. Data: PostgreSQL, MySQL, Mongo, Supabase. Cloud/DevOps: Docker, Kubernetes, AWS. And AI: LangGraph + RAG. Security is my throughline.";
  if (has("security", "secure", "owasp", "rbac", "hack", "vuln"))
    return "Security is my engineering bias — secure coding, OWASP / SQL-injection prevention, RBAC, and data integrity from the first commit, not bolted on later.";
  if (has("langgraph", "rag", "llm", "claude", " ai", "ai ", "agent", "model"))
    return "On the AI side I work with LangGraph and RAG pipelines, and I use Claude Code in my workflow — always human-validated. This chat is a small example of that.";
  if (has("intern", "larvation", "experience", "worked", "career"))
    return "I was a Web Development Intern at Larvation Web LLC (remote, 2026) — building full-stack features and RESTful APIs in Node.js + TypeScript on the Nuxt stack, in agile reviews with senior engineers.";
  if (has("school", "study", "degree", "university", "education", "ncu", "graduate", "gpa", "class of"))
    return "I'm a BSc Computer Science graduate from Northern Caribbean University — Class of 2026, Top Student in Software Engineering, GPA 3.5 and Honor Roll.";
  if (has("write", "writing", "book", "article", "gleaner", "observer", "author", "publish"))
    return 'I write too — a self-published book, "Gentle Architect: The Lonely Build," an academic paper on GenAI, and op-eds and features in the Jamaica Gleaner and Observer.';
  if (has("where", "location", "jamaica", "based", "live", "from"))
    return "I'm based in Mandeville, Manchester, Jamaica — and happy to work remote.";
  if (has("who are you", "yourself", "about you", "your name"))
    return "I'm Aaron Prince — a full-stack developer and CS graduate from Jamaica with a security-first streak. Ask me about my work or how to hire me.";
  if (has("philosophy", "motto", "principle", "believe"))
    return "I believe most things aren't truly hard — only unfamiliar. So I keep building until they're familiar. And I build like someone's already trying to break it.";
  if (has("project", "build", "portfolio", "made"))
    return "I've shipped a bunch — EGZIT (AI logistics marketplace), the BNS staff tool, TAJ Pre-Queue, plus my own venture Jamoment, and smaller builds like Vault Guardian and Hurricane Watch JA. Want detail on any one?";
  return "Good question. I'm a small offline version of Aaron's AI right now, so for anything specific the surest bet is to email aaron7prince@gmail.com. You can also ask me about his projects, stack, or background.";
}

type Msg = { role: "user" | "assistant"; content: string };

/* ============================================================
   AI clone chat widget
   ============================================================ */
function AICloneChat() {
  const greeting: Msg = {
    role: "assistant",
    content:
      "Hey — I'm Aaron's AI clone. Ask me anything about his projects, his stack, or how to work with him.",
  };
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);

    let replied = false;
    if (liveMode) {
      try {
        // strip any leading assistant turns so history starts with a user msg
        const history = next.filter((m) => m.role === "user" || m.role === "assistant");
        while (history.length && history[0].role === "assistant") history.shift();
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.includes("application/json")) {
          const data = await r.json();
          if (data && typeof data.reply === "string" && data.reply.trim()) {
            setMessages((m) => [...m, { role: "assistant", content: data.reply.trim() }]);
            replied = true;
          }
        }
        if (!replied) setLiveMode(false);
      } catch {
        setLiveMode(false);
      }
    }
    if (!replied) {
      await new Promise((res) => setTimeout(res, 380));
      setMessages((m) => [...m, { role: "assistant", content: localReply(q) }]);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="clone">
        <div className="clone-head">
          <span className="av">
            <img src={profilePhoto} alt="Aaron Prince" />
          </span>
          <span className="meta">
            <span className="nm">Aaron's AI</span>
            <span className="st">
              <span className="gdot"></span>Online · ask me anything
            </span>
          </span>
        </div>

        <div className="clone-msgs" ref={msgsRef}>
          {messages.map((m, i) => (
            <div className={`msg ${m.role === "user" ? "user" : "bot"}`} key={i}>
              <span className="mav">
                {m.role === "user" ? "YOU" : <img src={profilePhoto} alt="Aaron" />}
              </span>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="msg bot">
              <span className="mav">
                <img src={profilePhoto} alt="Aaron" />
              </span>
              <div className="typing">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          )}
        </div>

        <div className="clone-suggest">
          {suggestedQuestions.map((s) => (
            <button className="sg-chip" key={s} onClick={() => send(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>

        <div className="clone-input">
          <input
            type="text"
            value={input}
            placeholder="Ask my AI clone a question…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            aria-label="Message Aaron's AI"
          />
          <button
            className="clone-send"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </div>
      <p className="clone-note">
        This is an AI clone of Aaron and may get things wrong. For anything important,
        email aaron7prince@gmail.com.
      </p>
    </>
  );
}

/* ============================================================
   App
   ============================================================ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSec, setActiveSec] = useState("hero");
  const [clock, setClock] = useState("--:--:-- JA");
  const year = new Date().getFullYear();

  const [theme, setTheme] = useState<string>(
    () =>
      (typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme")) ||
      "light"
  );
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const [formState, handleSubmit] = useForm("mnjqgkgz");

  // nav scrolled + active section
  useEffect(() => {
    const secIds = navItems.map((n) => n.id);
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let cur = "hero";
      const y = window.scrollY + 220;
      for (const id of secIds) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop) cur = id;
      }
      setActiveSec(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // live Jamaica clock (UTC-5, no DST)
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const u = d.getTime() + d.getTimezoneOffset() * 60000;
      const ja = new Date(u - 5 * 3600000);
      const p = (n: number) => String(n).padStart(2, "0");
      setClock(`${p(ja.getHours())}:${p(ja.getMinutes())}:${p(ja.getSeconds())} JA`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ============ NAV ============ */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
        <div className="nav-inner">
          <a href="#hero" className="brand">
            <span className="dot"></span>AARON_PRINCE
          </a>
          <div className="nav-links">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} className={activeSec === n.id ? "active" : ""}>
                {n.label}
              </a>
            ))}
          </div>
          <div className="nav-right">
            <span className="status-pill">
              <span className="live"></span>Open to work
            </span>
            {RESUME_AVAILABLE ? (
              <a className="btn" href={RESUME_URL} target="_blank" rel="noopener">
                RÉSUMÉ ↗
              </a>
            ) : (
              <a
                className="btn resume-pending"
                href={RESUME_REQUEST}
                title="Résumé is being updated — click to request the latest copy"
              >
                RÉSUMÉ
                <span className="upd">UPDATING</span>
              </a>
            )}
            <button
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title="Toggle light / dark"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="menu-btn" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
              <MenuIcon />
            </button>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {navItems.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={closeMenu}>
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <div className="hero-grid-bg"></div>
        <div className="wrap hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow eyebrow">
              <span className="tick">▹</span>FULL-STACK ENGINEER — JAMAICA ↔ REMOTE
            </div>
            <h1 className="display">
              <span className="ln">
                <span>AARON</span>
              </span>
              <span className="ln">
                <span>PRINCE</span>
              </span>
            </h1>
            <div className="idx mono">BSc COMPUTER SCIENCE · CLASS OF 2026</div>
            <p className="tagline">
              I design, build, and ship secure full-stack web applications — from responsive
              React front ends to scalable Node.js &amp; Python APIs.
            </p>
            <p className="sub">
              Computer Science graduate with a security-conscious engineering bias: secure
              coding, RBAC, and OWASP-aware design baked in from the first commit. I turn real
              problems — civic queues, moving logistics, tourism — into software people actually
              use.
            </p>
            <div className="hero-cta">
              <a href="#work" className="btn btn-amber">
                VIEW WORK →
              </a>
              <a href="#ai" className="btn">
                CHAT WITH MY AI
              </a>
            </div>
            <div className="socials">
              <a href="https://github.com/Aaron-C-P" target="_blank" rel="noopener" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a href="https://linkedin.com/in/aaron-prince-b912b121" target="_blank" rel="noopener" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="mailto:aaron7prince@gmail.com" aria-label="Email">
                <MailIcon />
              </a>
              <a href="tel:+18767902268" aria-label="Phone">
                <PhoneIcon />
              </a>
            </div>
          </div>

          <div className="readout reveal">
            <div className="lanyard">
              <div className="lan-strap"></div>
              <div className="lan-clip"></div>
              <div className="badge-card">
                <div className="badge-hole"></div>
                <div className="badge-flourish">
                  <span>Full–Stack</span>
                  <span>Engineer</span>
                </div>
                <div className="badge-photo">
                  <img src={profilePhoto} alt="Aaron Prince" />
                </div>
                <div className="badge-name">AARON PRINCE</div>
                <div className="badge-role">BSc COMP-SCI · CLASS OF 2026</div>
                <div className="badge-barcode">
                  {barcodePattern.map((w, i) => (
                    <span
                      key={i}
                      style={{
                        width: w + "px",
                        background: i % 2 === 0 ? "#E8920C" : "transparent",
                      }}
                    ></span>
                  ))}
                </div>
                <div className="badge-id mono">
                  JM&nbsp;·&nbsp;<span>{clock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="stats reveal">
          <div className="wrap stats-inner">
            <div className="stat">
              <div className="n">
                9<span className="u">+</span>
              </div>
              <div className="l">Shipped builds</div>
            </div>
            <div className="stat">
              <div className="n">3.5</div>
              <div className="l">GPA · Honor Roll</div>
            </div>
            <div className="stat">
              <div className="n">
                5<span className="u">+</span>
              </div>
              <div className="l">Certifications</div>
            </div>
            <div className="stat">
              <div className="n">
                5<span className="u">×</span>
              </div>
              <div className="l">Published works</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AI CLONE ============ */}
      <section className="block" id="ai">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>01 — TALK TO MY AI
            </span>
            <h2 className="display">Chat with my AI clone</h2>
            <p className="lead">
              An AI trained on my work and personality. Ask it about my projects, my stack, or
              whether I'd be a fit for your team — it answers the way I would.
            </p>
          </div>
          <div className="clone-wrap reveal">
            <AICloneChat />
          </div>
        </div>
      </section>

      {/* ============ QUOTE BAND ============ */}
      <section className="quote-band">
        <div className="hero-grid-bg"></div>
        <div className="quote-wrap reveal">
          <div className="qmark">"</div>
          <div className="qtext">
            I build like someone's <em>already trying to break it</em>.
          </div>
          <div className="qby">My operating principle</div>
        </div>
      </section>

      {/* ============ TECH MARQUEE ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marqueeTechs, ...marqueeTechs].map((t, i) => (
            <span className="marq-item" key={i}>
              {t}
              <span className="sep"></span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ WORK ============ */}
      <section className="block" id="work">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>02 — SELECTED BUILDS
            </span>
            <h2 className="display">Things I've shipped</h2>
            <p className="lead">
              A log of applications I've designed and built end to end — full-stack systems,
              real users, real constraints. Live demos and source where available.
            </p>
          </div>

          {/* FEATURE 1: EGZIT */}
          <div className="feature reveal">
            <div className="f-media">
              <img src={egzitMockup} alt="EGZIT platform" />
            </div>
            <div className="f-body">
              <div className="f-ref">
                <span>REF_001</span>
                <span className="dash"></span>
                <span>FEATURED</span>
              </div>
              <div className="f-sub">AI-Driven Logistics Platform</div>
              <div className="f-title display">EGZIT</div>
              <p className="f-desc">
                A full-stack moving-logistics marketplace with AI-assisted inventory, QR-code
                tracking, real-time WebSocket data pipelines, and geospatial route optimization
                — on a relational schema modelling items, moves, users, and routes. Integrated
                Stripe checkout and live GPS tracking.
              </p>
              <div className="f-out mono">
                OUTPUT: <b>End-to-end logistics marketplace with live tracking + payments</b>
              </div>
              <div className="tags">
                <span className="tag">React</span>
                <span className="tag">TypeScript</span>
                <span className="tag">PostgreSQL</span>
                <span className="tag">WebSockets</span>
                <span className="tag">Supabase</span>
                <span className="tag">Stripe</span>
                <span className="tag">Geospatial</span>
              </div>
              <div className="f-links">
                <a href="https://egzit-1-0-final.vercel.app/" target="_blank" rel="noopener">
                  <ExternalIcon />
                  Live demo
                </a>
                <a href="https://github.com/Aaron-C-P/Egzit-1.0-Final" target="_blank" rel="noopener">
                  <GitHubIcon />
                  Source
                </a>
              </div>
            </div>
          </div>

          {/* FEATURE 2: BNS */}
          <div className="feature rev reveal">
            <div className="f-media">
              <img src={bnsPreorder} alt="BNS Lunch Pre-Order" />
            </div>
            <div className="f-body">
              <div className="f-ref">
                <span>REF_002</span>
                <span className="dash"></span>
                <span>FEATURED</span>
              </div>
              <div className="f-sub">Staff Ordering Solution</div>
              <div className="f-title display">BNS Lunch Pre-Order</div>
              <p className="f-desc">
                A web app for Bank of Nova Scotia (Mandeville) staff to pre-order lunch. Custom
                UI over a Google Sheets backend, daily menus split by protein / sides /
                vegetables, and duplicate-submission control so each order lands exactly once.
              </p>
              <div className="f-out mono">
                OUTPUT: <b>Live internal tool used by branch staff</b>
              </div>
              <div className="tags">
                <span className="tag">React</span>
                <span className="tag">TypeScript</span>
                <span className="tag">Google Sheets API</span>
                <span className="tag">Vercel</span>
              </div>
              <div className="f-links">
                <a href="https://bns-preorder.vercel.app" target="_blank" rel="noopener">
                  <ExternalIcon />
                  Live demo
                </a>
              </div>
            </div>
          </div>

          {/* FEATURE 3: PreQ */}
          <div className="feature reveal">
            <div className="f-media">
              <img src={preqApp} alt="SoftQ / TAJ Pre-Queue app" />
            </div>
            <div className="f-body">
              <div className="f-ref">
                <span>REF_003</span>
                <span className="dash"></span>
                <span>FEATURED</span>
              </div>
              <div className="f-sub">Pre-Queue Management System</div>
              <div className="f-title display">SoftQ / TAJ Pre-Queue</div>
              <p className="f-desc">
                A real-time appointment-scheduling system built for Tax Administration Jamaica.
                Node.js API endpoints with concurrent-booking handling to prevent double-booking,
                letting citizens schedule slots and cutting in-person wait times. Admin dashboard
                tracks live customer flow and queue management.
              </p>
              <div className="f-out mono">
                OUTPUT: <b>Civic scheduling tool with concurrency-safe booking</b>
              </div>
              <div className="tags">
                <span className="tag">React</span>
                <span className="tag">Node.js</span>
                <span className="tag">Firebase</span>
                <span className="tag">Real-time</span>
                <span className="tag">DB Design</span>
              </div>
              <div className="f-links">
                <a href="https://github.com/Aaron-C-P/PreQ-code" target="_blank" rel="noopener">
                  <GitHubIcon />
                  Source
                </a>
              </div>
            </div>
          </div>

          {/* FEATURE 4: JAMOMENT (venture / concept) */}
          <div className="feature rev reveal">
            <div className="f-media concept">
              <div>
                <div className="big display">Jamoment</div>
                <div className="ctag">Venture · Concept</div>
                <div className="cline">Make it a Jamoment ★</div>
              </div>
            </div>
            <div className="f-body">
              <div className="f-ref">
                <span>REF_004</span>
                <span className="dash"></span>
                <span>CONCEPT</span>
              </div>
              <div className="f-sub">Authentic Experiences Marketplace</div>
              <div className="f-title display">Jamoment</div>
              <p className="f-desc">
                My own venture — a marketplace for authentic Jamaican experiences hosted by
                verified locals, curated by an AI "Dream Engine." Tourists come once, snap a
                photo, and leave while most of the money leaks overseas. Jamoment is built so the
                value stays home: real places, real people, real moments.
              </p>
              <div className="f-out mono">
                OUTPUT: <b>Community-owned travel platform — 80% stays right here</b>
              </div>
              <div className="tags">
                <span className="tag">Product</span>
                <span className="tag">React</span>
                <span className="tag">AI Curation</span>
                <span className="tag">Marketplace</span>
                <span className="tag">Jamaica</span>
              </div>
            </div>
          </div>

          {/* secondary grid */}
          <div className="grid3">
            {secondaryProjects.map((p) => {
              const inner = (
                <>
                  <div className="card-top">
                    <span className="card-ref">{p.ref}</span>
                    <span className="card-ic">
                      {p.icon === "github" && p.href && (
                        <a href={p.href} target="_blank" rel="noopener" aria-label="Source">
                          <GitHubIcon />
                        </a>
                      )}
                      {p.icon === "external" && p.href && (
                        <a href={p.href} target="_blank" rel="noopener" aria-label="Live">
                          <ExternalIcon />
                        </a>
                      )}
                      {p.icon === "card-link" && <ArrowUpRight />}
                    </span>
                  </div>
                  <h4 className="display">{p.title}</h4>
                  <div className="csub">{p.sub}</div>
                  <p>{p.desc}</p>
                  <div className="ctags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </>
              );
              return p.icon === "card-link" && p.href ? (
                <a
                  key={p.ref}
                  className="panel hov card reveal"
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  style={{ textDecoration: "none" }}
                >
                  {inner}
                </a>
              ) : (
                <div key={p.ref} className="panel hov card reveal">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="rule"></div>
      </div>

      {/* ============ CAREER ============ */}
      <section className="block" id="career">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>03 — CAREER LOG
            </span>
            <h2 className="display">Experience &amp; education</h2>
            <p className="lead">
              Where the engineering has been put to work, and where the fundamentals were built
              — databases, secure coding, and full-stack systems.
            </p>
          </div>
          <div className="log-grid">
            <div className="log-col reveal">
              <h3 className="mono">
                <span className="tick">▹</span>EXPERIENCE
              </h3>
              <div className="panel entry">
                <div className="when mono">MAR 2026 — MAY 2026 · REMOTE</div>
                <div className="role display">Web Development Intern</div>
                <div className="org mono">Larvation Web LLC</div>
                <ul>
                  <li>
                    Built and deployed full-stack features, developing RESTful APIs in Node.js
                    and TypeScript on the Nuxt stack.
                  </li>
                  <li>
                    Implemented responsive, component-based UI wired to backend services across
                    the full stack.
                  </li>
                  <li>
                    Collaborated in agile code reviews with senior engineers to uphold coding
                    standards, maintainability, and quality.
                  </li>
                  <li>
                    Used Git/GitHub for version control and Postman to validate API behaviour
                    and data contracts.
                  </li>
                </ul>
              </div>
            </div>
            <div className="log-col reveal">
              <h3 className="mono">
                <span className="tick">▹</span>EDUCATION
              </h3>
              <div className="panel entry">
                <div className="when mono">2022 — 2026 · GRADUATE</div>
                <div className="role display">BSc Computer Science</div>
                <div className="org mono">Northern Caribbean University · Jamaica</div>
                <ul>
                  <li>
                    Graduated with a focus on software engineering, secure systems, networking,
                    and database design.
                  </li>
                  <li>Top Student — Software Engineering; consistent Honor Roll standing.</li>
                </ul>
                <div className="edu-meta">
                  <span>GPA 3.5</span>
                  <span>Honor Roll</span>
                  <span>Top Student · SE</span>
                </div>
              </div>
              <div className="panel entry">
                <div className="when mono">CERTIFICATIONS</div>
                <div className="role display" style={{ fontSize: "18px" }}>
                  Security &amp; networking
                </div>
                <div className="org mono" style={{ marginBottom: 0 }}>
                  Verified credentials
                </div>
                <div className="edu-meta" style={{ marginTop: "14px" }}>
                  <span>Security Pro · TestOut '24</span>
                  <span>Intro to Cyber Security · Cisco '25</span>
                  <span>Networking Basics · Cisco '25</span>
                  <span>Front End Dev · Simplilearn '24</span>
                  <span>CCNA · In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="rule"></div>
      </div>

      {/* ============ STACK ============ */}
      <section className="block" id="stack">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>04 — TECHNICAL STACK
            </span>
            <h2 className="display">What I build with</h2>
            <p className="lead">
              The tools I reach for across the stack — front end, back end, data, cloud, security,
              and AI.
            </p>
          </div>
          <div className="stack-grid">
            {stackCats.map((c) => (
              <div className="panel stack-cat reveal" key={c.no}>
                <div className="cat-h">
                  <span className="name display">{c.name}</span>
                  <span className="no mono">{c.no}</span>
                </div>
                <div className="chips">
                  {c.chips.map((ch) => (
                    <span className="chip" key={ch}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="rule"></div>
      </div>

      {/* ============ WRITING ============ */}
      <section className="block" id="writing">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>05 — WRITING &amp; PUBLICATIONS
            </span>
            <h2 className="display">I write, too</h2>
            <p className="lead">
              Published in national press and academic work — and a self-published book.
              Engineering is clearer when you can explain it.
            </p>
          </div>
          <div className="writing-list reveal">
            {writingItems.map((w) =>
              w.href ? (
                <a className="wrow" href={w.href} target="_blank" rel="noopener" key={w.no}>
                  <span className="wno mono">{w.no}</span>
                  <span className="wmid">
                    <span className="wtitle display">{w.title}</span>
                    <span className="wmeta mono">{w.meta}</span>
                  </span>
                  <span className="warr">
                    <ArrowUpRight />
                  </span>
                </a>
              ) : (
                <div className="wrow nolink" key={w.no}>
                  <span className="wno mono">{w.no}</span>
                  <span className="wmid">
                    <span className="wtitle display">{w.title}</span>
                    <span className="wmeta mono">{w.meta}</span>
                  </span>
                  <span className="warr">
                    <ArrowUpRight />
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="rule"></div>
      </div>

      {/* ============ RECOGNITION ============ */}
      <section className="block-tight" id="recognition">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>06 — RECOGNITION
            </span>
            <h2 className="display">Backed by results</h2>
          </div>
          <div className="rec-grid">
            {recognition.map((r) => (
              <div className="panel rec reveal" key={r.no}>
                <span className="rno mono">{r.no}</span>
                <span className="rtxt display">{r.txt}</span>
                <span className="rsub mono">{r.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="rule"></div>
      </div>

      {/* ============ CONTACT ============ */}
      <section className="block" id="contact">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="tick">//</span>07 — ESTABLISH CONTACT
            </span>
            <h2 className="display">Let's build something</h2>
            <p className="lead">
              Open to full-stack and web-developer roles — remote-friendly, and especially at
              home in security-conscious teams. Drop a line and I'll get back to you.
            </p>
          </div>
          <div className="contact-grid">
            <div className="channels reveal">
              <a className="panel channel" href="mailto:aaron7prince@gmail.com">
                <span className="cic">
                  <MailIcon />
                </span>
                <span>
                  <span className="ck">Email_Channel</span>
                  <span className="cv">aaron7prince@gmail.com</span>
                </span>
              </a>
              <a className="panel channel" href="tel:+18767902268">
                <span className="cic">
                  <PhoneIcon />
                </span>
                <span>
                  <span className="ck">Voice_Channel</span>
                  <span className="cv">+1 (876) 790-2268</span>
                </span>
              </a>
              <a
                className="panel channel"
                href="https://linkedin.com/in/aaron-prince-b912b121"
                target="_blank"
                rel="noopener"
              >
                <span className="cic">
                  <LinkedInIcon />
                </span>
                <span>
                  <span className="ck">Network_LinkedIn</span>
                  <span className="cv">Aaron Prince</span>
                </span>
              </a>
              <a className="panel channel" href="https://github.com/Aaron-C-P" target="_blank" rel="noopener">
                <span className="cic">
                  <GitHubIcon />
                </span>
                <span>
                  <span className="ck">Repository_GitHub</span>
                  <span className="cv">Aaron-C-P</span>
                </span>
              </a>
            </div>

            {formState.succeeded ? (
              <div className="panel cform reveal">
                <div className="ftitle mono">
                  <span className="tick">▹</span>MESSAGE_TRANSMITTED
                </div>
                <p style={{ color: "var(--fg-dim)", marginTop: "10px", lineHeight: 1.7 }}>
                  Thanks — your message came through. I'll get back to you at the email you
                  provided. In the meantime, feel free to connect on LinkedIn or browse the work
                  above.
                </p>
              </div>
            ) : (
              <form className="panel cform reveal" onSubmit={handleSubmit}>
                <div className="ftitle mono">
                  <span className="tick">▹</span>TRANSMIT_MESSAGE
                </div>
                <div className="field">
                  <label htmlFor="name">_Name</label>
                  <input id="name" type="text" name="name" placeholder="Your name" required />
                  <ValidationError prefix="Name" field="name" errors={formState.errors} />
                </div>
                <div className="field">
                  <label htmlFor="email">_Email</label>
                  <input id="email" type="email" name="email" placeholder="you@example.com" required />
                  <ValidationError prefix="Email" field="email" errors={formState.errors} />
                </div>
                <div className="field">
                  <label htmlFor="message">_Message</label>
                  <textarea id="message" name="message" placeholder="What are you building?" required />
                  <ValidationError prefix="Message" field="message" errors={formState.errors} />
                </div>
                <button type="submit" className="btn btn-amber" disabled={formState.submitting}>
                  {formState.submitting ? "SENDING…" : "SEND MESSAGE →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="fc mono">
            © {year} <b>AARON_PRINCE</b> // BUILD_LOG
          </div>
          <div className="fnav">
            <a href="#ai">AI</a>
            <a href="#work">WORK</a>
            <a href="#career">CAREER</a>
            <a href="#writing">WRITING</a>
            <a href="#contact">CONTACT</a>
          </div>
          <div className="fc mono">DESIGNED &amp; BUILT IN JAMAICA</div>
        </div>
      </footer>
    </>
  );
}
