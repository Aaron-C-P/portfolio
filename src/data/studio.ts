import profilePhoto from "@/assets/portfolio/aaron-hero.png";
import feedGraduation from "@/assets/portfolio/feed-graduation.webp";
import feedEvent from "@/assets/portfolio/feed-itda-event.png";
import cakeHome from "@/assets/work/cake-home.jpg";
import errandsHome from "@/assets/work/errands-home.jpg";
import egzitMockup from "@/assets/portfolio/egzit-mockup.png";
import bnsPreorder from "@/assets/portfolio/bns-preorder.png";
import preqApp from "@/assets/portfolio/preq-app.png";
import shotJournal from "@/assets/articles/journal-aile.jpg";
import shotDefence from "@/assets/articles/defence-9-5.jpg";
import shotScratch from "@/assets/articles/starting-from-scratch.jpg";
import shotPerspective from "@/assets/articles/perspective.jpg";
import shotEducation from "@/assets/articles/enhancing-education.jpg";
import shotCaricature from "@/assets/articles/caricature-art.jpg";
import shotFrustration from "@/assets/articles/lines-of-frustration.jpg";
import shotLifeHard from "@/assets/articles/life-is-hard.jpg";
import eggFarm3d from "@/assets/portfolio/egg-farm-3d.png";
import eggFarmSheet from "@/assets/portfolio/egg-farm-sheet.png";
import eggFarmThermal from "@/assets/portfolio/egg-farm-thermal.png";

export { profilePhoto };

export const brand = {
  name: "Aaron Prince",
  studio: "Technology & Digital Solutions",
  tagline: "Technology, thoughtfully built.",
  location: "Mandeville, Manchester, Jamaica",
  email: "aaron7prince@gmail.com",
  phone: "(876) 790-2268",
  phoneHref: "tel:8767902268",
  github: "https://github.com/Aaron-C-P",
  linkedin: "https://linkedin.com/in/aaron-prince-b912b121",
  resume: "https://drive.google.com/file/d/1EnEtEyJYoFUAIWK48TKc4A0S18dQROjx/view?usp=sharing",
  resumeAvailable: false as boolean,
  resumeRequest:
    "mailto:aaron7prince@gmail.com?subject=" +
    encodeURIComponent("Résumé request") +
    "&body=" +
    encodeURIComponent("Hi Aaron,\n\nCould you please send your latest résumé when it's ready? Thank you!"),
};

/** Every project carries a status so experiments are never mistaken for products. */
export type Status =
  | "Deployed application"
  | "Working prototype"
  | "Experiment"
  | "Academic project"
  | "In progress"
  | "Concept design"
  | "Details being added";

export interface Project {
  slug: string;
  name: string;
  kind: string;
  status: Status;
  oneLiner: string;
  purpose: string;
  problem: string;
  solution: string;
  role: string;
  tech: string[];
  /** Things I have checked against the live app, the repository or my own published account. */
  verified: string[];
  /** Ideas explored but not claimed as finished features. */
  conceptual?: string[];
  story?: string;
  image: string | null;
  imageAlt?: string;
  live: string | null;
  repo: string | null;
  featured: boolean;
  /** Related service slugs, used to connect sections. */
  services: string[];
  special?: "simulation" | "qr-flow" | "schema" | "engineering";
  gallery?: { src: string; alt: string; caption: string }[];
}

export const projects: Project[] = [
  {
    slug: "chef-hudsons-christmas-cakes",
    name: "Chef Hudson's Christmas Cakes",
    kind: "Ordering platform for a local baker",
    status: "Deployed application",
    oneLiner: "A live ordering site for a baker, and the engineering story of making it hold up under pressure.",
    purpose: "Let customers order Christmas fruit cakes from their phones while the baker keeps working in a Google Sheet.",
    problem:
      "Under simultaneous real-world demand, some customers were turned away with a \"system busy\" error. Orders are the business, so every failed attempt was a lost sale.",
    solution:
      "I traced the fault to a single script lock that every request queued behind, reads included. I reproduced it in a discrete-event simulation first, then moved reads and the slow dashboard refresh out of the critical section and added a last-good stock fallback, retries with jittered backoff and idempotency keys so a retried order can never be placed twice. I also fixed a second defect where the duplicate-order check only caught identical items.",
    role: "Designed, built, tested and deployed the whole system: the customer site, the baker's dashboard, the Google Apps Script backend and the test suite.",
    tech: ["React", "TypeScript", "MUI", "Vite", "Google Apps Script", "Google Sheets", "Vercel"],
    verified: [
      "Customer ordering and order lookup, used by a real baker (no public link is shown here)",
      "Google Sheet backend with Orders, Dashboard and Pivots; no customer account and no online payment",
      "Bank-transfer flow where the baker verifies payment before confirming",
      "Public repository with architecture, deployment and security documentation",
      "Automated test suite covering order rules, a backend simulation and analytics (406 tests per my résumé)",
      "Simulated results: a 40-customer burst went from 9 failures to 0, and a 90-customer burst beyond capacity from 32 failures to 1, with nothing lost, duplicated or oversold. Modelled latency, not live measurement",
    ],
    story:
      "The interesting part is not the cakes. It is that I refused to patch the symptom: I made the failure happen on purpose, in a simulation, before changing production code.",
    image: cakeHome,
    imageAlt: "Chef Hudson's Christmas Cakes home page",
    live: null,
    repo: "https://github.com/Aaron-C-P/Cake-Sale",
    featured: true,
    services: ["ordering-systems", "web-development", "reporting-dashboards", "workflow-automation"],
    special: "simulation",
  },
  {
    slug: "errands",
    name: "Errands",
    kind: "Pickup and delivery service for Mandeville",
    status: "Deployed application",
    oneLiner: "Pharmacy, food and grocery runs, ordered in three steps and brought to your door.",
    purpose: "Make it easy for people in Mandeville to ask for something to be picked up and delivered.",
    problem: "Everyday errands cost people time, and informal requests over chat are hard to price, track and keep straight.",
    solution:
      "A request flow where the customer chooses a category, the price is confirmed, and the order is tracked until it arrives, with an admin area for managing incoming errands.",
    role: "Built the product end to end.",
    tech: ["Web application", "Order tracking", "Admin dashboard", "Vercel"],
    verified: [
      "Live site at errands-ap.vercel.app",
      "Categories: pharmacy pickups, food pickups, groceries and shopping, something else",
      "Pages for Menu, My Order, Track and Admin, with a cart",
      "Three-step flow: tell us what you need, we confirm your price, we bring it to you",
    ],
    conceptual: ["A relational model of products, price history, locations, customers, trips and orders for tracking prices across stores"],
    image: errandsHome,
    imageAlt: "Errands home page showing four request categories",
    live: "https://errands-ap.vercel.app/",
    repo: null,
    featured: true,
    services: ["ordering-systems", "custom-applications", "database-design"],
  },
  {
    slug: "egzit",
    name: "EGZIT",
    kind: "AI-assisted moving logistics platform",
    status: "Deployed application",
    oneLiner: "A moving assistant that treats a house move as a data problem: items, boxes, movers, routes and payments.",
    purpose: "Replace the chaos of a move (lost belongings, no plan, unclear pricing) with an organised, trackable process.",
    problem: "Moves go wrong through misplaced items, poor organisation and inefficient planning, and customers cannot easily compare movers.",
    solution:
      "A web app where users catalogue items with QR labels, group them into boxes, request a move, get quotes from movers in a marketplace, pay through Stripe and follow the move on a map.",
    role: "Designed the database and security model and built the application.",
    tech: ["React", "TypeScript", "Vite", "Tailwind", "Supabase (PostgreSQL, Auth, Edge Functions)", "Stripe", "Leaflet"],
    verified: [
      "Live deployment and public repository (Egzit-1.0-Final)",
      "Documented 14-table PostgreSQL design: profiles, inventories, items, boxes, moves, movers, bookings, quotes, tracking events and more",
      "Row Level Security on every table, an admin role check through a SECURITY DEFINER function and a signup trigger that creates the profile and inventory",
      "Pages in the code for inventory, boxes, movers, route, tracking, chat, payments and admin",
      "Edge functions for item categorisation and a chat assistant",
    ],
    conceptual: ["Machine-learning packing recommendations and route optimisation are described in the README as goals; I have not verified how far each went"],
    image: egzitMockup,
    imageAlt: "EGZIT application mockup",
    live: "https://egzit-1-0-final.vercel.app/",
    repo: "https://github.com/Aaron-C-P/Egzit-1.0-Final",
    featured: true,
    services: ["custom-applications", "database-design", "web-development"],
    special: "schema",
  },
  {
    slug: "qr-data-lab",
    name: "QR Data Lab",
    kind: "Exploration of what a QR code can do",
    status: "Experiment",
    oneLiner: "What if a QR code is not the data, but a small key that unlocks backend logic?",
    purpose: "Understand how much a QR code can carry and how a tiny identifier can trigger much larger workflows.",
    problem: "QR codes are usually treated as containers for links. Their payload limits and encoding behaviour make them a poor place for large or sensitive data.",
    solution:
      "A proof-of-concept experiment showing how small structured information can connect to larger backend functionality, alongside written exploration of payload limits, encoding, information theory and secure time-bound authentication ideas.",
    role: "Researched, built the proof of concept and wrote up the findings.",
    tech: ["React", "QR encoding", "Backend logic"],
    verified: [
      "Described by me as an experiment and a proof of concept",
      "Companion FilePro capture simulation: a software model of printing and photographing QR sheets, decoded with the production decoder and checked by SHA-256 of the original file against the reconstruction",
      "Simulation status at last check: 84 of 1,123 planned runs complete, 84 passed, 0 hash mismatches, 0 wrong reads accepted. Perspective up to 70 degrees, rotation and light defocus passed; the remaining sweeps had not run",
      "Simulated, not real camera data: a pass does not show a real printer and phone will work",
    ],
    conceptual: [
      "Secure, time-bound authentication using QR codes as lightweight triggers",
      "This is not a finished commercial authentication product",
    ],
    story: "A good example of learning by building: I wanted to understand the limits before relying on the idea.",
    image: null,
    live: null,
    repo: null,
    featured: true,
    services: ["workflow-automation", "custom-applications"],
    special: "qr-flow",
  },
  {
    slug: "vectra",
    name: "Vectra",
    kind: "AI-assisted job-search agent",
    status: "Details being added",
    oneLiner: "An AI agent built to take over the repetitive half of a job search.",
    purpose: "Manage the volume and repetition of applying for work.",
    problem: "A serious job search means reading many postings, matching each to your profile and tailoring material every time.",
    solution: "An AI-assisted workflow that parses role requirements, matches them to a structured profile and helps tailor application material per posting.",
    role: "Designed and built it as a personal tool.",
    tech: ["AI agents", "Python", "Automation"],
    verified: ["Introduced by me as a personal project; code, screenshots and documentation are being added"],
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["workflow-automation"],
  },
  {
    slug: "becoming",
    name: "Becoming",
    kind: "Structured goal discovery",
    status: "Working prototype",
    oneLiner: "Guided questions that build a private map of what a person actually wants, from their own words.",
    purpose: "Turn vague ambition into clear, personal goals through a structured experience.",
    problem: "Most goal-setting starts with a blank page, and vague answers like \"I want more money\" hide very different motives.",
    solution:
      "Becoming asks one question at a time and turns each answer into a map of values, dreams, goals, next steps, challenges and strengths. When an answer is ambiguous it keeps several competing explanations open and picks the next question that would best tell them apart, rather than guessing a motive.",
    role: "Product idea, design and build.",
    tech: ["JavaScript", "D3 (map)", "Bayesian updating", "AI interpretation (optional)"],
    verified: [
      "Working prototype: the code runs, with a rule-based fallback when AI is switched off",
      "Every item on the map must quote the person's own answer, and the quote is checked against what they typed",
      "Answers and map are private to the account; sharing is opt-in, item by item",
      "Editing or deleting an answer removes its effects and recalculates the map",
      "Built as a private prototype, not a public product: no public link yet",
    ],
    conceptual: [
      "Suggested connections between two people's shared items exist in the prototype but are not tested with real users",
      "Not a therapy, diagnosis or personality-scoring tool, and it does not claim to be",
    ],
    story: "The interesting part was evidence: each answer shifts support between explanations, and the app shows its reasoning instead of announcing a conclusion.",
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["custom-applications"],
  },
  {
    slug: "sales-analytics-dashboard",
    name: "Sales Performance Analytics Dashboard",
    kind: "KPI reporting practice",
    status: "Working prototype",
    oneLiner: "An interactive KPI dashboard on a 90-day dataset, built to practise executive-style reporting.",
    purpose: "Practise turning raw sales rows into the handful of numbers a manager actually reads.",
    problem: "Raw sales data does not tell anyone whether the business is growing, when it is busy or which segment matters.",
    solution:
      "KPI tiles for revenue, units, average order value and period-over-period growth; a revenue trend with a seven-day moving average; a day-of-week seasonality view; segment breakdowns; and filters that recompute every visual live.",
    role: "Designed and built it.",
    tech: ["KPI design", "Trend and seasonality analysis", "Interactive filters"],
    verified: ["The data is illustrative and clearly labelled as such, so none of these figures describe a real business"],
    conceptual: ["Power BI is a skill I am still completing; this dashboard is not claimed as a Power BI deliverable"],
    story: "Practice with a purpose: I wanted to feel what it takes to keep every chart consistent when one filter changes.",
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["data-analysis", "reporting-dashboards"],
  },
  {
    slug: "personal-finance-wallet",
    name: "Personal Finance Management Wallet",
    kind: "Financial data management",
    status: "Working prototype",
    oneLiner: "A Python and SQLite wallet that tracks money and refuses to double-count it.",
    purpose: "Track income, expenses, transfers and refunds across merchants and categories with balances you can trust.",
    problem: "Personal finance records drift: duplicates, missing history and budgets that only tell you after the money is gone.",
    solution:
      "Transaction records with balances, monthly budgeting with spending alerts and projected month-end spend, and summaries across monthly, three-month, twelve-month and all-time periods. Transaction validation, duplicate detection, audit logging and historical record preservation protect the data, with automated tests guarding existing behaviour during updates.",
    role: "Designed, built and tested it.",
    tech: ["Python", "SQLite", "Automated testing"],
    verified: ["Built as a personal project; no public link or repository is shown here"],
    story: "The audit log came first. Every change had to be traceable before it was allowed to be convenient.",
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["database-design", "workflow-automation", "data-analysis"],
  },
  {
    slug: "filetrack-pro",
    name: "FileTrack Pro",
    kind: "Data governance and audit trail",
    status: "Working prototype",
    oneLiner: "Records that cannot quietly change, and a dashboard that reports what is overdue.",
    purpose: "Show exactly who held a file, where, and why, at every step.",
    problem: "When a record moves between people, a lost or altered entry is hard to spot and harder to explain.",
    solution:
      "Every movement is time-stamped against holder, location and a mandatory reason code. Batch identifiers cover bulk operations, corrections are tagged so an amendment can never be mistaken for an original entry, and automated overdue detection reports exceptions through a management dashboard.",
    role: "Designed and built it.",
    tech: ["Audit logging", "Data validation", "Exception reporting"],
    verified: ["Described from my own résumé; no public link or repository is shown here"],
    story: "Traceable by design is the idea I keep coming back to: build the record so the question can always be answered.",
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["database-design", "reporting-dashboards", "workflow-automation"],
  },
  {
    slug: "bns-lunch-pre-order",
    name: "BNS Lunch Pre-Order",
    kind: "Staff ordering tool",
    status: "Deployed application",
    oneLiner: "A lunch pre-order tool for bank staff, running on a Google Sheet.",
    purpose: "Let Bank of Nova Scotia (Mandeville) staff pre-order lunch from daily menus.",
    problem: "Collecting lunch orders by message produces duplicates, missed orders and spreadsheets nobody trusts.",
    solution: "A clean ordering page over a Google Sheets backend with menus split into protein, sides and vegetables, and duplicate-submission control.",
    role: "Built it.",
    tech: ["TypeScript", "React", "Google Sheets", "Vercel"],
    verified: ["Live at bns-preorder.vercel.app"],
    image: bnsPreorder,
    imageAlt: "BNS Lunch Pre-Order screen",
    live: "https://bns-preorder.vercel.app",
    repo: null,
    featured: false,
    services: ["ordering-systems", "workflow-automation"],
  },
  {
    slug: "egg-farm-design",
    name: "Egg Farm Engineering Design",
    kind: "Structural, environmental and sizing design",
    status: "Concept design",
    oneLiner: "A poultry house designed on paper first: 3D model, engineering sheet with a parts list, and a heat simulation comparing two designs.",
    purpose: "Work out how to house 50 laying hens in Manchester, Jamaica, and compare an all-mesh house with a curtained house with a white roof before anything is built.",
    problem: "Hens lose lay above about 30 °C and need fresh air without draughts or rain. A wrong choice is expensive to undo once built.",
    solution:
      "I modelled two designs in 3D, wrote the nest-box sheet with dimensions, a cut list and the failure modes to design out, and simulated nine days of weather for a cold front and a heat wave to see what the hens would feel in each design. Design B adds curtains with a 6 in open gap at the top for fresh air, and a white roof.",
    role: "Designed the models, drawings, calculations and simulation.",
    tech: ["3D modelling", "Engineering drawing", "Dimensioning and cut lists", "Thermal simulation", "Python plotting"],
    verified: [
      "Sizing worked from stated rules: 1 nest hole per 4 hens, so 16 holes for 50 hens",
      "Nest bank sheet totals 79.4 sq ft of plywood, 3 sheets including 20% waste",
      "Marked on the drawings as concept and screening only: not for construction, an engineer must verify first",
    ],
    conceptual: ["Nothing here has been built or measured on a real farm; the temperature curves are a simulation"],
    image: eggFarm3d,
    imageAlt: "3D concept model of the egg farm house with curtains closed",
    live: null,
    repo: null,
    featured: false,
    services: [],
    special: "engineering",
    gallery: [
      { src: eggFarm3d, alt: "3D model of Design B with curtains closed", caption: "Design B in 3D: curtains closed for night, rain and storm, with a 6 in gap left open at the top." },
      { src: eggFarmSheet, alt: "Engineering sheet E-01 for the nest box bank", caption: "Sheet E-01: front elevation, section, cut list and specification for an 8-hole, 2-tier nest bank." },
      { src: eggFarmThermal, alt: "Temperature simulation for a cold front and a heat wave", caption: "Simulation: what the hens feel in each design during a cold front and a heat wave, against the 18 to 25 °C comfort zone." },
    ],
  },
  {
    slug: "softq-preq",
    name: "SoftQ / PreQ",
    kind: "Pre-queue appointment system",
    status: "Working prototype",
    oneLiner: "Appointment booking meant to cut waiting time at Tax Administration Jamaica.",
    purpose: "Let customers schedule appointments so they spend less time queuing.",
    problem: "Walk-in queues are slow and unpredictable for customers and staff.",
    solution: "A scheduling application with queue management for appointment-based service.",
    role: "Built the application.",
    tech: ["TypeScript", "React", "Database design"],
    verified: ["Public repository PreQ-code (December 2024)"],
    image: preqApp,
    imageAlt: "PreQ appointment dashboard",
    live: null,
    repo: "https://github.com/Aaron-C-P/PreQ-code",
    featured: false,
    services: ["ordering-systems", "database-design"],
  },
  {
    slug: "orbita-commerce",
    name: "Orbita Commerce",
    kind: "E-commerce platform",
    status: "Academic project",
    oneLiner: "A PHP and MySQL storefront with accounts, products and transactions.",
    purpose: "Learn full-stack commerce: products, users and checkout.",
    problem: "Small Caribbean businesses need straightforward online selling.",
    solution: "Product management, transaction handling and user authentication.",
    role: "Built it.",
    tech: ["PHP", "MySQL"],
    verified: ["Public repository Orbita (April 2025)"],
    image: null,
    live: null,
    repo: "https://github.com/Aaron-C-P/Orbita",
    featured: false,
    services: ["web-development", "database-design"],
  },
  {
    slug: "hurricane-watch-jamaica",
    name: "Hurricane Watch Jamaica",
    kind: "Weather monitoring",
    status: "Deployed application",
    oneLiner: "Live camera feeds and storm updates for Jamaica.",
    purpose: "Keep people informed during storm events.",
    problem: "Information during a hurricane is scattered across many sources.",
    solution: "A single page that brings weather updates and live camera feeds together.",
    role: "Built it.",
    tech: ["JavaScript", "APIs", "Real-time data"],
    verified: ["Live at safe-eye.netlify.app"],
    image: null,
    live: "https://safe-eye.netlify.app/#storm-tracker",
    repo: null,
    featured: false,
    services: ["web-development"],
  },
  {
    slug: "smart-baby-bed-set",
    name: "Smart Baby Bed Set",
    kind: "IoT safety and accessibility design",
    status: "Academic project",
    oneLiner: "A smart baby bed designed to lower SIDS risk and support caregivers with disabilities.",
    purpose: "Apply software engineering, networking and human-centred design to a real safety problem.",
    problem: "Caregivers with disabilities need alerts they can perceive, and infants need a safer sleep environment.",
    solution: "Automated temperature regulation, gentle rocking and alerts that are tactile, visual and audio.",
    role: "Designed the system across software, network, database and testing.",
    tech: ["IoT", "C++", "Network design", "Databases", "QA testing"],
    verified: ["Course project"],
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["technical-support", "database-design"],
  },
  {
    slug: "jamoment",
    name: "Jamoment",
    kind: "Marketplace for authentic Jamaican experiences",
    status: "In progress",
    oneLiner: "Real places. Real people. Real moments.",
    purpose: "Connect visitors to verified local hosts so tourism money stays local.",
    problem: "Tourism income often bypasses the communities that make an experience worth having.",
    solution: "A marketplace of verified hosts with an AI curation idea called the Dream Engine.",
    role: "Founder and builder.",
    tech: ["Marketplace", "AI curation"],
    verified: ["My own venture; details and screenshots are being added"],
    image: null,
    live: null,
    repo: null,
    featured: false,
    services: ["custom-applications"],
  },
];

export const findProject = (slug?: string) => projects.find((p) => p.slug === slug);

export interface Milestone {
  id: string;
  date: string;
  /** false when the exact date is still being checked against the original post. */
  dated: boolean;
  title: string;
  chapter: "Foundations" | "Building" | "Real businesses" | "Voice";
  summary: string;
  explored: string;
  problem: string;
  built: string;
  tech: string[];
  outcome: string;
  project?: string;
}

export const milestones: Milestone[] = [
  {
    id: "ncu",
    date: "January 2022",
    dated: true,
    title: "Starting Computer Science",
    chapter: "Foundations",
    summary: "BSc Computer Science at Northern Caribbean University begins.",
    explored: "Programming, software engineering, databases and how systems fit together.",
    problem: "Turning theory into things that run.",
    built: "Coursework, labs and an early interest in building rather than only studying.",
    tech: ["Programming", "Software engineering", "Databases"],
    outcome: "A foundation that later graduates as the Class of 2026.",
  },
  {
    id: "first-code",
    date: "June to August 2022",
    dated: true,
    title: "First public code",
    chapter: "Foundations",
    summary: "Lab repositories and a tic-tac-toe game appear on GitHub.",
    explored: "HTML, CSS, PHP and JavaScript through course labs.",
    problem: "Learning by doing each assignment properly.",
    built: "COMSCI 2180 labs and a browser game.",
    tech: ["HTML", "CSS", "PHP", "JavaScript"],
    outcome: "The start of a public record of work.",
  },
  {
    id: "preq",
    date: "December 2024",
    dated: true,
    title: "PreQ for Tax Administration Jamaica",
    chapter: "Building",
    summary: "My first system aimed at a real institution's queues.",
    explored: "Appointment scheduling and queue management.",
    problem: "Long walk-in waits.",
    built: "A pre-queue appointment application.",
    tech: ["TypeScript", "React", "Database design"],
    outcome: "A working prototype published on GitHub.",
    project: "softq-preq",
  },
  {
    id: "certs",
    date: "2024 to 2025",
    dated: true,
    title: "Security and networking credentials",
    chapter: "Building",
    summary: "Certifications that back up the security-first habit.",
    explored: "Cybersecurity and networking fundamentals.",
    problem: "Building software that is secure from the first commit.",
    built: "Completed Simplilearn Front End Development (2024), TestOut Security Pro (2024), Cisco Intro to Cybersecurity (2025) and Cisco Networking Basics (2025).",
    tech: ["Security", "Networking", "Front end"],
    outcome: "Google Cybersecurity Professional and Azure Database Administrator are in progress.",
  },
  {
    id: "orbita",
    date: "April 2025",
    dated: true,
    title: "Orbita Commerce",
    chapter: "Building",
    summary: "A full-stack storefront in PHP and MySQL.",
    explored: "Accounts, products and transactions.",
    problem: "Online selling for Caribbean businesses.",
    built: "Product management, transaction handling and authentication.",
    tech: ["PHP", "MySQL"],
    outcome: "An academic project that taught the shape of a commerce system.",
    project: "orbita-commerce",
  },
  {
    id: "egzit",
    date: "October to December 2025",
    dated: true,
    title: "EGZIT: software for a move",
    chapter: "Building",
    summary: "A moving platform that treats relocation as a logistics and data problem.",
    explored: "Inventory, QR identification, marketplaces, payments and live tracking.",
    problem: "Misplaced belongings, poor planning and unclear pricing.",
    built: "A 14-table database with row-level security, a React app, Stripe payments and map tracking.",
    tech: ["React", "TypeScript", "Supabase", "Stripe", "Leaflet"],
    outcome: "A deployed application and a documented architecture.",
    project: "egzit",
  },
  {
    id: "press-1",
    date: "November 2025",
    dated: true,
    title: "Writing for a national audience",
    chapter: "Voice",
    summary: "A letter in the Jamaica Gleaner after Hurricane Melissa.",
    explored: "How systems fail people when they are under strain.",
    problem: "Long lines and fragile services in the storm's aftermath.",
    built: "\"Lines of Frustration: The Aftermath of Chaos\".",
    tech: ["Writing"],
    outcome: "Published in the Gleaner. More pieces followed in 2026.",
  },
  {
    id: "internship",
    date: "March to June 2026",
    dated: true,
    title: "Web Development Intern, Larvation Web LLC (remote)",
    chapter: "Real businesses",
    summary: "Remote full-stack work in a team.",
    explored: "Working inside agile code review with senior engineers.",
    problem: "Delivering features that meet shared standards.",
    built: "Full-stack features and RESTful APIs in Node.js and TypeScript on the Nuxt stack, validated with Postman. Wrote, tested and optimised SQL queries and schema changes against a production PostgreSQL database (joins, aggregations, indexing), built data-processing routines and third-party API integrations that validate returned data before it reaches downstream features, and delivered through an Agile cycle with Git, peer code review, CI/CD pipelines and technical documentation.",
    tech: ["Node.js", "TypeScript", "Nuxt", "PostgreSQL", "Git", "Postman", "CI/CD"],
    outcome: "Professional experience of reviews, standards and shipping.",
  },
  {
    id: "graduation",
    date: "2026",
    dated: true,
    title: "Graduating as Top Student in Software Engineering",
    chapter: "Foundations",
    summary: "Class of 2026, GPA 3.5, consistent Honor Roll.",
    explored: "Software engineering, secure systems, networking and database design.",
    problem: "Moving from student to practitioner.",
    built: "A degree and a body of deployed work.",
    tech: ["Computer science"],
    outcome: "BSc Computer Science, Northern Caribbean University.",
  },
  {
    id: "cake",
    date: "October 2026",
    dated: true,
    title: "Chef Hudson's Christmas Cakes",
    chapter: "Real businesses",
    summary: "A live ordering site and a lesson in concurrency.",
    explored: "Why a system that works for one user fails for forty.",
    problem: "Customers turned away with a \"system busy\" error.",
    built: "Reproduced the failure in a simulation, then removed the lock bottleneck and added retries, idempotency keys and a last-good stock fallback.",
    tech: ["React", "TypeScript", "Google Apps Script", "Google Sheets"],
    outcome: "In simulation, a 40-customer burst went from nine errors and one customer not getting through to zero errors with every order completed.",
    project: "chef-hudsons-christmas-cakes",
  },
  {
    id: "errands",
    date: "2026",
    dated: false,
    title: "Errands",
    chapter: "Real businesses",
    summary: "A pickup and delivery service for Mandeville.",
    explored: "How to make a simple request flow feel trustworthy.",
    problem: "Everyday errands are hard to price, track and organise informally.",
    built: "A three-step request, price confirmation and delivery flow with tracking and an admin area.",
    tech: ["Web application"],
    outcome: "A live application. Exact launch date is being confirmed.",
    project: "errands",
  },
  {
    id: "qr",
    date: "Date being confirmed",
    dated: false,
    title: "What can a QR code really do?",
    chapter: "Building",
    summary: "An exploration of QR payloads, encoding and backend triggers.",
    explored: "Payload limits, encoding behaviour, information theory and time-bound authentication ideas.",
    problem: "QR codes are treated as containers for data when they work better as keys.",
    built: "A proof-of-concept experiment linking a small structured identifier to larger backend functionality.",
    tech: ["QR encoding", "Backend logic"],
    outcome: "A clear picture of the limits. Described as an experiment, not a finished authentication product.",
    project: "qr-data-lab",
  },
  {
    id: "vectra",
    date: "Date being confirmed",
    dated: false,
    title: "Vectra: an AI agent for the job search",
    chapter: "Building",
    summary: "Automating the repetitive half of applying for work.",
    explored: "AI-assisted workflows for matching and tailoring.",
    problem: "Managing a job search is a job in itself.",
    built: "An agent that parses requirements and helps tailor material per posting.",
    tech: ["AI agents", "Python"],
    outcome: "Details are being added.",
    project: "vectra",
  },
];

export interface PressItem {
  no: string;
  title: string;
  meta: string;
  href: string | null;
  /** Screenshot of the published page. */
  shot?: string;
}

export const press: PressItem[] = [
  { no: "001", title: "Gentle Architect: The Lonely Build", meta: "Self-published book · 2026", href: "https://www.amazon.com/s?k=Gentle+Architect+The+Lonely+Build" },
  { no: "002", title: "Caricature Art Popularity Across Jamaica", meta: "Jamaica Gleaner · Growth & Jobs · February 2026", href: "https://jamaica-gleaner.com/article/news/20260210/growth-jobs-caricature-art-popularity-across-jamaica", shot: shotCaricature },
  { no: "003", title: "From Augmentation to Transformation: Foreign Language Teachers' Perceptions of GenAI's Role in Redefining Teaching, Learning, and Assessment", meta: "Peer-reviewed journal · Castledown, Artificial Intelligence in Language Education, vol. 2 (2026) · Co-author with Madden, Paiva, Edwards and Daley", href: "https://doi.org/10.29140/aile.2026.104107", shot: shotJournal },
  { no: "004", title: "Lines of Frustration: The Aftermath of Chaos", meta: "Jamaica Gleaner · Letter · 2025", href: "https://jamaica-gleaner.com/article/letters/20251115/lines-frustration-aftermath-chaos", shot: shotFrustration },
  { no: "005", title: "Life Is Hard, but Perspective Will Determine the Path Forward", meta: "Jamaica Gleaner · Letter · July 2026", href: "https://jamaica-gleaner.com/article/letters/20260711/life-hard-perspective-will-determine-path-forward", shot: shotLifeHard },
  { no: "009", title: "In Defence of the 9-5", meta: "Jamaica Observer · Columns · September 2026", href: "https://www.jamaicaobserver.com/2026/09/14/defence-9-5/", shot: shotDefence },
  { no: "006", title: "Starting from Scratch", meta: "Jamaica Observer · September 2026", href: "https://www.jamaicaobserver.com/2026/09/02/starting-from-scratch/", shot: shotScratch },
  { no: "008", title: "Our Perspective Determines the Path Forward", meta: "Jamaica Observer · July 2026", href: "https://www.jamaicaobserver.com/2026/07/13/perspective-determines-path-forward/", shot: shotPerspective },
  { no: "007", title: "Enhancing Education Without Replacing Traditional Methods", meta: "Jamaica Observer · May 2024", href: "https://www.jamaicaobserver.com/2024/05/30/enhancing-education-without-replacing-traditional-methods/", shot: shotEducation },
];

export const recognition = [
  "NCB Grant Awardee, 3 consecutive quarters",
  "Top Student, Software Engineering",
  "GPA 3.5 and Honor Roll standing",
  "Sagicor Scholarship interview candidate",
  "Leadership Recognition Award",
  "Volunteer workshop facilitator, SBA",
  "JTDA Youth Mingle, Jamaica tech community",
];

export interface Service {
  slug: string;
  title: string;
  promise: string;
  forWhom: string;
  outcomes: string[];
  examples: string[];
}

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web development",
    promise: "A fast, clear website or web app that people can use on a phone without instructions.",
    forWhom: "Businesses that want to be found, understood and trusted online.",
    outcomes: ["Visitors understand what you offer in seconds", "Works on small screens first", "Easy for you to update"],
    examples: ["chef-hudsons-christmas-cakes", "hurricane-watch-jamaica", "orbita-commerce"],
  },
  {
    slug: "custom-applications",
    title: "Custom business applications",
    promise: "Software shaped around how your business actually works, instead of bending your process around a generic tool.",
    forWhom: "Teams stuck with spreadsheets, message threads or tools that almost fit.",
    outcomes: ["One place for requests, records and status", "Fewer manual hand-offs", "A system you own"],
    examples: ["egzit", "errands", "becoming"],
  },
  {
    slug: "ordering-systems",
    title: "Ordering and request systems",
    promise: "Take orders and requests without chasing people, double-handling or losing track.",
    forWhom: "Bakers, caterers, delivery services, offices and anyone who takes orders.",
    outcomes: ["Orders arrive complete and only once", "Stock and availability stay honest", "You see what needs attention today"],
    examples: ["chef-hudsons-christmas-cakes", "errands", "bns-lunch-pre-order", "softq-preq"],
  },
  {
    slug: "database-design",
    title: "Database design",
    promise: "A data model that keeps records accurate, secure and ready for the questions you will ask later.",
    forWhom: "Anyone whose data has outgrown a single sheet.",
    outcomes: ["Clear structure for people, items and transactions", "Access rules so people only see what they should", "Audit trails where it matters"],
    examples: ["egzit", "errands", "softq-preq"],
  },
  {
    slug: "data-analysis",
    title: "Data analysis",
    promise: "Turn the records you already collect into answers you can act on.",
    forWhom: "Owners who suspect the answer is in their data but cannot see it.",
    outcomes: ["Plain-language findings", "Trends, busiest times and best sellers", "Decisions backed by numbers"],
    examples: ["chef-hudsons-christmas-cakes", "errands"],
  },
  {
    slug: "reporting-dashboards",
    title: "Reporting and dashboards",
    promise: "Reports that update themselves, so nobody builds them by hand again.",
    forWhom: "Managers and owners who need to see the state of things at a glance.",
    outcomes: ["Live totals and what is outstanding", "A written summary of what the numbers mean", "Alerts for what needs a decision"],
    examples: ["chef-hudsons-christmas-cakes"],
  },
  {
    slug: "workflow-automation",
    title: "Workflow automation",
    promise: "Remove the repetitive steps so people spend their time on the work that needs them.",
    forWhom: "Teams doing the same copy-paste and checking every day.",
    outcomes: ["Fewer errors from manual entry", "Faster turnaround", "Processes that can be tested"],
    examples: ["chef-hudsons-christmas-cakes", "bns-lunch-pre-order", "vectra", "qr-data-lab"],
  },
  {
    slug: "technical-support",
    title: "Technical and systems support",
    promise: "Calm, practical help when something is broken or confusing.",
    forWhom: "Small teams without a full-time technical person.",
    outcomes: ["Problems reproduced before they are fixed", "Clear explanation of what went wrong", "Systems documented so they can be maintained"],
    examples: ["chef-hudsons-christmas-cakes", "smart-baby-bed-set"],
  },
  {
    slug: "digital-design",
    title: "Graphic and digital design",
    promise: "Visuals and interfaces that look like they belong to a real business.",
    forWhom: "Businesses whose product is better than the way it looks.",
    outcomes: ["A consistent look across site and materials", "Screens that guide the eye", "Mockups before building"],
    examples: ["chef-hudsons-christmas-cakes", "errands"],
  },
];

export const principles = [
  { title: "Understand the problem first", text: "Most defects are not where they show. I ask what is really going wrong before I touch the code." },
  { title: "Reproduce it, then fix it", text: "If I cannot make a failure happen on purpose, I do not know that I fixed it. The cake platform is the proof." },
  { title: "Learn by building", text: "Most things are not hard, only unfamiliar. I keep building until they become familiar." },
];

export interface FeedPost {
  id: string;
  date: string;
  source: string;
  text: string;
  image: string | null;
  imageAlt: string;
  /** Honest note about what the image is. */
  note?: string;
  href?: string;
}

/** Posts from my own LinkedIn activity, reproduced here. */
export const feed: FeedPost[] = [
  {
    id: "graduation",
    date: "October 2026",
    source: "LinkedIn",
    text: "Grinding in silence, letting the results speak. B.Sc. in Computer Science from NCU. AMEN!",
    image: feedGraduation,
    imageAlt: "Graduate in cap and gown looking at a framed degree in a modern corridor, with a Milestone caption",
    note: "The graphic is an illustration made for the post, not a photograph of the certificate.",
    href: brand.linkedin,
  },
  {
    id: "youth-mingle",
    date: "Early October 2026",
    source: "LinkedIn",
    text: "Sometimes the best part of an experience is the people and conversations along the way. The JTDA Youth Mingle was a good experience: new people, meaningful conversations, and a reminder that growth is bigger than what happens in the classroom.",
    href: brand.linkedin,
    image: feedEvent,
    imageAlt: "Collage of a group photo and speakers at an event with JTDA banners",
  },
  {
    id: "ccna",
    date: "Mid-October 2026",
    source: "LinkedIn",
    text: "New certification: CCNA: Introduction to Networks from Cisco Networking Academy.",
    image: null,
    imageAlt: "",
    note: "The full CCNA certification is still in progress.",
    href: brand.linkedin,
  },
  {
    id: "defence-9-5",
    date: "14 September 2026",
    source: "Jamaica Observer, Columns",
    text: "In Defence of the 9-5. A column on why a salaried job is too often read online as a lack of ambition, why entrepreneurship is not automatically freedom, and why stability, income and dignity can be the base for saving, studying or building something on the side. Success has many definitions, and the right path is one you choose on purpose.",
    image: shotDefence,
    imageAlt: "Screenshot of the Jamaica Observer column In defence of the 9-5, bylined Aaron Prince",
    note: "Screenshot of the published column.",
    href: "https://www.jamaicaobserver.com/2026/09/14/defence-9-5/",
  },
  {
    id: "perspective",
    date: "July 2026",
    source: "LinkedIn and Jamaica Observer",
    text: "Our Perspective Determines the Path Forward. How perspective shapes decisions, why resilience is recalibration rather than giving up, and how challenges become growth.",
    image: shotPerspective,
    imageAlt: "Screenshot of the Jamaica Observer column Our perspective determines the path forward",
    note: "Screenshot of the published column.",
    href: "https://www.jamaicaobserver.com/2026/07/13/perspective-determines-path-forward/",
  },
  {
    id: "journal-aile",
    date: "18 June 2026",
    source: "Castledown, Artificial Intelligence in Language Education",
    text: "Co-authored a peer-reviewed journal paper with Oneil Madden, Jerónimo Paiva, Kevol Edwards and Jason-Lee Daley: a qualitative study of how 30 foreign language educators across 13 Caribbean countries see GenAI changing teaching, learning and assessment.",
    image: shotJournal,
    imageAlt: "Screenshot of the Castledown journal page for From augmentation to transformation, listing the authors",
    note: "Screenshot of the published, open-access article page.",
    href: "https://doi.org/10.29140/aile.2026.104107",
  },
];

export interface Course {
  code: string;
  name: string;
  /** Left out where the exact year is not confirmed. */
  year?: 1 | 2 | 3 | 4;
  /** Where the subject shows up in the work. */
  relevance: string;
}

/** From the NCU recommended sequence for the B.Sc. in Computer Science, selected for relevance. */
export const courses: Course[] = [
  { code: "CPTR113", name: "Intro to Programming", year: 1, relevance: "The base for every project: reading, writing and reasoning about code." },
  { code: "CPTR151 / 242", name: "Programming I and II", year: 1, relevance: "Structured, testable code, the habit behind the cake platform's test suite." },
  { code: "MATH171", name: "Calculus I", year: 2, relevance: "Rates of change and optimisation, the idea behind Lagrange multipliers." },
  { code: "CPTR204", name: "Website Design and Implementation", year: 2, relevance: "Responsive front ends such as Errands and BNS Lunch Pre-Order." },
  { code: "CPTR213", name: "Fundamentals of Databases", year: 2, relevance: "Schemas, keys and queries: EGZIT's 14-table model, the wallet's SQLite store." },
  { code: "CPTR236", name: "Secure Software Engineering", year: 2, relevance: "Validation, access control and audit logging: traceable by design." },
  { code: "CPTR252", name: "Data Structures and Algorithms", year: 2, relevance: "Choosing structures that stay fast, and knowing why." },
  { code: "CPTR282", name: "Computer Organization and Architecture", year: 2, relevance: "What the machine does under the code I write." },
  { code: "CPTR311", name: "Discrete Structures in Computer Science", year: 3, relevance: "Logic and counting behind validation rules and the simulation models." },
  { code: "CPTR313", name: "Fundamentals of Security Techniques", year: 3, relevance: "Foundations for Security+ study and data-protection decisions." },
  { code: "CPTR355", name: "Algorithm Analysis and Design", year: 3, relevance: "Reasoning about cost and growth before a system is under load." },
  { code: "CPTR365", name: "Artificial Intelligence", year: 3, relevance: "Background for AI-assisted tools such as Vectra and Becoming." },
  { code: "CPTR375", name: "Operating Systems", year: 3, relevance: "Locks, queues and contention: the vocabulary of the cake platform bottleneck." },
  { code: "CPTR380", name: "Data Telecommunications", year: 3, relevance: "Networking foundations, practised in Cisco Packet Tracer for CCNA." },
  { code: "MATH205", name: "Probability Theory and Statistics with Applications", year: 3, relevance: "The base for analytics, KPI interpretation and simulation." },
  { code: "CPTR415", name: "Human-Computer Interaction", year: 4, relevance: "Designing flows people can follow without explanation." },
  { code: "CPTR450", name: "Database Systems", year: 4, relevance: "Transactions, concurrency and integrity: idempotency keys and duplicate detection." },
  { code: "CPTR490", name: "Advanced Project", year: 4, relevance: "End-to-end delivery of a larger system." },
  { code: "MATH288", name: "Fundamentals of Linear Algebra with Applications", year: 4, relevance: "Vectors and matrices underpin robotics and machine learning, two interests of mine." },
];


/** The six electives, grouped as one focus. Basis says honestly how each is backed up. */
export const specialization = {
  title: "Cloud, networks and secure systems",
  pitch:
    "Beyond the core Computer Science sequence, my electives point one way: how software is hosted, connected, administered and protected. It is the part of IT that keeps what I build running, and keeps the data safe.",
  honesty: "Electives are coursework. Where I have applied one in a real build, the card says so and links to it; where I have not, it says that too.",
  tracks: [
    {
      name: "Cloud Computing",
      icon: "cloud" as const,
      basis: "Applied in projects",
      what: "How applications run on shared infrastructure rather than one machine.",
      proof: "My apps are hosted on Vercel, with Supabase and Google Sheets as back ends.",
      links: [
        { label: "Cake platform", to: "/work/chef-hudsons-christmas-cakes" },
        { label: "EGZIT", to: "/work/egzit" },
      ],
    },
    {
      name: "IT Project Management",
      icon: "project" as const,
      basis: "Applied in projects",
      what: "Scoping, milestones and delivery: turning a request into a plan and then into something shipped.",
      proof: "I scoped, built and delivered tools for a baker and for a bank team, and worked in Git with code review during my internship.",
      links: [
        { label: "BNS Lunch Pre-Order", to: "/work/bns-lunch-pre-order" },
        { label: "Internship", to: "/journey" },
      ],
    },
    {
      name: "Network Implementation",
      icon: "network" as const,
      basis: "Coursework and labs",
      what: "Designing, configuring and troubleshooting networks: subnets, routing and switching.",
      proof: "Practised in Cisco Packet Tracer; CCNA Introduction to Networks is done and the full CCNA is in progress.",
      links: [{ label: "Networking skill", to: "/skills" }],
    },
    {
      name: "Systems Administration",
      icon: "sysadmin" as const,
      basis: "Coursework",
      what: "Running and maintaining servers and user access: the operations side of keeping a system healthy.",
      proof: "Studied as an elective, alongside operating-systems coursework. I do not claim a production sysadmin role.",
      links: [{ label: "All skills", to: "/skills" }],
    },
    {
      name: "Data Security",
      icon: "security" as const,
      basis: "Applied in projects",
      what: "Protecting data at rest and in use: validation, access control and audit trails.",
      proof: "Row-level security in EGZIT, and mandatory reason codes with audit logging in FileTrack Pro and the finance wallet.",
      links: [
        { label: "FileTrack Pro", to: "/work/filetrack-pro" },
        { label: "Finance Wallet", to: "/work/personal-finance-wallet" },
      ],
    },
    {
      name: "Advanced Application Development",
      icon: "apps" as const,
      basis: "Applied in projects",
      what: "Building larger, multi-part applications with a real database, roles and tests.",
      proof: "A 14-table marketplace, a live delivery service and a 406-test ordering platform.",
      links: [
        { label: "EGZIT", to: "/work/egzit" },
        { label: "Errands", to: "/work/errands" },
      ],
    },
  ],
};
