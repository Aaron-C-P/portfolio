import { useState } from "react";
import { Play } from "lucide-react";
import { BrandAd } from "@/components/studio/BrandAd";
import { MovieIntro } from "@/components/studio/MovieIntro";
import { usePageTitle } from "@/components/studio/parts";

/** /watch: the opening film itself (it starts at once), with the 30-second ad underneath and a replay button, so the page is never empty. */
const Ad = () => {
  usePageTitle("Watch");
  const [plays, setPlays] = useState(0);
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <MovieIntro key={plays} force />
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-light">Watch</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">The intro film</h1>
      <p className="mt-3 max-w-2xl text-lg text-soft">A short film about what I build: services, content, technology and the live résumé studio.</p>
      <button onClick={() => setPlays((n) => n + 1)} className="btn-primary mt-5">
        <Play className="h-4 w-4" /> Play the intro film
      </button>
      <div className="mt-12">
        <BrandAd pageTitle />
      </div>
    </div>
  );
};

export default Ad;
