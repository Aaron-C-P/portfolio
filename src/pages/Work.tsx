import { useState } from "react";
import { projects, type Status } from "@/data/studio";
import { ProjectCard, SectionHead, usePageTitle } from "@/components/studio/parts";

const filters: ("All" | Status)[] = ["All", "Deployed application", "Working prototype", "Experiment", "Academic project", "In progress"];

const Work = () => {
  usePageTitle("Work");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = projects.filter((p) => filter === "All" || p.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <SectionHead page
        eyebrow="The work"
        title="Everything I have built, labelled honestly."
        intro="A live application is not an experiment, and an experiment is not a product. Every project says which it is."
      />
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              filter === f ? "border-violet bg-violet text-white" : "border-line text-soft hover:border-violet-light hover:text-fg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
      {shown.length === 0 && <p className="text-soft">Nothing in this category yet.</p>}
    </div>
  );
};

export default Work;
