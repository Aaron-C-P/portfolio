import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { profile, projects } from "@/data/site";

const Projects = () => (
  <>
    <PageHeader
      eyebrow="Portfolio"
      title="Projects"
      intro="Applications I've designed and built, from live client sites to academic and experimental work."
    />
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className="text-center mt-12">
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-portfolio-accent hover:underline font-medium"
        >
          View all repositories on GitHub <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  </>
);

export default Projects;
