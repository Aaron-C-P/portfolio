import { Link } from "react-router-dom";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import type { Project } from "@/data/site";

export const ProjectCard = ({ project }: { project: Project }) => (
  <article className="group flex flex-col bg-white border border-portfolio-border rounded-2xl overflow-hidden hover:border-portfolio-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg">
    <Link to={`/projects/${project.slug}`} className="block">
      {project.image ? (
        <img src={project.image} alt="" className="w-full aspect-video object-cover object-top" />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-portfolio-accent to-portfolio-secondary flex items-center justify-center p-6">
          <span className="text-2xl font-bold text-white text-center">{project.title}</span>
        </div>
      )}
    </Link>
    <div className="flex flex-col flex-1 p-6">
      <span className="text-portfolio-accent text-xs font-semibold uppercase tracking-wider mb-1">{project.subtitle}</span>
      <h3 className="text-xl font-bold mb-3">
        <Link to={`/projects/${project.slug}`} className="hover:text-portfolio-accent transition-colors">
          {project.title}
        </Link>
      </h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {project.technologies.slice(0, 4).map((t) => (
          <span key={t} className="text-xs bg-portfolio-accent/10 text-portfolio-accent px-2.5 py-1 rounded-full font-medium">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-portfolio-accent hover:underline"
        >
          Details <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="flex gap-3 text-slate-500">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live site`} className="hover:text-portfolio-accent">
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source code`} className="hover:text-portfolio-accent">
              <Github className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  </article>
);
