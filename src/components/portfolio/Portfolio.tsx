import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, Code, Database, Shield, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioProjects } from "@/components/portfolio/PortfolioProjects";
import { PortfolioAbout } from "@/components/portfolio/PortfolioAbout";
import { PortfolioBlog } from "@/components/portfolio/PortfolioBlog";
import { PortfolioContact } from "@/components/portfolio/PortfolioContact";
import { PortfolioNavbar } from "@/components/portfolio/PortfolioNavbar";
import profilePhoto from "@/assets/portfolio/profile-photo.png";

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "projects", "about", "blog", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-portfolio-bg text-portfolio-text overflow-x-hidden">
      <PortfolioNavbar activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-portfolio-accent/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-portfolio-secondary/5 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 text-sm font-medium bg-portfolio-accent/10 text-portfolio-accent rounded-full">
                  Software Developer
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-portfolio-accent to-portfolio-secondary bg-clip-text text-transparent">
                  Aaron Prince
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-portfolio-muted mb-8 max-w-lg"
              >
                Computer Science student at Northern Caribbean University, building innovative solutions
                from AI-powered applications to full-stack systems.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 mb-8"
              >
                <Button
                  onClick={() => scrollToSection("projects")}
                  className="bg-portfolio-accent hover:bg-portfolio-accent/90 text-portfolio-accent-fg px-6 py-5 text-base rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  View Projects
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection("contact")}
                  className="border-portfolio-border hover:bg-portfolio-card px-6 py-5 text-base rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Get In Touch
                </Button>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <a
                  href="https://github.com/Aaron-C-P"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-portfolio-border hover:border-portfolio-accent hover:text-portfolio-accent transition-all hover:-translate-y-0.5"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/in/aaron-prince-b912b121"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-portfolio-border hover:border-portfolio-accent hover:text-portfolio-accent transition-all hover:-translate-y-0.5"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:aaron7prince@gmail.com"
                  className="p-3 rounded-full border border-portfolio-border hover:border-portfolio-accent hover:text-portfolio-accent transition-all hover:-translate-y-0.5"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </motion.div>
            </div>

            {/* Right - Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Background Gradient Ring */}
                <div className="absolute -inset-4 bg-gradient-to-br from-portfolio-accent to-portfolio-secondary rounded-full blur-2xl opacity-20" />
                <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-portfolio-border shadow-2xl">
                  <img
                    src={profilePhoto}
                    alt="Aaron Prince"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-16 border-t border-portfolio-border"
          >
            <div className="flex items-center gap-2 text-portfolio-muted">
              <Code className="h-5 w-5" />
              <span className="text-sm font-medium">Full-Stack</span>
            </div>
            <div className="flex items-center gap-2 text-portfolio-muted">
              <Database className="h-5 w-5" />
              <span className="text-sm font-medium">Databases</span>
            </div>
            <div className="flex items-center gap-2 text-portfolio-muted">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Cybersecurity</span>
            </div>
            <div className="flex items-center gap-2 text-portfolio-muted">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Web Apps</span>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={() => scrollToSection("projects")}
              className="flex flex-col items-center gap-2 text-portfolio-muted hover:text-portfolio-accent transition-colors"
            >
              <span className="text-sm">Scroll to explore</span>
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <PortfolioProjects />

      {/* About Section */}
      <PortfolioAbout />

      {/* Blog Section */}
      <PortfolioBlog />

      {/* Contact Section */}
      <PortfolioContact />

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-portfolio-border bg-portfolio-bg">
        <div className="max-w-6xl mx-auto px-6 text-center text-portfolio-muted">
          <p>© {new Date().getFullYear()} Aaron Prince. Built with passion and code.</p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
