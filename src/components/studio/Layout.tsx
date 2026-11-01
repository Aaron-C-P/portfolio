import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Github, Linkedin, Mail } from "lucide-react";
import graduationPhoto from "@/assets/portfolio/feed-graduation.webp";
import { brand } from "@/data/studio";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/work", label: "Work" },
  { to: "/journey", label: "Journey" },
  { to: "/skills", label: "Skills" },
  { to: "/services", label: "Services" },
  { to: "/writing", label: "Writing" },
  { to: "/about", label: "About" },
];

export const Wordmark = () => (
  <span className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-violet-light font-hand text-2xl font-bold leading-none text-white">
      AP
    </span>
    <span className="leading-tight">
      <span className="block font-hand text-2xl font-bold">Aaron Prince</span>
      <span className="hidden text-[11px] uppercase tracking-widest text-soft sm:block">{brand.studio}</span>
    </span>
  </span>
);

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${isActive ? "text-cream" : "text-soft hover:text-fg"}`;

const Header = () => {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition ${solid || open ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "bg-transparent"}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" aria-label="Aaron Prince home">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${brand.email}`}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-soft transition hover:text-fg xl:inline-flex"
          >
            <Mail className="h-4 w-4 text-violet-light" aria-hidden="true" /> {brand.email}
          </a>
          <a href={`mailto:${brand.email}`} aria-label={`Email ${brand.email}`} className="inline-flex rounded-lg p-2 text-violet-light xl:hidden">
            <Mail className="h-6 w-6" />
          </a>
          <Link to="/contact" className="btn-primary hidden lg:inline-flex">
            Start a conversation
          </Link>
          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-line px-5 py-4 lg:hidden">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/ask" className={linkClass}>
            Ask my AI
          </NavLink>
          <Link to="/contact" className="btn-primary mt-2">
            Start a conversation
          </Link>
        </nav>
      )}
    </header>
  );
};

const footerCols: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Work",
    links: [
      { to: "/work/chef-hudsons-christmas-cakes", label: "Chef Hudson's Cakes" },
      { to: "/work/errands", label: "Errands" },
      { to: "/work/egzit", label: "EGZIT" },
      { to: "/work/becoming", label: "Becoming" },
      { to: "/work", label: "All projects" },
    ],
  },
  {
    title: "Explore",
    links: [
      { to: "/journey", label: "Journey" },
      { to: "/services", label: "Services" },
      { to: "/writing", label: "Writing" },
      { to: "/feed", label: "Feed" },
      { to: "/skills", label: "Skills" },
    ],
  },
  {
    title: "Aaron",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/resume", label: "Request résumé" },
      { to: "/ask", label: "Ask my AI" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-line bg-panel">
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[minmax(0,1fr)_2fr]">
      <div>
        <div className="relative h-48 w-36 overflow-hidden rounded-2xl border border-line bg-raise">
          <img
            src={graduationPhoto}
            alt="Aaron Prince in graduation cap and gown"
            className="absolute max-w-none"
            style={{ width: 330, left: -160, top: -255 }}
          />
        </div>
        <p className="mt-5 text-2xl font-bold">{brand.name}</p>
        <p className="text-sm text-soft">{brand.studio}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { href: brand.linkedin, label: "LinkedIn", Icon: Linkedin, ext: true },
            { href: brand.github, label: "GitHub", Icon: Github, ext: true },
            { href: `mailto:${brand.email}`, label: "Email", Icon: Mail, ext: false },
          ].map(({ href, label, Icon, ext }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="rounded-2xl border border-line bg-raise p-4 text-soft transition hover:-translate-y-0.5 hover:border-violet-light hover:text-fg"
            >
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
        <p className="mt-5 text-sm text-soft">{brand.location}</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {footerCols.map((c) => (
          <div key={c.title}>
            <p className="font-hand text-3xl text-cream underline decoration-cream/60 decoration-2 underline-offset-4">{c.title}</p>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-lg text-soft transition hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="border-t border-line py-5 text-center text-xs text-soft">
      © {new Date().getFullYear()} Aaron Prince. A professional digital solutions brand, not an incorporated company.
    </div>
  </footer>
);

export const Layout = () => (
  <div className="min-h-screen overflow-x-hidden">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cream focus:px-4 focus:py-2 focus:text-ink">
      Skip to content
    </a>
    <Header />
    <main id="main">
      <Outlet />
    </main>
    <Footer />
  </div>
);
