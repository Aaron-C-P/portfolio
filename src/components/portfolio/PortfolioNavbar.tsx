import { useState, useEffect } from "react";
import { Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortfolioNavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  profilePhoto?: string;
}

const navItems = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

export const PortfolioNavbar = ({ activeSection, onNavigate, profilePhoto }: PortfolioNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-portfolio-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate("hero")}
          className="flex items-center gap-2"
        >
          {profilePhoto ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-portfolio-accent">
              <img src={profilePhoto} alt="AP" className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-2xl font-bold bg-gradient-to-r from-portfolio-accent to-portfolio-secondary bg-clip-text text-transparent">
              AP
            </span>
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "text-portfolio-accent bg-portfolio-accent/10"
                  : "text-portfolio-muted hover:text-portfolio-text hover:bg-portfolio-card"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Resume Button */}
        <div className="hidden md:block">
          <a
            href="https://drive.google.com/file/d/1EnEtEyJYoFUAIWK48TKc4A0S18dQROjx/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="border-portfolio-accent text-portfolio-accent hover:bg-portfolio-accent hover:text-white rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Resume
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-portfolio-card transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-portfolio-border">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg text-left font-medium transition-all ${
                  activeSection === item.id
                    ? "text-portfolio-accent bg-portfolio-accent/10"
                    : "text-portfolio-muted hover:text-portfolio-text hover:bg-portfolio-card"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button
              variant="outline"
              className="mt-2 border-portfolio-accent text-portfolio-accent hover:bg-portfolio-accent hover:text-white rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Resume
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
