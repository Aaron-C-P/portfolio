import egzitMockup from "@/assets/portfolio/egzit-mockup.png";
import bnsPreorder from "@/assets/portfolio/bns-preorder.png";
import preqLogo from "@/assets/portfolio/preq-logo.jpeg";

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
      "An ordering site for a home baker's Christmas fruit cakes. Customers browse the cakes and place a simple order with no account and no online payment, and the baker arranges payment and delivery directly. The baker manages everything from an admin dashboard and a Google Sheet.",
    highlights: [
      "Google Apps Script backend with a Google Sheet as the database, so the baker needs no new tools",
      "Bank-transfer flow: customers see their order number and bank details, and the baker verifies payment before confirming",
      "Duplicate-order protection, stock limits and rate-limited order lookup (order number plus last 4 phone digits)",
      "Auto-updating Sheet dashboard with totals, revenue, pivots and items needing attention",
      "340+ automated tests covering order rules, the backend simulation and analytics",
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
    ],
    technologies: ["React", "Web App", "Order Tracking", "Vercel"],
    image: null,
    liveUrl: "https://errands-ap.vercel.app/",
    githubUrl: null,
    featured: true,
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
    image: preqLogo,
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
  kind: "education" | "project" | "certification";
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
    date: "Aug 2026",
    title: "BSc Computer Science",
    place: "Northern Caribbean University",
    text: "Final-year coursework completed with a 3.5 GPA and Honor Roll standing. Degree conferral August 2026.",
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
