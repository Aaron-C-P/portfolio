import { Link } from "react-router-dom";
import { Calculator, FileSearch, Scale, Sigma } from "lucide-react";
import { TutorChat } from "@/components/studio/TutorChat";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const principles = [
  { Icon: FileSearch, title: "Grounded in notes", text: "It searches a library of study notes first, shows which notes matched and says when an answer is not from them." },
  { Icon: Sigma, title: "Maths that reads properly", text: "Equations, fractions and roots are typeset, not squashed into plain text, so each step is easy to follow." },
  { Icon: Calculator, title: "Three ways to learn", text: "Step by step for a worked solution, hints only to work it out yourself, or a quiz that marks as you go." },
  { Icon: Scale, title: "You do the graded work", text: "It coaches assignments and SBAs but will not write them for you. It admits uncertainty and sends you to your teacher for anything important." },
];

const Tutor = () => {
  usePageTitle("AI Tutor");
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32">
      <SectionHead
        page
        eyebrow="AI tutor"
        title="A tutor for any subject, with the working shown."
        intro="Ask about CSEC Mathematics, English, SBAs or anything you are studying. Pick how you want to learn and it will explain, show the steps and check your understanding."
      />

      <TutorChat />

      <section className="mt-14" aria-labelledby="how">
        <h2 id="how" className="font-hand text-4xl text-cream">
          How this tutor works
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {principles.map(({ Icon, title, text }) => (
            <Reveal key={title} className="rounded-2xl border border-line bg-panel p-5">
              <Icon className="h-5 w-5 text-violet-light" aria-hidden="true" />
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-sm text-soft">{text}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-soft">
          Want a real person alongside it? See my <Link to="/card" className="text-violet-light underline underline-offset-4">digital card</Link> for assignment, SBA and CSEC Mathematics help, or the{" "}
          <Link to="/assignment-help" className="text-violet-light underline underline-offset-4">assignment help guide</Link>.
        </p>
      </section>
    </div>
  );
};

export default Tutor;
