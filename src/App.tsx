import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";
import { PortfolioNavbar } from "@/components/portfolio/PortfolioNavbar";
import { Toaster } from "@/components/ui/toaster";
import { profile } from "@/data/site";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Journey from "@/pages/Journey";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Ask from "@/pages/Ask";
import Writing from "@/pages/Writing";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-24">
    <h1 className="text-4xl font-bold mb-4">Page not found</h1>
    <Link to="/" className="text-portfolio-accent hover:underline">
      Go home
    </Link>
  </div>
);

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-portfolio-bg text-portfolio-text overflow-x-hidden">
      <PortfolioNavbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="py-8 border-t border-portfolio-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Aaron Prince. Mandeville, Jamaica.</p>
          <div className="flex gap-4">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-portfolio-accent">
              <Github className="h-5 w-5" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-portfolio-accent">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className="hover:text-portfolio-accent">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  </BrowserRouter>
);

export default App;
