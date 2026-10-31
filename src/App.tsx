import Feed from "@/pages/Feed";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/studio/Layout";
import { usePageTitle } from "@/components/studio/parts";
import Home from "@/pages/Home";
import Work from "@/pages/Work";
import CaseStudy from "@/pages/CaseStudy";
import Journey from "@/pages/Journey";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Writing from "@/pages/Writing";
import Contact from "@/pages/Contact";
import Ask from "@/pages/Ask";

const NotFound = () => {
  usePageTitle("Page not found");
  return (
    <div className="mx-auto max-w-xl px-5 pb-32 pt-44 text-center">
      <h1 className="text-5xl font-extrabold">Lost?</h1>
      <p className="mt-4 text-soft">That page does not exist.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to the start
      </Link>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
