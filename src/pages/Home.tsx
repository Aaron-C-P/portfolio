import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Github, Linkedin, Mail, Phone, Code, Database, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { profile, projects } from "@/data/site";
import profilePhoto from "@/assets/portfolio/profile-photo.jpg";

const socials = [
  { href: profile.github, label: "GitHub", Icon: Github, external: true },
  { href: profile.linkedin, label: "LinkedIn", Icon: Linkedin, external: true },
  { href: `mailto:${profile.email}`, label: "Email", Icon: Mail, external: false },
  { href: profile.phoneHref, label: "Phone", Icon: Phone, external: false },
];

const strengths = [
  { Icon: Code, label: "Full-Stack" },
  { Icon: Database, label: "Databases" },
  { Icon: Shield, label: "Cybersecurity" },
  { Icon: Globe, label: "Web Apps" },
];

const Home = () => {
  useEffect(() => {
    document.title = "Aaron Prince | Software Engineer & Web Developer in Jamaica";
  }, []);

  const latest = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-portfolio-accent/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-portfolio-secondary/5 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-portfolio-accent/10 text-portfolio-accent rounded-full"
              >
                BSc Computer Science Graduate, Northern Caribbean University
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              >
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-portfolio-accent to-portfolio-secondary bg-clip-text text-transparent">
                  Aaron Prince
                </span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-lg md:text-xl font-semibold text-slate-700 mb-6"
              >
                {profile.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 mb-8 max-w-lg"
              >
                I build web apps for real people and local businesses in Jamaica, from ordering sites and delivery services to
                AI-powered platforms and secure systems.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Button asChild className="bg-portfolio-accent hover:bg-portfolio-accent/90 text-white px-6 py-5 text-base rounded-xl shadow-lg">
                  <Link to="/projects">
                    View Projects <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-6 py-5 text-base rounded-xl">
                  <Link to="/contact">Get In Touch</Link>
                </Button>
              </motion.div>
              <div className="flex items-center gap-4">
                {socials.map(({ href, label, Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="p-3 rounded-full border border-portfolio-border hover:border-portfolio-accent hover:text-portfolio-accent transition-all hover:-translate-y-0.5"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-portfolio-accent to-portfolio-secondary rounded-full blur-2xl opacity-20" />
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-portfolio-border shadow-2xl">
                  <img src={profilePhoto} alt="Aaron Prince" className="w-full h-full object-cover object-top" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-portfolio-border">
            {strengths.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-portfolio-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-portfolio-accent font-semibold uppercase tracking-wider text-sm block mb-2">Latest work</span>
              <h2 className="text-3xl font-bold">Recent Projects</h2>
            </div>
            <Link to="/projects" className="hidden sm:inline-flex items-center gap-1 text-portfolio-accent font-medium hover:underline">
              All projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need something built?</h2>
          <p className="text-slate-600 text-lg mb-8">
            Ordering systems, booking tools and custom web apps for small businesses and teams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-portfolio-accent hover:bg-portfolio-accent/90 text-white rounded-xl px-6 py-5">
              <Link to="/services">See Services</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl px-6 py-5">
              <Link to="/journey">My Journey</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl px-6 py-5">
              <Link to="/ask">Ask my AI</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
