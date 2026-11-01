/**
 * Skills with proof. Every skill carries an honest level and links to where it shows up,
 * so a reviewer can verify it instead of taking a word on trust.
 */
export type Level = "Shipped" | "Built" | "Coursework and labs" | "In progress";

export const levels: { name: Level; dots: number; meaning: string }[] = [
  { name: "Shipped", dots: 4, meaning: "Used in work that real people use" },
  { name: "Built", dots: 3, meaning: "Used in projects I designed and built" },
  { name: "Coursework and labs", dots: 2, meaning: "Learned in a degree or lab setting" },
  { name: "In progress", dots: 1, meaning: "Actively studying, not claimed yet" },
];

export type RoleKey = "analyst" | "developer" | "it";

export const roles: { key: RoleKey; title: string; pitch: string; bringMeIn: string; proof: { label: string; to: string }[] }[] = [
  {
    key: "analyst",
    title: "Data and Reporting Analyst",
    pitch: "I turn messy records into numbers a manager can trust, and I make the data traceable.",
    bringMeIn: "Reports are built by hand, figures are disputed, or nobody can say where a number came from.",
    proof: [
      { label: "Cake platform dashboard and simulation", to: "/work/chef-hudsons-christmas-cakes" },
      { label: "Sales KPI dashboard", to: "/work/sales-analytics-dashboard" },
      { label: "FileTrack Pro audit trail", to: "/work/filetrack-pro" },
    ],
  },
  {
    key: "developer",
    title: "Software Developer",
    pitch: "I reproduce a failure before I fix it, and I ship systems that hold up under real use.",
    bringMeIn: "You need working features, clean APIs and someone who tests and documents.",
    proof: [
      { label: "Concurrency fix with 406 tests", to: "/work/chef-hudsons-christmas-cakes" },
      { label: "EGZIT marketplace, 14-table schema", to: "/work/egzit" },
      { label: "Errands delivery service", to: "/work/errands" },
    ],
  },
  {
    key: "it",
    title: "IT, Networking and Security",
    pitch: "Foundations in networking and security, practised in labs and certifications.",
    bringMeIn: "You need a junior who learns fast, documents everything and respects access control.",
    proof: [
      { label: "Secure, audited data handling", to: "/work/personal-finance-wallet" },
      { label: "Credentials: Security+, CCNA path", to: "/about" },
      { label: "Coursework: networks, operating systems", to: "/about" },
    ],
  },
];

export interface Skill {
  name: string;
  group: "Data" | "Build" | "Practice" | "Network and security" | "Engineering and maths";
  level: Level;
  roles: RoleKey[];
  /** One line saying where it shows up. */
  proof: string;
  links: { label: string; to: string }[];
  /** Extra search terms an HR search might use. */
  keywords?: string[];
}

export const skills: Skill[] = [
  {
    name: "SQL (PostgreSQL)",
    group: "Data",
    level: "Shipped",
    roles: ["analyst", "developer"],
    proof: "Queries, joins, aggregations and indexing on a production database during my internship; a 14-table schema in EGZIT.",
    links: [{ label: "EGZIT", to: "/work/egzit" }, { label: "Internship", to: "/journey" }],
    keywords: ["postgres", "database", "queries", "joins", "indexing"],
  },
  {
    name: "SQL (MySQL)",
    group: "Data",
    level: "Built",
    roles: ["analyst", "developer"],
    proof: "Stored procedures and prepared statements in an e-commerce build.",
    links: [{ label: "Orbita Commerce", to: "/work/orbita-commerce" }],
    keywords: ["mysql", "stored procedures"],
  },
  {
    name: "SQL Server and Microsoft Access",
    group: "Data",
    level: "Coursework and labs",
    roles: ["analyst"],
    proof: "Listed on my résumé; database management practised through coursework. Ask me for specifics.",
    links: [{ label: "Coursework", to: "/about" }],
    keywords: ["sql server", "access", "ms access", "database management"],
  },
  {
    name: "Python for data processing and automation",
    group: "Data",
    level: "Built",
    roles: ["analyst", "developer"],
    proof: "A finance wallet with validation, duplicate detection and audit logging, covered by automated tests.",
    links: [{ label: "Finance Wallet", to: "/work/personal-finance-wallet" }],
    keywords: ["python", "scripting", "automation", "etl", "data processing"],
  },
  {
    name: "Dashboards and KPI design",
    group: "Data",
    level: "Shipped",
    roles: ["analyst"],
    proof: "A live baker's dashboard and pivots, plus a KPI dashboard with trend, seasonality and live filters (illustrative data).",
    links: [{ label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }, { label: "Sales dashboard", to: "/work/sales-analytics-dashboard" }],
    keywords: ["kpi", "dashboard", "business intelligence", "bi", "data visualization", "reporting"],
  },
  {
    name: "Reporting automation",
    group: "Data",
    level: "Shipped",
    roles: ["analyst"],
    proof: "Orders flow into a Google Sheet that builds the dashboard and pivots, so nobody compiles a report by hand.",
    links: [{ label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }, { label: "BNS Lunch Pre-Order", to: "/work/bns-lunch-pre-order" }],
    keywords: ["reporting", "google sheets", "apps script", "automation", "management information"],
  },
  {
    name: "Data validation and audit logging",
    group: "Data",
    level: "Shipped",
    roles: ["analyst", "developer", "it"],
    proof: "Duplicate-order detection fixed in a live system; audit trails and mandatory reason codes in FileTrack Pro and the finance wallet.",
    links: [{ label: "FileTrack Pro", to: "/work/filetrack-pro" }, { label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }],
    keywords: ["data quality", "data integrity", "traceability", "duplicate detection", "validation", "governance"],
  },
  {
    name: "Database and schema design",
    group: "Data",
    level: "Shipped",
    roles: ["analyst", "developer"],
    proof: "A 14-table relational model with row-level security for a logistics marketplace.",
    links: [{ label: "EGZIT", to: "/work/egzit" }],
    keywords: ["data modelling", "data modeling", "schema", "rls", "relational"],
  },
  {
    name: "Power BI",
    group: "Data",
    level: "In progress",
    roles: ["analyst"],
    proof: "Working toward the Microsoft Power BI Data Analyst certification. Not claimed as a delivered skill yet.",
    links: [{ label: "Credentials", to: "/about" }],
    keywords: ["power bi", "microsoft power bi", "pl-300", "dax"],
  },
  {
    name: "React and TypeScript",
    group: "Build",
    level: "Shipped",
    roles: ["developer"],
    proof: "Customer-facing apps in production for a baker, a delivery service and a staff ordering tool.",
    links: [{ label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }, { label: "Errands", to: "/work/errands" }],
    keywords: ["react", "typescript", "javascript", "front end", "frontend", "web development"],
  },
  {
    name: "Node.js and REST APIs",
    group: "Build",
    level: "Shipped",
    roles: ["developer"],
    proof: "APIs and third-party integrations with validated responses, built and reviewed during my internship.",
    links: [{ label: "Internship", to: "/journey" }],
    keywords: ["node", "api", "rest", "backend", "back end", "integration", "postman"],
  },
  {
    name: "Concurrency and load testing",
    group: "Build",
    level: "Shipped",
    roles: ["developer"],
    proof: "Reproduced a live lock bottleneck in a discrete-event simulation, then fixed it with retries and idempotency keys.",
    links: [{ label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }],
    keywords: ["performance", "load", "simulation", "debugging", "idempotency", "reliability"],
  },
  {
    name: "Git, documentation and automated testing",
    group: "Practice",
    level: "Shipped",
    roles: ["developer", "analyst", "it"],
    proof: "406 automated tests, architecture and security documentation, code review and CI/CD during my internship.",
    links: [{ label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" }],
    keywords: ["git", "github", "testing", "ci/cd", "agile", "documentation", "code review"],
  },
  {
    name: "Clear communication to non-technical staff",
    group: "Practice",
    level: "Shipped",
    roles: ["analyst", "developer", "it"],
    proof: "Published in the Jamaica Gleaner and Jamaica Observer, co-author of a peer-reviewed journal paper (Castledown), and a volunteer workshop facilitator.",
    links: [{ label: "Writing", to: "/writing" }],
    keywords: ["communication", "writing", "stakeholder", "presentation", "facilitation"],
  },
  {
    name: "Process improvement",
    group: "Practice",
    level: "Shipped",
    roles: ["analyst", "developer"],
    proof: "Replaced message-based order taking with a validated ordering flow for a bank team and a baker.",
    links: [{ label: "BNS Lunch Pre-Order", to: "/work/bns-lunch-pre-order" }],
    keywords: ["process", "workflow", "automation", "requirements gathering", "collaboration"],
  },
  {
    name: "Engineering design and dimensioning",
    group: "Engineering and maths",
    level: "Built",
    roles: ["developer", "it"],
    proof: "A poultry house modelled in 3D, with a dimensioned nest-bank sheet, a cut list (79.4 sq ft, 3 plywood sheets with 20% waste) and failure modes designed out. Concept stage, not built.",
    links: [{ label: "Egg farm design", to: "/work/egg-farm-design" }],
    keywords: ["engineering", "cad", "3d model", "drawings", "technical drawing", "specification", "design", "construction"],
  },
  {
    name: "Embedded systems and hardware design (ESP32)",
    group: "Engineering and maths",
    level: "Coursework and labs",
    roles: ["it", "developer"],
    proof: "Human-Computer Interaction course project: a rocking crib designed around an ESP32 with a servo, temperature sensor, camera and fan, drawn in dimensioned views and built as a wooden prototype.",
    links: [{ label: "Smart rocking crib", to: "/work/smart-rocking-crib" }],
    keywords: ["esp32", "arduino", "iot", "embedded", "microcontroller", "servo", "sensors", "hardware", "prototype", "hci", "human-computer interaction"],
  },
  {
    name: "Mathematics, modelling and simulation",
    group: "Engineering and maths",
    level: "Built",
    roles: ["analyst", "developer"],
    proof: "Sizing from stated rules, nine-day temperature simulations for a cold front and a heat wave, and a discrete-event load simulation. Calculus and Lagrange constraints are sketched in my notebook.",
    links: [{ label: "Egg farm design", to: "/work/egg-farm-design" }, { label: "Cake simulation", to: "/work/chef-hudsons-christmas-cakes" }],
    keywords: ["maths", "math", "mathematics", "calculus", "statistics", "modelling", "modeling", "simulation", "optimisation", "optimization", "physics"],
  },
  {
    name: "Networking (CCNA path, Packet Tracer)",
    group: "Network and security",
    level: "Coursework and labs",
    roles: ["it"],
    proof: "Cisco Networking Academy: CCNA Introduction to Networks (2026); the full CCNA is in progress.",
    links: [{ label: "Credentials", to: "/about" }],
    keywords: ["ccna", "cisco", "packet tracer", "networking", "tcp/ip", "routing", "switching"],
  },
  {
    name: "Security fundamentals",
    group: "Network and security",
    level: "Coursework and labs",
    roles: ["it", "developer"],
    proof: "CompTIA Security+ 701 training (Infosec, 2025), secure software engineering coursework, access control in builds.",
    links: [{ label: "Credentials", to: "/about" }],
    keywords: ["security+", "comptia", "cybersecurity", "access control", "rbac", "confidentiality"],
  },
];

/** Plain-text keyword list for search engines and applicant-tracking scanners. */
export const competencies = [
  "Data Analytics", "Reporting and Management Information", "Microsoft Access", "Business Intelligence", "KPI Dashboards", "Data Visualization",
  "Reporting Automation", "SQL", "PostgreSQL", "MySQL", "SQL Server", "Python", "Data Processing", "Database Design", "Data Modelling",
  "Data Governance", "Data Quality and Validation", "Audit Trails and Traceability", "Duplicate Detection", "Data Security and Access Control",
  "Process Improvement", "Cross-Functional Collaboration", "Requirements Gathering", "Technical Documentation", "Banking Operations",
  "Regulatory Confidentiality Standards",
];
