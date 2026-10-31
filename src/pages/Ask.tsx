import { AICloneChat } from "@/components/portfolio/AICloneChat";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";

const Ask = () => {
  usePageTitle("Ask my AI");
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32">
      <Reveal>
        <Note className="text-3xl">Ask my AI</Note>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">A quick way to get to know the work.</h1>
        <p className="mb-8 mt-4 text-lg text-soft">Ask about my projects, my stack or how to work together.</p>
      </Reveal>
      <AICloneChat />
    </div>
  );
};

export default Ask;
