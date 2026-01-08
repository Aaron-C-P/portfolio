import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import egzitMockup from "@/assets/portfolio/egzit-mockup.png";
import bnsPreorder from "@/assets/portfolio/bns-preorder.png";
import preqLogo from "@/assets/portfolio/preq-logo.jpeg";

const projects = [
  {
    id: 1,
    title: "EGZIT",
    subtitle: "AI-Powered Smart Moving Assistant",
    description:
      "A comprehensive moving logistics platform with AI-powered inventory management, QR code tracking, real-time route optimization, and a mover marketplace. Features include smart packing recommendations, live GPS tracking, and integrated payment processing with Stripe.",
    technologies: ["React", "TypeScript", "Supabase", "OpenAI GPT-4", "Stripe", "Leaflet"],
    image: egzitMockup,
    liveUrl: "https://egzit-1-0-final.vercel.app/",
    githubUrl: "https://github.com/Aaron-C-P/Egzit-1.0-Final",
    featured: true,
  },
  {
    id: 2,
    title: "BNS Lunch Pre-Order",
    subtitle: "Staff Ordering Solution",
    description:
      "Web application for Bank of Nova Scotia Mandeville staff to pre-order lunch. Features custom UI, Google Sheets backend integration, daily menus with protein/sides/vegetables categories, and duplicate-submission control.",
    technologies: ["TypeScript", "React", "Google Sheets API", "Vercel"],
    image: bnsPreorder,
    liveUrl: "https://bns-preorder.vercel.app",
    githubUrl: null,
    featured: true,
  },
  {
    id: 3,
    title: "SoftQ Solutions (PreQ)",
    subtitle: "Pre-Queue Management System",
    description:
      "Appointment management tool developed for Tax Administration Jamaica (TAJ). Enables customers to schedule appointments and reduces wait times with intelligent queue management.",
    technologies: ["TypeScript", "React", "Database Design"],
    image: preqLogo,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/PreQ-code",
    featured: true,
  },
  {
    id: 4,
    title: "Hurricane Watch Jamaica",
    subtitle: "Real-Time Weather Monitoring",
    description:
      "Real-time hurricane and weather monitoring application for Jamaica, providing live camera feeds and weather updates during storm events.",
    technologies: ["JavaScript", "APIs", "Real-time Data"],
    image: null,
    liveUrl: "https://safe-eye.netlify.app/#storm-tracker",
    githubUrl: null,
    featured: false,
  },
  {
    id: 5,
    title: "Vault Guardian",
    subtitle: "Secure Password Manager",
    description:
      "A secure, encrypted tool for password storage and generation. Implements industry-standard encryption practices to keep user credentials safe.",
    technologies: ["TypeScript", "Cryptography", "Security"],
    image: null,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/vault-keeper-simple-key",
    featured: false,
  },
  {
    id: 6,
    title: "Orbita Commerce",
    subtitle: "Caribbean E-Commerce Platform",
    description:
      "E-commerce platform designed for Caribbean businesses with product management, transaction handling, and user authentication.",
    technologies: ["PHP", "MySQL", "E-Commerce"],
    image: null,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/Orbita",
    featured: false,
  },
  {
    id: 7,
    title: "R Code Data Lab",
    subtitle: "QR Code Data Platform",
    description:
      "A platform to explore QR code data storage, chunking for larger files, and WhatsApp-style session authentication. Designed with a technical, cybersecurity-focused aesthetic inspired by tools like Vercel and Linear. Features include QR code generator, data size analyzer, chunking demos, and session authentication.",
    technologies: ["React", "QR Code", "Authentication", "Cybersecurity UI"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
  {
    id: 8,
    title: "Smart Baby Bed Set",
    subtitle: "IoT Safety & Accessibility Solution",
    description:
      "A human-centered smart baby bed designed to minimize SIDS risks and support caregivers with disabilities. Features automated temperature regulation, gentle rocking, and multimodal alerts (tactile, visual, audio). This comprehensive project demonstrates expertise in Software Engineering, Web Development, Network Design, Database Systems, Testing & QA, Project Management, and HCI principles.",
    technologies: [
      "IoT",
      "C++",
      "HCI",
      "Software Engineering",
      "Web Dev",
      "Network Design",
      "Databases",
      "QA Testing",
      "Project Management",
    ],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
];

export const PortfolioProjects = () => {
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="relative z-10 py-24 px-6 bg-portfolio-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-portfolio-accent font-semibold mb-4 block uppercase tracking-wider text-sm">Portfolio</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-portfolio-muted text-lg max-w-2xl mx-auto">
            A collection of applications I've designed and developed, showcasing full-stack capabilities and real-world solutions.
          </p>
        </motion.div>

        {/* Featured Projects */}
        <div className="space-y-16 mb-20">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Project Image/Preview */}
              <div className={`relative ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative bg-white border border-portfolio-border rounded-2xl overflow-hidden shadow-xl">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full aspect-video object-cover object-top"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-portfolio-accent to-portfolio-secondary flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{project.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <span className="text-portfolio-accent text-sm font-semibold mb-2 block uppercase tracking-wider">
                  {project.subtitle}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{project.title}</h3>
                <p className="text-portfolio-muted mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-sm bg-portfolio-accent/10 text-portfolio-accent rounded-full font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-portfolio-text hover:text-portfolio-accent transition-colors font-medium"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-portfolio-text hover:text-portfolio-accent transition-colors font-medium"
                    >
                      <Github className="h-5 w-5" />
                      <span>Source Code</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Projects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Other Notable Projects</h3>
          <p className="text-portfolio-muted">Additional work and explorations</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-white border border-portfolio-border rounded-xl p-6 hover:border-portfolio-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-portfolio-accent to-portfolio-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{project.title.charAt(0)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-portfolio-muted hover:text-portfolio-accent transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-portfolio-muted hover:text-portfolio-accent transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <h4 className="text-xl font-semibold mb-1 group-hover:text-portfolio-accent transition-colors">
                {project.title}
              </h4>
              <p className="text-sm text-portfolio-accent font-medium mb-3">{project.subtitle}</p>
              <p className="text-portfolio-muted text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-xs text-portfolio-muted bg-portfolio-card px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/Aaron-C-P"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-portfolio-accent hover:underline font-medium"
          >
            <span>View all projects on GitHub</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
