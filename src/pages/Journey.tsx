import { motion } from "framer-motion";
import { GraduationCap, Rocket, Award, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { journey, type JourneyItem } from "@/data/site";

const icons: Record<JourneyItem["kind"], typeof Rocket> = {
  education: GraduationCap,
  project: Rocket,
  certification: Award,
  work: Briefcase,
};

const Journey = () => (
  <>
    <PageHeader
      eyebrow="Timeline"
      title="My Journey"
      intro="From the first lab assignments to production apps for real businesses."
    />
    <section className="py-16 px-6">
      <ol className="max-w-3xl mx-auto relative border-l-2 border-portfolio-accent/30 ml-4 md:ml-auto space-y-10">
        {journey.map((item, i) => {
          const Icon = icons[item.kind];
          return (
            <motion.li
              key={`${item.date}-${item.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.2) }}
              className="relative pl-8"
            >
              <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-portfolio-accent flex items-center justify-center">
                <Icon className="h-4 w-4 text-portfolio-accent" />
              </span>
              <span className="text-sm font-semibold text-portfolio-accent">{item.date}</span>
              <h2 className="text-xl font-bold mt-1">{item.title}</h2>
              <p className="text-sm text-slate-500 mb-2">{item.place}</p>
              <p className="text-slate-700">{item.text}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  </>
);

export default Journey;
