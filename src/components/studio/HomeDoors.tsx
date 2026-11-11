import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, GraduationCap, Rocket } from "lucide-react";

const doors = [
  { to: "/services#packages", Icon: Rocket, who: "I need a website or system", text: "Orders, bookings, dashboards or a clear site for your business.", cta: "Get a quote in 24 hours", tone: "bg-gradient-to-br from-violet to-[#3b1d99] text-white" },
  { to: "/#hiring", Icon: Briefcase, who: "I am hiring", text: "Résumé, skills and the work that backs them up.", cta: "See why hire Aaron", tone: "border border-violet-light/50 bg-panel" },
  { to: "/assignment-help", Icon: GraduationCap, who: "I need student help", text: "CSEC maths, SBAs and assignments, with guidance and feedback.", cta: "Get student help", tone: "border border-violet-light/50 bg-panel" },
];

/** The front door: three clear choices straight under the hero. */
export const HomeDoors = () => (
  <section aria-label="What do you need?" className="mx-auto max-w-6xl px-5 pt-10 md:pt-14">
    <h2 className="text-2xl font-extrabold md:text-4xl">What brings you here?</h2>
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {doors.map(({ to, Icon, who, text, cta, tone }) => (
        <Link key={to} to={to} className={`group flex flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-xl md:p-7 ${tone}`}>
          <Icon className="h-9 w-9" aria-hidden="true" />
          <span className="mt-4 text-2xl font-extrabold leading-tight">{who}</span>
          <span className="mt-2 opacity-85">{text}</span>
          <span className="mt-auto flex items-center gap-2 pt-5 text-base font-bold">
            {cta} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  </section>
);
