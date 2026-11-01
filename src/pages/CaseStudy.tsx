import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Github, Lightbulb } from "lucide-react";
import { ProjectTour } from "@/components/studio/ProjectTour";
import { findProject, projects, services } from "@/data/studio";
import {
  BrowserFrame,
  FlowDiagram,
  MediaNeeded,
  Note,
  Reveal,
  SimComparison,
  StatusBadge,
  usePageTitle,
} from "@/components/studio/parts";

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-4 border-t border-line py-10 md:grid-cols-[200px_1fr] md:gap-10">
    <h2 className="font-hand text-3xl text-violet-light">{title}</h2>
    <div className="space-y-4 text-lg leading-relaxed text-fg/90">{children}</div>
  </Reveal>
);

const schemaTables = ["profiles", "inventories", "items", "boxes", "moves", "movers", "mover_services", "mover_reviews", "bookings", "quotes", "user_roles", "move_tracking_events", "move_performance", "chat_messages"];

const CaseStudy = () => {
  const { slug } = useParams();
  const project = findProject(slug);
  usePageTitle(project?.name ?? "Not found");

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-40 text-center">
        <h1 className="text-4xl font-bold">That project does not exist</h1>
        <Link to="/work" className="btn-primary mt-8">
          Back to all work
        </Link>
      </div>
    );
  }

  const related = services.filter((s) => project.services.includes(s.slug));
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <Link to="/work" className="inline-flex items-center gap-2 text-sm text-soft hover:text-cream">
        <ArrowLeft className="h-4 w-4" /> All work
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm uppercase tracking-wider text-soft">{project.kind}</span>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">{project.name}</h1>
        <p className="mt-4 max-w-2xl text-xl text-soft">{project.oneLiner}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ExternalLink className="h-4 w-4" /> Visit the live site
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Github className="h-4 w-4" /> Source code
            </a>
          )}
        </div>
      </header>

      <div className="mt-12">
        <ProjectTour project={project} />
      </div>

      <div className="mt-8">
        {project.image ? <BrowserFrame src={project.image} alt={project.imageAlt ?? project.name} url={project.live} /> : <MediaNeeded name={project.name} />}
      </div>

      <div className="mt-8">
        <Block title="Why it exists">
          <p>{project.purpose}</p>
        </Block>
        <Block title="The problem">
          <p>{project.problem}</p>
        </Block>
        <Block title="What I built">
          <p>{project.solution}</p>
        </Block>

        {project.special === "simulation" && (
          <Block title="The engineering story">
            <p>The fix started with a failure I could make happen on demand.</p>
            <ol className="space-y-3">
              {[
                "Reproduce: replay a burst of customers through the real client and server code in a discrete-event simulation.",
                "Find the cause: one script lock that every request queued behind, including reads and the slow dashboard refresh.",
                "Remove the bottleneck: reads and the dashboard refresh moved outside the critical section.",
                "Make it resilient: a last-good stock fallback, retries with jittered backoff and idempotency keys so a retried order is never placed twice.",
                "Close the second defect: duplicate-order detection only caught identical items.",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-1 font-mono text-violet-light">0{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <SimComparison />
          </Block>
        )}

        {project.gallery && (
          <Block title={project.slug === "egg-farm-design" ? "The drawings and the numbers" : "Inside the prototype"}>
            <p>{project.slug === "egg-farm-design" ? "Concept and screening work. It shows how I size, dimension and test a design before spending money on it." : "Screens captured from the running prototype."}</p>
            <div className="grid gap-5">
              {project.gallery.map((g) => (
                <figure key={g.src} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <img src={g.src} alt={g.alt} loading="lazy" className="w-full" />
                  <figcaption className="border-t border-line bg-panel p-4 text-sm text-soft">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Block>
        )}

        {project.special === "qr-flow" && (
          <Block title="How the idea works">
            <p>A QR code can only hold so much. Treat it as a key rather than a container, and a few characters can open up a whole workflow.</p>
            <FlowDiagram />
          </Block>
        )}

        {project.special === "schema" && (
          <Block title="The data model">
            <p>The database is the heart of the product: 14 tables with row-level security on all of them.</p>
            <div className="flex flex-wrap gap-2">
              {schemaTables.map((t) => (
                <span key={t} className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-sm text-soft">
                  {t}
                </span>
              ))}
            </div>
          </Block>
        )}

        <Block title="My role">
          <p>{project.role}</p>
        </Block>

        <Block title="Built with">
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="rounded-full border border-violet-light/40 bg-violet/10 px-4 py-1.5 text-base">
                {t}
              </span>
            ))}
          </div>
        </Block>

        <Block title="What I have verified">
          <ul className="space-y-3">
            {project.verified.map((v) => (
              <li key={v} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
          {project.conceptual && project.conceptual.length > 0 && (
            <div className="rounded-2xl border border-dashed border-cream/40 bg-cream/5 p-5">
              <p className="mb-2 flex items-center gap-2 text-base font-semibold text-cream">
                <Lightbulb className="h-5 w-5" /> Explored, not claimed as finished
              </p>
              <ul className="list-disc space-y-1 pl-5 text-base text-soft">
                {project.conceptual.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </Block>

        {project.story && (
          <Block title="The interesting part">
            <p className="text-2xl font-medium leading-snug text-cream">{project.story}</p>
          </Block>
        )}

        {related.length > 0 && (
          <Block title="What this means for a business">
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((s) => (
                <Link key={s.slug} to="/services" className="group rounded-2xl border border-line bg-panel p-5 transition hover:border-violet-light/60">
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-base text-soft">{s.promise}</p>
                </Link>
              ))}
            </div>
          </Block>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/contact" className="group rounded-3xl bg-violet p-8 transition hover:bg-violet-light">
          <Note className="text-cream">Need something like this?</Note>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
            Start a conversation <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </p>
        </Link>
        <Link to={`/work/${next.slug}`} className="group rounded-3xl border border-line bg-panel p-8 transition hover:border-violet-light/60">
          <p className="text-sm text-soft">Next project</p>
          <p className="mt-1 text-2xl font-bold">{next.name}</p>
        </Link>
      </div>
    </article>
  );
};

export default CaseStudy;
