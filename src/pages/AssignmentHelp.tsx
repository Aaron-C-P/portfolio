import { Mail, MessageCircle, Phone } from "lucide-react";
import { brand } from "@/data/studio";
import { offers } from "@/data/studentHelp";
import page01 from "@/assets/pizza/page-01.jpg";
import page02 from "@/assets/pizza/page-02.jpg";
import page03 from "@/assets/pizza/page-03.jpg";
import page04 from "@/assets/pizza/page-04.jpg";
import page05 from "@/assets/pizza/page-05.jpg";
import page06 from "@/assets/pizza/page-06.jpg";
import page07 from "@/assets/pizza/page-07.jpg";
import page08 from "@/assets/pizza/page-08.jpg";
import page09 from "@/assets/pizza/page-09.jpg";
import page10 from "@/assets/pizza/page-10.jpg";
import { FlipBook } from "@/components/studio/FlipBook";
import { TutorChat } from "@/components/studio/TutorChat";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const whatsapp = `https://wa.me/18767902268?text=${encodeURIComponent("Hi Aaron, I would like help with ")}`;
const action = "inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-panel px-5 py-3 text-sm font-medium transition hover:border-violet-light";

const pizzaPages = [
  { src: page01, alt: "Cover: The Great Pizza Adventure, a story of discovery one slice at a time" },
  { src: page02, alt: "Table of contents: What's on the menu" },
  { src: page03, alt: "Inside the Pizza Kitchen: finding a recipe book" },
  { src: page04, alt: "My Pizza Diagram: crust, cheese, toppings, tomato sauce and pepper labelled" },
  { src: page05, alt: "Making Pizza: four steps from dough to the oven, with an oven safety note" },
  { src: page06, alt: "Pizza Words to Know: a glossary and index" },
  { src: page07, alt: "Fun Pizza Facts about where pizza began and popular toppings" },
  { src: page08, alt: "My Favourite Pizza: a short write-up with a drawing" },
  { src: page09, alt: "The End: the pizza came out golden and cheesy" },
  { src: page10, alt: "Thanks for reading" },
];

const AssignmentHelp = () => {
  usePageTitle("Student Help");
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32">
      <SectionHead
        page
        eyebrow="Student help"
        title="Help with assignments, SBAs and CSEC Mathematics."
        intro="Send me what you need and I will take it from there. Or try the AI tutor below, any time of day."
      />

      <ul className="grid gap-4 md:grid-cols-3">
        {offers.map((o) => (
          <Reveal key={o.title} className="rounded-3xl border border-line bg-panel p-6">
            <h2 className="font-hand text-3xl text-violet-light">{o.title}</h2>
            <ul className="mt-4 space-y-2">
              {o.items.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-soft">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cream" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={action}>
          <MessageCircle className="h-4 w-4 text-violet-light" aria-hidden="true" /> WhatsApp
        </a>
        <a href={brand.phoneHref} className={action}>
          <Phone className="h-4 w-4 text-violet-light" aria-hidden="true" /> Call
        </a>
        <a href={`mailto:${brand.email}`} className={action}>
          <Mail className="h-4 w-4 text-violet-light" aria-hidden="true" /> Email
        </a>
      </div>

      <section className="mt-16" aria-labelledby="latest">
        <p className="font-hand text-2xl text-violet-light">Latest assignment help</p>
        <h2 id="latest" className="text-3xl font-extrabold tracking-tight md:text-4xl">
          The Great Pizza Adventure
        </h2>
        <p className="mb-8 mt-3 max-w-2xl text-soft">A ten-page pizza mini-book for a school project, with a labelled diagram, the steps of making pizza, a glossary, fun facts and a favourites page. Turn the pages below.</p>
        <FlipBook pages={pizzaPages} label="The Great Pizza Adventure flip book" />
      </section>

      <section className="mt-16" aria-labelledby="tutor">
        <h2 id="tutor" className="font-hand text-4xl text-cream">
          AI tutor
        </h2>
        <p className="mb-6 mt-2 max-w-2xl text-soft">Ask about any subject. It shows its working, tells you which notes it used and leaves the graded work to you.</p>
        <TutorChat />
      </section>
    </div>
  );
};

export default AssignmentHelp;
