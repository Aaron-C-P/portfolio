import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Github, Linkedin, Mail } from "lucide-react";
import { brand } from "@/data/studio";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/work", label: "Work" },
  { to: "/journey", label: "Journey" },
  { to: "/services", label: "Services" },
  { to: "/writing", label: "Writing" },
  { to: "/feed", label: "Feed" },
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

const Footer = () => (
  <footer className="border-t border-line bg-panel">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
      <div>
        <Wordmark />
        <p className="mt-4 font-hand text-2xl text-cream">{brand.tagline}</p>
        <p className="mt-2 text-sm text-soft">{brand.location}</p>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Explore</p>
        <ul className="space-y-2 text-sm text-soft">
          {[...nav.filter((n) => n.to !== "/"), { to: "/ask", label: "Ask my AI" }, { to: "/contact", label: "Contact" }].map((n) => (
            <li key={n.to}>
              <Link to={n.to} className="hover:text-cream">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Connect</p>
        <div className="flex gap-3">
          {[
            { href: brand.github, label: "GitHub", Icon: Github, ext: true },
            { href: brand.linkedin, label: "LinkedIn", Icon: Linkedin, ext: true },
            { href: `mailto:${brand.email}`, label: "Email", Icon: Mail, ext: false },
          ].map(({ href, label, Icon, ext }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="rounded-full border border-line p-3 text-soft transition hover:border-violet-light hover:text-cream"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-soft">{brand.email}</p>
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
