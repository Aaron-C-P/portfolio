import egzitMockup from "@/assets/portfolio/egzit-mockup.png";
import bnsPreorder from "@/assets/portfolio/bns-preorder.png";
import preqApp from "@/assets/portfolio/preq-app.png";

export const profile = {
  name: "Aaron Prince",
  title: "Software Engineering | Web Development | Network Design | Cybersecurity",
  location: "Mandeville, Manchester, Jamaica",
  email: "aaron7prince@gmail.com",
  phone: "(876) 790-2268",
  phoneHref: "tel:8767902268",
  github: "https://github.com/Aaron-C-P",
  linkedin: "https://linkedin.com/in/aaron-prince-b912b121",
  resume: "https://drive.google.com/file/d/1EnEtEyJYoFUAIWK48TKc4A0S18dQROjx/view?usp=sharing",
  // The resume is being updated. Flip to true to restore the download link.
  resumeAvailable: false as boolean,
  resumeRequest:
    "mailto:aaron7prince@gmail.com?subject=" +
    encodeURIComponent("Résumé request") +
    "&body=" +
    encodeURIComponent("Hi Aaron,\n\nCould you please send your latest résumé when it's ready? Thank you!"),
};

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  technologies: string[];
  image: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "chef-hudsons-christmas-cakes",
    title: "Chef Hudson's Christmas Cakes",
    subtitle: "Mobile-First Ordering Site",
    description:
      "A live ordering site for a local baker's Christmas fruit cakes. Customers place a simple order with no account and no online payment, and the baker arranges payment and delivery directly, managing everything from an admin dashboard and a Google Sheet. Under simultaneous real-world load some customers were turned away with a system-busy error. I traced it to a single global lock that every request queued behind, reproduced it in a discrete-event simulation, then fixed it. In simulation a 40-customer burst went from 9 failures to zero (modelled latency, not live measurement).",
    highlights: [
      "Traced a live \"system busy\" failure to a single global lock every request queued behind, including reads",
      "Reproduced the fault in a discrete-event simulation before changing production code",
      "Moved reads out of the lock; added a last-good stock fallback, jittered-backoff retries and idempotency keys so a retried order is never placed twice",
      "Closed a second defect where the duplicate guard only caught identical items",
      "Google Apps Script backend with a Google Sheet as the database, so the baker needs no new tools",
      "Bank-transfer flow where the baker verifies payment before confirming; rate-limited order lookup",
      "Auto-updating dashboard that writes its own plain-English summary and forecasts sell-out from the current run rate",
      "406 automated tests",
    ],
    technologies: ["React", "TypeScript", "MUI", "Google Apps Script", "Google Sheets", "Vercel"],
    image: null,
    liveUrl: "https://cake-sale-christmas.vercel.app",
    githubUrl: "https://github.com/Aaron-C-P/Cake-Sale",
    featured: true,
  },
  {
    slug: "errands",
    title: "Errands",
    subtitle: "Pickups & Deliveries in Mandeville",
    description:
      "A local errand and delivery service. Customers choose what they need (pharmacy pickups, food pickups, groceries and shopping, or something else), the price is confirmed, and the order is brought to their door.",
    highlights: [
      "Three-step flow: tell us what you need, we confirm your price, we bring it to you",
      "Menu, cart, order tracking and a My Order page for customers",
      "Admin area for managing incoming errands",
      "Normalised data model of products, categories, price history, locations, customers, trips and orders",
      "Tracks the same product across stores over time, so price movement is visible rather than guessed",
    ],
    technologies: ["React", "Web App", "Order Tracking", "Vercel"],
    image: null,
    liveUrl: "https://errands-ap.vercel.app/",
    githubUrl: null,
    featured: true,
  },
  {
    slug: "jamoment",
    title: "Jamoment",
    subtitle: "Authentic Jamaican Experiences Marketplace",
    description:
      "My own venture: a marketplace for authentic Jamaican experiences. Real places, real people, real moments. Verified local hosts and an AI \"Dream Engine\" for curation, built so tourism money stays local.",
    highlights: [
      "Verified local hosts offering authentic experiences",
      "AI \"Dream Engine\" for curating experiences",
      "Designed so tourism spending stays in local communities",
    ],
    technologies: ["Marketplace", "AI Curation", "Product Design"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
  {
    slug: "vectra",
    title: "Vectra",
    subtitle: "AI Job-Search Agent",
    description:
      "An AI agent built to automate the repetitive parts of job searching: parsing role requirements, matching them against a structured profile, and tailoring application material per posting. A personal tool built to solve a problem I was living with daily.",
    highlights: [
      "Parses role requirements and matches them against a structured profile",
      "Tailors application material per posting instead of sending one generic CV",
      "Turned a full-time manual process into an assisted one",
    ],
    technologies: ["AI Agents", "Python", "Automation"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
  {
    slug: "personal-finance-wallet",
    title: "Personal Finance Wallet",
    subtitle: "Financial Data Management",
    description:
      "Extended a digital wallet with full personal finance management: income, expenses, transfers, refunds, merchants and spending categories, with balance and transaction records. Monthly budgeting with spending alerts, budget utilisation tracking and projected month-end expenditure, plus summaries across monthly, three-month, twelve-month and all-time periods.",
    highlights: [
      "Income, expense, transfer and refund tracking across merchants and categories",
      "Spending alerts, utilisation tracking and projected month-end spend",
      "Transaction validation, duplicate detection and audit logging keep records traceable",
      "Automated tests protect existing behaviour on every change",
    ],
    technologies: ["Python", "SQLite", "Automated Testing"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: false,
  },
  {
    slug: "filetrack-pro",
    title: "FileTrack Pro",
    subtitle: "Records Custody & Audit Trail",
    description:
      "A records-custody system where every movement is time-stamped against holder, location and a mandatory reason code. Bulk movements carry a shared batch identifier, legacy records with no code follow a defined onboarding path, and manager corrections are tagged distinctly so an amendment can never be mistaken for an original entry.",
    highlights: [
      "Shared batch identifiers for bulk movements; defined onboarding path for legacy records",
      "Corrections tagged distinctly from original entries",
      "Automated overdue detection reports exceptions against ageing thresholds",
      "Management dashboard showing what is outstanding, and with whom",
    ],
    technologies: ["Audit Trail", "Data Governance", "Dashboard"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: false,
  },
  {
    slug: "egzit",
    title: "EGZIT",
    subtitle: "AI-Powered Smart Moving Assistant",
    description:
      "A comprehensive moving logistics platform with AI-powered inventory management, QR code tracking, real-time route optimization, and a mover marketplace. Features include smart packing recommendations, live GPS tracking, and integrated payment processing with Stripe.",
    highlights: [],
    technologies: ["React", "TypeScript", "Supabase", "OpenAI GPT-4", "Stripe", "Leaflet"],
    image: egzitMockup,
    liveUrl: "https://egzit-1-0-final.vercel.app/",
    githubUrl: "https://github.com/Aaron-C-P/Egzit-1.0-Final",
    featured: true,
  },
  {
    slug: "bns-lunch-pre-order",
    title: "BNS Lunch Pre-Order",
    subtitle: "Staff Ordering Solution",
    description:
      "Web application for Bank of Nova Scotia Mandeville staff to pre-order lunch. Features custom UI, Google Sheets backend integration, daily menus with protein/sides/vegetables categories, and duplicate-submission control.",
    highlights: [],
    technologies: ["TypeScript", "React", "Google Sheets API", "Vercel"],
    image: bnsPreorder,
    liveUrl: "https://bns-preorder.vercel.app",
    githubUrl: null,
    featured: true,
  },
  {
    slug: "softq-preq",
    title: "SoftQ Solutions (PreQ)",
    subtitle: "Pre-Queue Management System",
    description:
      "Appointment management tool developed for Tax Administration Jamaica (TAJ). Enables customers to schedule appointments and reduces wait times with intelligent queue management.",
    highlights: [],
    technologies: ["TypeScript", "React", "Database Design"],
    image: preqApp,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/PreQ-code",
    featured: true,
  },
  {
    slug: "smart-baby-bed-set",
    title: "Smart Baby Bed Set",
    subtitle: "IoT Safety & Accessibility Solution",
    description:
      "A human-centered smart baby bed designed to minimize SIDS risks and support caregivers with disabilities. Features automated temperature regulation, gentle rocking, and multimodal alerts (tactile, visual, audio). This comprehensive project demonstrates expertise in Software Engineering, Web Development, Network Design, Database Systems, Testing & QA, Project Management, and HCI principles.",
    highlights: [],
    technologies: ["IoT", "C++", "HCI", "Network Design", "Databases", "QA Testing", "Project Management"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
  {
    slug: "r-code-data-lab",
    title: "R Code Data Lab",
    subtitle: "QR Code Data Platform",
    description:
      "A platform to explore QR code data storage, chunking for larger files, and WhatsApp-style session authentication. Designed with a technical, cybersecurity-focused aesthetic inspired by tools like Vercel and Linear. Features include QR code generator, data size analyzer, chunking demos, and session authentication.",
    highlights: [],
    technologies: ["React", "QR Code", "Authentication", "Cybersecurity UI"],
    image: null,
    liveUrl: null,
    githubUrl: null,
    featured: false,
  },
  {
    slug: "hurricane-watch-jamaica",
    title: "Hurricane Watch Jamaica",
    subtitle: "Real-Time Weather Monitoring",
    description:
      "Real-time hurricane and weather monitoring application for Jamaica, providing live camera feeds and weather updates during storm events.",
    highlights: [],
    technologies: ["JavaScript", "APIs", "Real-time Data"],
    image: null,
    liveUrl: "https://safe-eye.netlify.app/#storm-tracker",
    githubUrl: null,
    featured: false,
  },
  {
    slug: "vault-guardian",
    title: "Vault Guardian",
    subtitle: "Secure Password Manager",
    description:
      "A secure, encrypted tool for password storage and generation. Implements industry-standard encryption practices to keep user credentials safe.",
    highlights: [],
    technologies: ["TypeScript", "Cryptography", "Security"],
    image: null,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/vault-keeper-simple-key",
    featured: false,
  },
  {
    slug: "orbita-commerce",
    title: "Orbita Commerce",
    subtitle: "Caribbean E-Commerce Platform",
    description:
      "E-commerce platform designed for Caribbean businesses with product management, transaction handling, and user authentication.",
    highlights: [],
    technologies: ["PHP", "MySQL", "E-Commerce"],
    image: null,
    liveUrl: null,
    githubUrl: "https://github.com/Aaron-C-P/Orbita",
    featured: false,
  },
];

export interface JourneyItem {
  date: string;
  title: string;
  place: string;
  text: string;
  kind: "education" | "project" | "certification" | "work";
}

export const journey: JourneyItem[] = [
  {
    date: "2026",
    title: "Local businesses go online",
    place: "Chef Hudson's Christmas Cakes, Errands",
    text: "Built an ordering site with a Google Sheets backend for a home baker, and an errand and delivery service for Mandeville.",
    kind: "project",
  },
  {
    date: "Mar-May 2026",
    title: "Web Development Intern",
    place: "Larvation Web LLC (remote)",
    text: "Built full-stack features and RESTful APIs in Node.js and TypeScript on the Nuxt stack, with agile code reviews alongside senior engineers. Used Git/GitHub and Postman to validate API behaviour.",
    kind: "work",
  },
  {
    date: "2026",
    title: "BSc Computer Science",
    place: "Northern Caribbean University",
    text: "Graduated (class of 2026) as Top Student in Software Engineering, with a 3.5 GPA and consistent Honor Roll standing.",
    kind: "education",
  },
  {
    date: "2025",
    title: "Full-stack and AI",
    place: "EGZIT, BNS Lunch Pre-Order, R Code Data Lab",
    text: "Moved into production-style apps: AI inventory, Stripe payments, GPS tracking and a Google Sheets ordering backend used by bank staff.",
    kind: "project",
  },
  {
    date: "2025",
    title: "Cybersecurity and networking",
    place: "Cisco, Google",
    text: "Completed Cisco Intro to Cybersecurity and Networking Basics; Google Cybersecurity Professional and Azure Database Administrator in progress.",
    kind: "certification",
  },
  {
    date: "2024",
    title: "Real clients and certifications",
    place: "SoftQ Solutions (PreQ), Simplilearn, TestOut",
    text: "Built the PreQ appointment system for Tax Administration Jamaica and earned Front End Development and Security Pro certifications.",
    kind: "certification",
  },
  {
    date: "2022-2023",
    title: "Foundations",
    place: "Northern Caribbean University",
    text: "Began the degree in January 2022 and built early web projects including a tic-tac-toe game and a series of PHP, JavaScript and HTML labs.",
    kind: "education",
  },
  {
    date: "Before 2022",
    title: "CAPE",
    place: "DeCarteret College",
    text: "Completed five CAPE subjects across Unit 1 and Unit 2.",
    kind: "education",
  },
];

export interface WritingItem {
  no: string;
  title: string;
  meta: string;
  href: string | null;
}

export const writing: WritingItem[] = [
  {
    no: "001",
    title: "Gentle Architect: The Lonely Build",
    meta: "Self-Published Book · 2026",
    href: "https://www.amazon.com/s?k=Gentle+Architect+The+Lonely+Build",
  },
  {
    no: "002",
    title: "Caricature Art Popularity Across Jamaica",
    meta: "Jamaica Gleaner · Growth & Jobs · 2026",
    href: "https://jamaica-gleaner.com/article/news/20260210/growth-jobs-caricature-art-popularity-across-jamaica",
  },
  {
    no: "003",
    title: "GenAI, Future Role & Professionalization of Foreign Language Teachers",
    meta: "Co-Author · Academic · 2025 (in progress)",
    href: null,
  },
  {
    no: "004",
    title: "Lines of Frustration: The Aftermath of Chaos",
    meta: "Jamaica Gleaner · Op-Ed · 2025",
    href: "https://jamaica-gleaner.com/article/letters/20251115/lines-frustration-aftermath-chaos",
  },
  {
    no: "005",
    title: "Our Perspective Determines the Path Forward",
    meta: "Jamaica Observer · Op-Ed · 2026",
    href: "https://www.jamaicaobserver.com/",
  },
  {
    no: "006",
    title: "Enhancing Education Without Replacing Traditional Methods",
    meta: "Jamaica Observer · Op-Ed · 2024",
    href: "https://www.jamaicaobserver.com/2024/05/30/enhancing-education-without-replacing-traditional-methods/",
  },
];

export const recognition = [
  { text: "NCB Grant Awardee, 3 consecutive quarters", sub: "Merit Funding" },
  { text: "Top Student, Software Engineering", sub: "Academic" },
  { text: "GPA 3.5 · Honor Roll standing", sub: "Academic" },
  { text: "Sagicor Scholarship Interview Candidate", sub: "Shortlisted" },
  { text: "Leadership Recognition", sub: "Service" },
  { text: "Published in national press and academia", sub: "Writing" },
  { text: "JTDA Youth Mingle, Jamaica tech community", sub: "Community" },
];

export interface Service {
  title: string;
  text: string;
  points: string[];
}

export const services: Service[] = [
  {
    title: "Ordering & Booking Systems",
    text: "Simple order and appointment sites for small businesses, as used for Chef Hudson's cakes, the BNS lunch pre-order and Errands.",
    points: ["Mobile-first order forms", "Duplicate and stock protection", "Owner dashboard and spreadsheet reports"],
  },
  {
    title: "Custom Web Applications",
    text: "Full-stack React and TypeScript apps with authentication, databases and payments where needed.",
    points: ["React, TypeScript, Tailwind", "Supabase, PostgreSQL, MySQL", "Stripe and API integrations"],
  },
  {
    title: "Spreadsheet-Backed Backends",
    text: "Google Sheets and Apps Script back ends for owners who want to keep working in tools they already know.",
    points: ["Live dashboards and pivots", "Automated tests for business rules", "Low running cost"],
  },
  {
    title: "Security & Network Fundamentals",
    text: "Secure-by-default builds and basic network design, backed by Cisco, TestOut and Google security coursework.",
    points: ["Encrypted credential handling", "Rate limiting and input validation", "Network design for IoT projects"],
  },
];
