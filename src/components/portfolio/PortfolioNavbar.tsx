import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/site";
import profilePhoto from "@/assets/portfolio/profile-photo.png";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/journey", label: "Journey" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? "text-portfolio-accent bg-portfolio-accent/10"
      : "text-slate-500 hover:text-portfolio-text hover:bg-portfolio-card"
  }`;

export const PortfolioNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? "bg-white/95 backdrop-blur-md border-b border-portfolio-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Aaron Prince, home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-portfolio-accent">
            <img src={profilePhoto} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <span className="hidden sm:block font-bold">Aaron Prince</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="hidden md:block">
          <Button
            variant="outline"
            className="border-portfolio-accent text-portfolio-accent hover:bg-portfolio-accent hover:text-white rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Resume
          </Button>
        </a>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="md:hidden p-2 rounded-lg hover:bg-portfolio-card transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-portfolio-border">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className={linkClass({ isActive: false })}>
              Resume
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
