import { PageHeader } from "@/components/portfolio/PageHeader";
import { AICloneChat } from "@/components/portfolio/AICloneChat";

const Ask = () => (
  <>
    <PageHeader
      eyebrow="AI clone"
      title="Ask Aaron's AI"
      intro="A quick way to learn about my projects, stack and background."
      documentTitle="Ask AI"
    />
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <AICloneChat />
      </div>
    </section>
  </>
);

export default Ask;
