import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { brand, courses, profilePhoto, recognition } from "@/data/studio";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";

const skills: [string, string[]][] = [
  ["Core toolkit", ["SQL: PostgreSQL, MySQL, SQL Server", "Python for data processing and automation", "Microsoft Power BI (in progress)", "Dashboard and KPI design", "Database and schema design", "Data validation and audit logging", "Microsoft Access", "Git, documentation and testing"]],
  ["Business strengths", ["Reporting automation", "Data quality and integrity", "Data governance by design", "Cross-department collaboration", "Process improvement and initiative", "Clear communication to non-technical staff", "Confidential data handling"]],
  ["Languages", ["TypeScript", "JavaScript", "Python", "Java", "C++", "PHP", "SQL"]],
  ["Front end", ["React", "Tailwind CSS", "HTML and CSS", "Responsive design"]],
  ["Back end and data", ["Node.js", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Google Apps Script"]],
  ["Tools", ["Git and GitHub", "Postman", "Figma", "UML", "Vercel"]],
];

const competencies = [
  "Data Analytics", "Reporting and Management Information", "Microsoft Access", "Business Intelligence", "KPI Dashboards", "Data Visualization",
  "Reporting Automation", "SQL", "PostgreSQL", "MySQL", "SQL Server", "Python", "Data Processing", "Database Design", "Data Modelling",
  "Data Governance", "Data Quality and Validation", "Audit Trails and Traceability", "Duplicate Detection", "Data Security and Access Control",
  "Process Improvement", "Cross-Functional Collaboration", "Requirements Gathering", "Technical Documentation", "Banking Operations",
  "Regulatory Confidentiality Standards",
];

const certs = [
  "Microsoft Power BI Data Analyst (in progress)",
  "Introduction to Data Science, Simplilearn (2024)",
  "CompTIA Security+ 701, Infosec (2025)",
  "CompTIA A+ Core 1: exam prep complete (2026)",
  "Cisco Networking Academy: CCNA Introduction to Networks (2026)",
  "Cisco CCNA certification (in progress)",
  "Node.js Master Class (2026)",
  "Google Cybersecurity Professional (in progress)",
  "Microsoft Azure Database Administrator (in progress)",
  "Cisco Introduction to Cybersecurity (2025)",
  "Cisco Networking Basics (2025)",
  "TestOut Security Pro (2024)",
  "Simplilearn Front End Development (2024)",
];

const About = () => {
  usePageTitle("About");
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_320px]">
        <Reveal>
          <Note className="text-3xl">About</Note>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-6xl">I like making things work, and explaining why.</h1>
          <div className="mt-6 space-y-4 text-lg text-fg/90">
            <p>
              I am a Computer Science graduate of Northern Caribbean University (Class of 2026) based in Mandeville, Jamaica. I build ordering systems, business
              applications and data tools, and I care as much about understanding the problem as writing the code.
            </p>
            <p>
              I went from lab exercises to systems that real people use: a baker taking Christmas orders, a delivery service, a moving platform. Along the way I
              learned that the real defect is rarely where it shows, so I reproduce a failure before I fix it.
            </p>
            <p>I also write. I have been published in the Jamaica Gleaner and the Jamaica Observer, and I have a self-published book.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/journey" className="btn-primary">
              Read my journey
            </Link>
            {brand.resumeAvailable ? (
              <a href={brand.resume} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <Download className="h-4 w-4" /> Download résumé
              </a>
            ) : (
              <Link to="/resume" className="btn-ghost">
                <Download className="h-4 w-4" /> Request my résumé
              </Link>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <img src={profilePhoto} alt="Aaron Prince" className="aspect-[3/4] w-full rounded-[2rem] border border-line object-cover object-[56%_30%]" />
        </Reveal>
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="h-section">What I work with</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {skills.map(([group, items]) => (
            <Reveal key={group}>
              <div className="rounded-3xl border border-line bg-panel p-6">
                <h3 className="font-hand text-2xl text-violet-light">{group}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((i) => (
                    <span key={i} className="rounded-full border border-line px-3 py-1 text-sm text-soft">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold">Core competencies</h2>
          <p className="mt-4 text-soft">{competencies.join("  ·  ")}</p>
          <p className="mt-6 text-soft">
            <span className="font-semibold text-cream">Validated at capture · Automate the manual · Traceable by design.</span>{" "}
            <span className="font-semibold text-fg">Education:</span> Bachelor of Science in Computer Science, Northern Caribbean University, Jamaica. GPA 3.5.
          </p>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="h-section">Coursework, and why it matters</h2>
          <p className="mt-3 max-w-2xl text-soft">
            Selected from the Northern Caribbean University recommended sequence for the B.Sc. in Computer Science, with where each subject shows up in my work.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {courses.map((c, i) => (
            <Reveal key={c.code} delay={Math.min(i * 0.02, 0.15)}>
              <div className="h-full rounded-2xl border border-line bg-panel p-5">
                <p className="font-mono text-xs text-soft">
                  {c.code} · Year {c.year}
                </p>
                <h3 className="mt-1 font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-soft">{c.relevance}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl font-bold">Credentials</h2>
          <ul className="mt-4 space-y-3 text-soft">
            {certs.map((c) => (
              <li key={c} className="flex gap-3">
                <span className="text-cream">▹</span> {c}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-2xl font-bold">Recognition</h2>
          <ul className="mt-4 space-y-3 text-soft">
            {recognition.map((r) => (
              <li key={r} className="flex gap-3">
                <span className="text-cream">▹</span> {r}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
};

export default About;
