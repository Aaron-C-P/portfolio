import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { projects } from "@/data/site";

const ProjectDetail = () => {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];

  if (!project) {
    return (
      <>
        <PageHeader eyebrow="404" title="Project not found" intro="That project doesn't exist." documentTitle="Project not found" />
        <div className="text-center pb-24">
          <Button asChild>
            <Link to="/projects">Back to projects</Link>
          </Button>
        </div>
      </>
    );
  }

  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <PageHeader eyebrow={project.subtitle} title={project.title} />
      <article className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-portfolio-accent mb-8">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>

          {project.image && (
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="w-full rounded-2xl border border-portfolio-border shadow-xl mb-10"
            />
          )}

          <p className="text-lg text-slate-700 leading-relaxed mb-8">{project.description}</p>

          {project.highlights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Highlights</h2>
              <ul className="space-y-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-portfolio-accent shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="text-xl font-bold mb-4">Built with</h2>
          <div className="flex flex-wrap gap-2 mb-10">
            {project.technologies.map((t) => (
              <span key={t} className="px-3 py-1.5 text-sm bg-portfolio-accent/10 text-portfolio-accent rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mb-16">
            {project.liveUrl && (
              <Button asChild className="bg-portfolio-accent hover:bg-portfolio-accent/90 text-white rounded-xl">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Visit live site
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" className="rounded-xl">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" /> Source code
                </a>
              </Button>
            )}
          </div>

          <Link
            to={`/projects/${next.slug}`}
            className="block p-6 border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-colors"
          >
            <span className="text-sm text-slate-500">Next project</span>
            <p className="text-xl font-bold">{next.title}</p>
          </Link>
        </div>
      </article>
    </>
  );
};

export default ProjectDetail;
