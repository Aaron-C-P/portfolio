import { motion } from "framer-motion";
import { Code, Database, Globe, GraduationCap, Briefcase, Award, BookOpen } from "lucide-react";

export const PortfolioAbout = () => {
  const skills = [
    {
      category: "Frontend",
      items: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML/CSS"],
    },
    {
      category: "Backend",
      items: ["Node.js", "Python", "SQL", "Supabase", "REST APIs"],
    },
    {
      category: "Tools & Others",
      items: ["Git", "VS Code", "Figma", "Agile", "Linux"],
    },
  ];

  const certifications = [
    "Microsoft Certified: Azure Database Administrator (in progress)",
    "Front End Development - Simplilearn (2024)",
    "Intro to Cyber Security - Cisco (2025)",
    "Security Pro - Testout (2024)",
    "Google Cybersecurity Professional Certificate (in progress)",
    "Networking Basics - Cisco (2025)",
  ];

  const publications = [
    "Madden, O.N., Prince, A., Stennett, K., & Higgs, R. (2025). GenAI, future role and professionalization of foreign language teachers (in progress)",
  ];

  const achievements = [
    "NCB Grant Awardee - 3 Consecutive Quarters",
    "GPA: 3.5 - Honor Roll",
    "Top Student in Software Engineering Course",
    "Sagicor Scholarship Interview Candidate",
    "Leadership Recognition",
  ];

  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-portfolio-accent font-semibold mb-4 block uppercase tracking-wider text-sm">
            About Me
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">My Journey</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-portfolio-accent to-portfolio-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="text-portfolio-accent h-6 w-6" />
              Who I Am
            </h3>
            <div className="space-y-4 text-portfolio-muted text-lg leading-relaxed">
              <p>
                I have finished my courses at Northern Caribbean University and will graduate in August 2026. My passion lies in building innovative
                software solutions, exploring the intersection of AI, full-stack development, and cybersecurity.
              </p>
              <p>
                I specialize in creating user-centric applications that solve real-world problems, from moving logistics
                platforms to secure password managers. I thrive in collaborative environments and am always eager to learn
                new technologies.
              </p>
              <p>
                When I'm not coding, I enjoy exploring new tech trends, contributing to open-source projects, and
                optimizing workflows.
              </p>
            </div>

            <div className="mt-8 p-6 bg-portfolio-card rounded-xl border border-portfolio-border">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="text-portfolio-accent h-6 w-6" />
                Education
              </h4>
              <div>
                <p className="font-semibold text-portfolio-text">Northern Caribbean University</p>
                <p className="text-portfolio-accent">Bachelor of Science in Computer Science</p>
                <p className="text-portfolio-muted text-sm mt-1">Expected Graduation: August 2026</p>
                <p className="text-portfolio-muted text-sm">Coursework Completed</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-portfolio-card rounded-xl border border-portfolio-border">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-portfolio-accent h-6 w-6" />
                Certifications
              </h4>
              <ul className="space-y-3">
                {certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-portfolio-text">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-portfolio-accent shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="text-portfolio-accent h-6 w-6" />
              Technical Skills
            </h3>
            <div className="space-y-6">
              {skills.map((skillGroup, index) => (
                <div key={index}>
                  <h4 className="text-sm uppercase tracking-wider text-portfolio-muted font-semibold mb-3">
                    {skillGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-portfolio-card border border-portfolio-border rounded-lg text-sm hover:border-portfolio-accent/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-portfolio-card rounded-xl border border-portfolio-border">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-portfolio-accent h-6 w-6" />
                Publications
              </h4>
              <ul className="space-y-3">
                {publications.map((pub, index) => (
                  <li key={index} className="flex items-start gap-2 text-portfolio-text">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-portfolio-accent shrink-0" />
                    <span>{pub}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 p-6 bg-portfolio-card rounded-xl border border-portfolio-border">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="text-portfolio-accent h-6 w-6" />
                Achievements & Recognition
              </h4>
              <ul className="space-y-3">
                {achievements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-portfolio-text">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-portfolio-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-br from-portfolio-accent/10 to-transparent rounded-xl border border-portfolio-accent/20">
              <h4 className="text-lg font-bold mb-2 text-white">Let's Collaborate</h4>
              <p className="text-portfolio-muted mb-4">
                I'm open to new opportunities and interesting projects.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
