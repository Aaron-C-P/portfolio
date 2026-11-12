/**
 * The band ad. Fill these in and the ad updates everywhere (Home banner and /band).
 * Anything left empty is simply not shown, so nothing here is invented.
 */
export const band = {
  name: "Aaron Prince's Band", // CHANGE: your real band name
  genre: "", // e.g. "Reggae, gospel and R&B"
  pitch: "Live music that fits your event, played properly.",
  members: [] as { name: string; role: string }[], // e.g. { name: "Aaron Prince", role: "Keys" }
  goodFor: ["Weddings", "Church services and events", "Parties and celebrations", "Corporate functions"],
  nextShow: "", // e.g. "Sat 5 Dec, 7pm, Mandeville Green" — leave empty if none
  links: [] as { label: string; href: string }[], // e.g. { label: "Listen on YouTube", href: "https://..." }
};
