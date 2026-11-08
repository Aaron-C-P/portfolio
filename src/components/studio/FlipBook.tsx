import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type FlipPage = { src: string; alt: string };

/** A simple page-turning book: pages are hinged on the left and swing over to reveal the next one. */
export const FlipBook = ({ pages, label }: { pages: FlipPage[]; label: string }) => {
  const [index, setIndex] = useState(0);
  const last = pages.length - 1;
  const go = (n: number) => setIndex(Math.min(last, Math.max(0, n)));

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      className="mx-auto w-full max-w-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-light"
    >
      <div className="relative aspect-[1275/1650] w-full" style={{ perspective: "1800px" }}>
        {pages.map((p, i) => {
          const turned = i < index;
          return (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              aria-hidden={i !== index}
              draggable={false}
              loading={i < 2 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full rounded-r-xl border border-line bg-white object-cover shadow-xl motion-reduce:transition-none"
              style={{
                transformOrigin: "left center",
                transform: `rotateY(${turned ? -180 : 0}deg)`,
                backfaceVisibility: "hidden",
                transition: "transform 0.8s cubic-bezier(0.4, 0.1, 0.2, 1)",
                zIndex: turned ? i : pages.length - i,
                pointerEvents: "none",
              }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous page"
          className="absolute inset-y-0 left-0 z-50 w-1/4 cursor-w-resize disabled:cursor-default"
        />
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Next page"
          className="absolute inset-y-0 right-0 z-50 w-3/4 cursor-e-resize disabled:cursor-default"
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous page"
          className="rounded-full border border-line p-2 text-violet-light transition hover:border-violet-light disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm text-soft" aria-live="polite">
          Page {index + 1} of {pages.length}
        </p>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Next page"
          className="rounded-full border border-line p-2 text-violet-light transition hover:border-violet-light disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
