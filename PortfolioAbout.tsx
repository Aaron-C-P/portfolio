import { motion } from "framer-motion";
import { GraduationCap, Award, Code, BookOpen, Trophy } from "lucide-react";

const skills = {
  languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "PHP", "SQL"],
  frontend: ["React", "HTML/CSS", "Tailwind CSS", "Responsive Design"],
  backend: ["Node.js", "PostgreSQL", "MySQL", "MongoDB", "Supabase"],
  tools: ["Git", "VS Code", "Figma", "UML", "Data Structures"],
  certifications: [
    "Microsoft Azure Database Administrator (in progress)",
    "Front End Development - Simplilearn (2024)",
    "Intro to Cybersecurity - Cisco (2025)",
    "Security Pro - TestOut (2024)",
    "Google Cybersecurity Professional (in progress)",
    "Networking Basics - Cisco (2025)",
  ],
};

const achievements = [
  { icon: Award, text: "NCB Scholarship Award - 3 Consecutive Quarters" },
  { icon: GraduationCap, text: "GPA: 3.5 - Honor Roll" },
  { icon: Trophy, text: "Top Student in Software Engineering Course" },
  { icon: Award, text: "Sagicor Scholarship Interview Candidate" },
  { icon: Trophy, text: "Leadership Recognition" },
];

export const PortfolioAbout = () => {
  return (
    <section id="about" className="relative z-10 py-24 px-6 bg-portfolio-bg">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-portfolio-accent font-semibold mb-4 block uppercase tracking-wider text-sm">About Me</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Background & Skills</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Bio & Education */}
          <div>
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="text-portfolio-muted text-lg leading-relaxed mb-6">
                I'm an adaptable and ambitious Computer Science student at{" "}
                <span className="text-portfolio-accent font-medium">Northern Caribbean University</span> with a solid
                foundation in IT fundamentals. Skilled in problem solving, teamwork, and communication,
                with hands-on experience in software development and software support.
              </p>
              <p className="text-portfolio-muted text-lg leading-relaxed">
                I'm passionate about creating innovative solutions that make a real difference in people's lives,
                from AI-powered applications to secure systems.
              </p>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-portfolio-accent/10 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-portfolio-accent" />
                </div>
                <h3 className="text-xl font-bold">Education</h3>
              </div>
              <div className="border-l-2 border-portfolio-accent/30 pl-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold">Bachelor of Science in Computer Science</h4>
                  <p className="text-portfolio-accent font-medium">Northern Caribbean University, Jamaica</p>
                  <p className="text-portfolio-muted text-sm">January 2022 - August 2026 (Expected)</p>
                  <p className="text-portfolio-muted text-sm mt-1">GPA: 3.5 - Honor Roll</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">DeCarteret College</h4>
                  <p className="text-portfolio-muted text-sm">5 CAPE Subjects (Unit 1 & Unit 2)</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-portfolio-accent/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-portfolio-accent" />
                </div>
                <h3 className="text-xl font-bold">Achievements & Recognition</h3>
              </div>
              <div className="grid gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white border border-portfolio-border rounded-xl hover:border-portfolio-accent/30 transition-colors"
                  >
                    <achievement.icon className="h-5 w-5 text-portfolio-accent flex-shrink-0" />
                    <span className="text-sm">{achievement.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Skills & Certifications */}
          <div>
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-portfolio-accent/10 rounded-lg">
                  <Code className="h-6 w-6 text-portfolio-accent" />
                </div>
                <h3 className="text-xl font-bold">Technical Skills</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-portfolio-muted mb-3 font-medium">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.languages.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white border border-portfolio-border rounded-lg text-sm hover:border-portfolio-accent/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-portfolio-muted mb-3 font-medium">Frontend</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.frontend.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white border border-portfolio-border rounded-lg text-sm hover:border-portfolio-accent/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-portfolio-muted mb-3 font-medium">Backend & Databases</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.backend.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white border border-portfolio-border rounded-lg text-sm hover:border-portfolio-accent/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-portfolio-muted mb-3 font-medium">Tools & Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.tools.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white border border-portfolio-border rounded-lg text-sm hover:border-portfolio-accent/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Certifications */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-portfolio-accent/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-portfolio-accent" />
                </div>
                <h3 className="text-xl font-bold">Certifications</h3>
              </div>
              <ul className="space-y-3">
                {skills.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-3 text-portfolio-muted">
                    <span className="text-portfolio-accent mt-1">▹</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Publication */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10"
            >
              <div className="p-6 bg-gradient-to-br from-portfolio-accent/5 to-portfolio-secondary/5 border border-portfolio-border rounded-xl">
                <h4 className="font-semibold mb-2">Publication (In Progress)</h4>
                <p className="text-sm text-portfolio-muted">
                  Madden, O.N., <span className="text-portfolio-accent">Prince, A.</span>, Stennett, K., & Higgs, R. (2025). 
                  GenAI, future role and professionalization of foreign language teachers.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
