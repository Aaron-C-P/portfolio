export type HelpService = { title: string; items: string[] };

/** Services listed on the digital card and the Student Help page. */
export const offers: HelpService[] = [
  {
    title: "Assignment help",
    items: ["Essays", "Research papers", "Reports", "Presentations", "Lab reports", "Case studies", "Proposals", "Group projects", "IT and coding projects", "Maths problem sets"],
  },
  {
    title: "SBA help",
    items: ["Topic and aim", "Method and write-up", "Data tables and graphs", "Analysis and conclusion", "Mark scheme check", "Proofreading"],
  },
  {
    title: "CSEC Mathematics",
    items: ["Computation and number theory", "Consumer arithmetic", "Sets", "Measurement", "Statistics", "Algebra", "Relations, functions and graphs", "Geometry and trigonometry", "Vectors and matrices", "Past papers"],
  },
];
