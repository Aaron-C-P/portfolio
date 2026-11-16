import type { Resume } from "@/lib/resumeEngine";

/**
 * Sample résumés for the gallery. The people are made up: names, contacts and employers are fictional,
 * and the page labels them as samples. They show what strong, specific bullets look like in each template.
 */
export interface Sample {
  id: string;
  label: string;
  resume: Resume;
}

export const samples: Sample[] = [
  {
    id: "support",
    label: "Customer support",
    resume: {
      name: "Jordan Brown",
      title: "Customer Support Representative",
      email: "jordan.brown@example.com",
      phone: "876-555-0100",
      location: "Kingston, Jamaica",
      links: "linkedin.com/in/jordan-brown-sample",
      summary: "Support representative who resolves customer problems quickly and explains fixes in plain language. Comfortable with ticketing tools, phone and chat.",
      experience: [
        { role: "Customer Service Agent", org: "Island Retail", dates: "2023 - Present", bullets: ["Resolved 25+ customer tickets per day with a 96% satisfaction score", "Trained 6 new staff on the point-of-sale system, cutting onboarding from 2 weeks to 4 days", "Wrote 12 help articles that reduced repeat questions by 30%"] },
        { role: "Call Centre Trainee", org: "ConnectCare", dates: "2022 - 2023", bullets: ["Handled 60 calls per shift and resolved 80% on first contact", "Logged every issue in Zendesk with clear notes for the next agent"] },
      ],
      education: [{ school: "University of Technology, Jamaica", what: "BSc Information Technology", dates: "2019 - 2023" }],
      skills: "Customer support, Troubleshooting, Zendesk, Microsoft Excel, Active listening, Ticketing systems",
    },
  },
  {
    id: "it",
    label: "IT and data",
    resume: {
      name: "Alex Morgan",
      title: "IT Support and Data Analyst",
      email: "alex.morgan@example.com",
      phone: "876-555-0123",
      location: "Mandeville, Jamaica",
      links: "github.com/alex-morgan-sample",
      summary: "Technology graduate who fixes technical problems and turns messy data into clear reports. Built and tested small business tools used every week.",
      experience: [
        { role: "IT Support Technician", org: "Northside Clinic", dates: "2024 - Present", bullets: ["Diagnosed and fixed network faults for 40 users, cutting repeat incidents by 30%", "Migrated 5,000 patient records from spreadsheets to a database with zero data loss", "Documented 15 internal tools, halving questions to the support team"] },
        { role: "Data Intern", org: "Island Foods", dates: "2023", bullets: ["Analysed 3 years of sales data in Power BI and identified the 5 best-selling products", "Built a dashboard that cut weekly reporting from 5 hours to 30 minutes"] },
      ],
      education: [{ school: "University of Technology, Jamaica", what: "BSc Software Engineering", dates: "2020 - 2024" }],
      skills: "Troubleshooting, Networking, SQL, Power BI, Microsoft Excel, Python, Documentation",
    },
  },
  {
    id: "retail",
    label: "Retail and sales",
    resume: {
      name: "Taylor Reid",
      title: "Sales Associate",
      email: "taylor.reid@example.com",
      phone: "876-555-0145",
      location: "Montego Bay, Jamaica",
      links: "",
      summary: "Friendly, reliable sales associate who keeps shelves full, counts stock accurately and helps customers find what they need.",
      experience: [
        { role: "Sales Associate", org: "Bay Mart", dates: "2022 - Present", bullets: ["Served 150+ customers per shift with a 98% accurate till balance", "Cut stock write-offs by 22% by introducing a weekly count and reorder rule", "Increased add-on sales by 18% by recommending related products"] },
        { role: "Stock Clerk", org: "Fresh Corner", dates: "2021 - 2022", bullets: ["Received and shelved 40 deliveries a week without errors", "Organised the storeroom so picking time dropped by 25%"] },
      ],
      education: [{ school: "Montego Bay High School", what: "CSEC, 7 subjects including Mathematics and English", dates: "2016 - 2021" }],
      skills: "Customer service, Cash handling, Inventory counts, Merchandising, Upselling, Teamwork",
    },
  },
  {
    id: "admin",
    label: "Office and admin",
    resume: {
      name: "Casey Williams",
      title: "Administrative Assistant",
      email: "casey.williams@example.com",
      phone: "876-555-0167",
      location: "Spanish Town, Jamaica",
      links: "",
      summary: "Organised administrative assistant who keeps records accurate and schedules on time. Experienced with spreadsheets, invoices and front-desk service.",
      experience: [
        { role: "Administrative Assistant", org: "Prime Logistics", dates: "2021 - Present", bullets: ["Coordinated deliveries for 60 customers weekly with 99% on-time completion", "Automated invoice follow-ups with Excel and email templates, recovering $2,400 in late payments", "Managed a $5,000 office budget and delivered a records clean-up two weeks early"] },
        { role: "Front Desk Receptionist", org: "Harbour Dental", dates: "2019 - 2021", bullets: ["Booked 30 appointments a day and cut no-shows by 20% with reminder calls", "Filed and digitised 2,000 patient records"] },
      ],
      education: [{ school: "HEART/NSTA Trust", what: "Certificate in Office Administration", dates: "2018 - 2019" }],
      skills: "Scheduling, Microsoft Word, Microsoft Excel, Invoicing, Record keeping, Customer service, Time management",
    },
  },
];
