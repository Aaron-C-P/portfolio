import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const kit = [
  "Plain white paper or a small sketchbook",
  "HB pencil and eraser",
  "Coloured pencils or crayons",
  "Fine-tip black marker",
  "Pink, red, green and yellow markers",
  "Child-safe scissors",
  "Glue stick",
  "A few sheets of coloured paper",
  "A small sheet of stickers",
  "A phone camera for photos",
];

const zones = [
  { n: 1, t: "Title", d: "Her own lettering on the page, such as \"My Pizza ...\". Bubble letters in marker, cut out and glued, or written straight onto the print." },
  { n: 2, t: "Name and class", d: "Handwritten in pencil, then gone over in fine black marker." },
  { n: 3, t: "Her whole pizza", d: "Drawn and coloured on plain paper, photographed, and placed in a tilted photo frame. Optional: a strip or two of real tape." },
  { n: 4, t: "Labelled slice", d: "One slice drawn big, with pencil pointer lines to the words crust, sauce, cheese and topping." },
  { n: 5, t: "Ingredients strip", d: "A tiny sketch and a handwritten name on a coloured-paper tag with wavy edges. Five tags: flour, tomato, cheese, basil and her choice." },
  { n: 6, t: "How we make pizza", d: "Four faint boxes: make the dough, spread the sauce, cheese and toppings, bake. She draws in each box and draws the arrows between them." },
  { n: 7, t: "Pizza words", d: "Four or five vocabulary words, each on a strip of coloured paper glued slightly crooked: dough, slice, topping, oven, knead." },
  { n: 8, t: "My favourite topping", d: "\"My favourite topping is ... because ...\" in her own words and her own spelling." },
  { n: 9, t: "Free corner", d: "Left empty on purpose: doodles, fingerprint olives or stickers. Her decision." },
];

const tools = [
  { tool: "Draw: Marker or Pen", use: "Optional. An arrow or underline added on screen with a finger or stylus.", keep: "Draw in quick strokes and lift. If you hold still at the end, Canva may tidy the stroke into a perfect shape. Undo if that happens." },
  { tool: "Draw: Highlighter", use: "A see-through yellow swipe behind a vocabulary word.", keep: "One swipe, slightly crooked. Do not redo it until it is straight." },
  { tool: "Draw: Eraser", use: "Removing a slip in an on-screen stroke.", keep: "Erase real mistakes only. Wobbles stay." },
  { tool: "Elements: search", use: "A background (try \"paper texture\", \"sketchbook paper\" or \"kraft paper\") and bits like \"washi tape\" or \"torn paper\".", keep: "One background and at most two tape pieces. Skip ready-made pizza clip art; her drawings are the pictures." },
  { tool: "Elements: Frames", use: "The square spot for the pizza photo.", keep: "Rotate the frame 2 to 4 degrees so it looks stuck on by hand." },
  { tool: "Shapes (thin, light grey)", use: "The four faint stage boxes and the writing lines.", keep: "Very light, so her pencil and marker sit on top and stand out." },
  { tool: "Uploads", use: "Photos of her pizza drawing, slice and tags.", keep: "No filters and no \"enhance\". The paper texture and pencil grain are the point." },
];

const sittings = [
  {
    when: "Sitting 1",
    who: "Grown-up, about 20 min",
    steps: [
      "In Canva, create an A4 document and add one soft paper-texture background.",
      "Add only the photo frame, the four faint stage boxes and the writing lines. Nothing else.",
      "Print two copies: one for practice, one for the real page. Decide together whether to draw straight onto the print (the most real) or draw separately and photograph.",
    ],
  },
  {
    when: "Sitting 2",
    who: "Your child, 45 to 60 min",
    steps: [
      "Warm up: copy the four-step pizza below on scrap paper once, then draw the real one on plain paper, about the size of a saucer.",
      "Colour with pencils or crayons, then outline with the fine black marker.",
      "Draw the big slice, add pencil arrows out to the sides and write the labels.",
      "Cut five tags and four or five strips from coloured paper with wavy edges. Sketch an ingredient on each tag and write its name; write one pizza word on each strip.",
      "On the printed page: write the title and name, draw a picture in each stage box, draw the arrows between them and write the favourite-topping sentence.",
    ],
  },
  {
    when: "Sitting 3",
    who: "Together, about 30 min",
    steps: [
      "Paper route: glue the pizza drawing, tags and strips onto the printed page, a little crooked, then add stickers, doodles or fingerprint olives in the free corner. That sheet is the project.",
      "Digital route: photograph the pizza and slice, upload them, drop them into the frame, print, then glue the paper tags and strips on top. If a digital copy is needed, photograph or scan the finished sheet.",
    ],
  },
];

const checklist = [
  "Every picture on the page was drawn by the child",
  "All captions are in their handwriting",
  "No clip art pizzas",
  "The free corner has something they chose",
  "They can explain each stage of making pizza in their own words",
];

const own = ["Which toppings, and how many", "Colours of the title letters and paper tags", "What goes in the free corner", "Their favourite topping and the reason", "Whether to add a face, steam lines or a pizza box"];

const wobble = "M16 77 C14 42 42 14 78 16 C112 18 136 44 135 74 C134 108 107 135 75 134 C41 133 17 109 16 77 Z";
const crust = "M28 76 C28 50 50 28 76 29 C102 30 123 51 122 75 C121 100 100 122 75 121 C50 120 29 100 28 76 Z";
const cheese = [
  "M50 52 C58 44 72 48 72 58 C72 68 58 70 52 64 C44 62 44 56 50 52 Z",
  "M86 70 C94 62 108 66 106 78 C104 88 92 90 86 84 C80 80 80 74 86 70 Z",
  "M48 88 C56 80 70 86 68 96 C66 104 54 106 48 100 C42 96 42 92 48 88 Z",
  "M80 98 C86 94 96 98 94 106 C92 112 84 112 80 108 C76 104 76 100 80 98 Z",
];

const Pen = ({ d, faint = false, w = 2.4 }: { d: string; faint?: boolean; w?: number }) => (
  <path d={d} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={faint ? 0.3 : 1} />
);

const pizzaSteps = [
  { label: "Big wobbly circle. Draw it lightly with the HB pencil, or trace round a plate.", art: <Pen d={wobble} /> },
  { label: "A second circle inside. The gap between them is the crust.", art: <><Pen d={wobble} faint /><Pen d={crust} /></> },
  { label: "Cheese is soft lumpy blobs. No two the same size.", art: <><Pen d={wobble} faint /><Pen d={crust} faint />{cheese.map((d) => <Pen key={d} d={d} w={2.2} />)}</> },
  {
    label: "Toppings and two slice lines. Then colour, and go over outlines in black marker last.",
    art: (
      <>
        <Pen d={wobble} faint />
        <Pen d={crust} faint />
        {cheese.slice(0, 3).map((d) => <Pen key={d} d={d} faint w={1.6} />)}
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <ellipse cx="92" cy="46" rx="9" ry="8" />
          <ellipse cx="44" cy="74" rx="8" ry="9" />
          <ellipse cx="100" cy="100" rx="8" ry="8" />
          <circle cx="72" cy="80" r="3.5" />
          <circle cx="62" cy="112" r="3.5" />
          <path d="M77 18 C76 50 78 100 75 133" />
          <path d="M17 76 C50 78 100 74 134 76" />
        </g>
      </>
    ),
  },
];

const ingredients = [
  { name: "tomato", how: "circle and star", art: <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="40" cy="40" r="24" /><path d="M40 18 L34 10 M40 18 L46 9 M40 18 L30 19 M40 18 L51 19" /></g> },
  { name: "cheese", how: "triangle and holes", art: <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M10 58 L70 58 L70 22 Z" /><circle cx="56" cy="46" r="4" /><circle cx="64" cy="34" r="2.5" /><circle cx="40" cy="52" r="2.5" /></g> },
  { name: "mushroom", how: "half circle and stem", art: <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M14 36 C14 12 66 12 66 36 Z" /><path d="M32 36 L30 60 C36 63 44 63 50 60 L48 36" /></g> },
  { name: "basil", how: "leaf and line", art: <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 50 C20 20 52 12 68 20 C62 46 34 60 12 50 Z" /><path d="M14 49 C30 40 48 30 66 21" /><path d="M8 56 L14 49" /></g> },
  { name: "pepperoni", how: "circle and dots (olive is a ring)", art: <g fill="none" stroke="currentColor" strokeWidth="2.2"><ellipse cx="30" cy="36" rx="20" ry="18" /><circle cx="24" cy="30" r="2" /><circle cx="36" cy="40" r="2" /><circle cx="26" cy="44" r="2" /><circle cx="64" cy="40" r="7" strokeWidth="4" /></g> },
  { name: "flour", how: "bag shape and fold", art: <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M20 64 L22 24 C28 16 52 16 58 24 L60 64 Z" /><path d="M23 24 C34 30 46 30 57 24" /></g> },
];

const AssignmentHelp = () => {
  usePageTitle("Assignment Help");
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <SectionHead
        page
        eyebrow="Assignment help"
        title="A handmade pizza project a parent and child can make together."
        intro="A practical guide for a school project that should look like a child made it with pencils, crayons, scissors and glue. The computer only lays out the page. The drawing, writing, cutting and gluing stay with the child."
      />

      <Reveal className="rounded-3xl border border-line bg-panel p-6 md:p-8">
        <h2 className="font-hand text-3xl text-violet-light">The craft kit</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {kit.map((k) => (
            <li key={k} className="flex gap-3 text-soft">
              <span aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 rounded border border-line" />
              {k}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-soft">Cheap swaps: printer paper for a sketchbook, old magazine pages or gift wrap for coloured paper, masking tape for washi tape.</p>
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-3xl border-2 border-dashed border-cream/60 p-6">
          <h2 className="font-hand text-3xl text-cream">The child does</h2>
          <p className="mt-3 text-soft">Title lettering, pizza and slice drawings, colouring, labels and arrows, ingredient tags, vocabulary strips, the favourite-topping sentence and the free corner.</p>
        </Reveal>
        <Reveal className="rounded-3xl border border-violet-light/50 p-6">
          <h2 className="font-hand text-3xl text-violet-light">The grown-up does</h2>
          <p className="mt-3 text-soft">The page set-up in Canva, printing, photographing the drawings, dropping photos into frames, and reading the spelling together. The child fixes it themselves.</p>
        </Reveal>
      </div>

      <section className="mt-16" aria-labelledby="zones">
        <h2 id="zones" className="font-hand text-4xl text-cream">Where everything goes on the page</h2>
        <p className="mt-2 max-w-2xl text-soft">One A4 portrait page with nine zones. Only the photo frame, the four faint stage boxes and the writing lines come from Canva. Everything else is made by hand.</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {zones.map((z) => (
            <Reveal key={z.n} className="rounded-2xl border border-line bg-panel p-5">
              <p className="font-hand text-2xl text-violet-light">
                {z.n} · {z.t}
              </p>
              <p className="mt-2 text-sm text-soft">{z.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="guides">
        <h2 id="guides" className="font-hand text-4xl text-cream">Copy the shapes, then make them yours</h2>
        <p className="mt-2 max-w-2xl text-soft">Dark line is what to draw now. Light line is what is already drawn. Wobbly lines are good: every pizza is a little lumpy.</p>

        <h3 className="mt-8 text-xl font-bold">A whole pizza in four steps</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pizzaSteps.map((s, i) => (
            <figure key={i} className="rounded-2xl border border-line bg-panel p-4 text-fg">
              <svg viewBox="0 0 150 150" className="mx-auto h-36 w-36" role="img" aria-label={`Step ${i + 1}`}>
                {s.art}
              </svg>
              <figcaption className="mt-2 text-sm text-soft">
                <b className="text-fg">{i + 1}.</b> {s.label}
              </figcaption>
            </figure>
          ))}
        </div>

        <h3 className="mt-10 text-xl font-bold">One big slice, labelled</h3>
        <figure className="mt-4 flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 text-fg sm:flex-row sm:items-center">
          <svg viewBox="0 0 150 120" className="h-40 w-48 shrink-0" role="img" aria-label="A slice with pencil arrows pointing to empty label spots">
            <Pen d="M30 30 C56 16 96 14 124 28 C108 60 92 90 78 112 C64 86 46 58 30 30 Z" />
            <Pen d="M36 42 C60 30 96 30 119 40" w={1.8} />
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6">
              <path d="M10 12 C18 18 26 24 34 32" />
              <path d="M28 32 L35 33 L34 26" />
              <path d="M148 78 C130 72 114 66 100 60" />
              <path d="M104 66 L99 60 L106 56" />
            </g>
          </svg>
          <figcaption className="text-soft">
            Draw a triangle with a bumpy top, add a crust line, cheese and toppings, then pencil arrows out to empty spots. Your child writes the words crust, sauce, cheese and topping. Arrowheads are two short lines, like a V on its side.
          </figcaption>
        </figure>

        <h3 className="mt-10 text-xl font-bold">Tiny ingredient sketches</h3>
        <p className="mt-1 text-sm text-soft">Each one is just two or three shapes.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ingredients.map((g) => (
            <figure key={g.name} className="rounded-2xl border border-line bg-panel p-3 text-center text-fg">
              <svg viewBox="0 0 80 70" className="mx-auto h-16 w-20" role="img" aria-label={`${g.name}: ${g.how}`}>
                {g.art}
              </svg>
              <figcaption>
                <span className="block font-hand text-2xl">{g.name}</span>
                <span className="block text-xs text-soft">{g.how}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-panel p-6">
            <h3 className="font-hand text-3xl text-violet-light">Colouring like a real crayon page</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-soft">
              <li>Press lightly first, darker on the second go.</li>
              <li>Colour in one direction. Little slanted strokes show.</li>
              <li>Leave tiny white gaps on cheese and tomato for shine.</li>
              <li>Two reds on the sauce, one light and one dark, look richer.</li>
              <li>Black marker outlines go on last, once colouring is done.</li>
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-dashed border-cream/60 p-6">
            <h3 className="font-hand text-3xl text-cream">Their choices, not on this sheet</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-soft">
              {own.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="steps">
        <h2 id="steps" className="font-hand text-4xl text-cream">Step by step, in three sittings</h2>
        <div className="mt-6 space-y-5">
          {sittings.map((s) => (
            <Reveal key={s.when} className="grid gap-4 rounded-3xl border border-line bg-panel p-6 md:grid-cols-[11rem_1fr]">
              <div>
                <p className="font-hand text-3xl text-violet-light">{s.when}</p>
                <p className="text-sm text-soft">{s.who}</p>
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-soft marker:font-bold marker:text-fg">
                {s.steps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="tools">
        <h2 id="tools" className="font-hand text-4xl text-cream">The Canva tools, and how to keep them handmade</h2>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-panel">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-fg">
                <th scope="col" className="p-4">Tool</th>
                <th scope="col" className="p-4">Use it for</th>
                <th scope="col" className="p-4">Keep it handmade</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.tool} className="border-b border-line/60 align-top last:border-0">
                  <th scope="row" className="p-4 font-bold text-fg">{t.tool}</th>
                  <td className="p-4 text-soft">{t.use}</td>
                  <td className="p-4 text-soft">{t.keep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-soft">
          Canva's Draw panel (Pen, Marker, Highlighter and Eraser, with colour, thickness and transparency) is in the editor's side panel, or under Apps by searching "Draw". It is not available in Canva Docs, so use an A4 document or print design. If Draw feels fiddly, skip on-screen drawing completely: everything can be done with paper, pencils and glue on the printed page.
        </p>
      </section>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel p-6">
          <h2 className="font-hand text-3xl text-violet-light">Photos that keep the pencil texture</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-soft">
            <li>Daylight by a window, no flash.</li>
            <li>Phone held flat, straight above the paper.</li>
            <li>Fill the screen with the drawing and crop the table out.</li>
            <li>A scanner app or the phone's document-scan mode flattens the page well.</li>
          </ul>
        </div>
        <div className="rounded-3xl border-2 border-dashed border-cream/60 p-6">
          <h2 className="font-hand text-3xl text-cream">Before it goes to school</h2>
          <ul className="mt-3 space-y-2 text-soft">
            {checklist.map((c) => (
              <li key={c} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 rounded border border-line" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHelp;
