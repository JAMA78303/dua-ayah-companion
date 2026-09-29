/** Situations the Sunnah duas are grouped by (sunnah_duas.situation), in display order. */
export const SUNNAH_SITUATIONS = [
  { slug: "worry", title: "When you're worried or grieving" },
  { slug: "distress", title: "In distress" },
  { slug: "fear", title: "When you're afraid" },
  { slug: "hardship", title: "When things are hard" },
  { slug: "debt", title: "When you're in debt" },
  { slug: "illness", title: "When you're in pain or someone is ill" },
  { slug: "loss", title: "When tragedy strikes" },
  { slug: "deceased", title: "For those who have passed away" },
  { slug: "forgiveness", title: "Seeking forgiveness" },
  { slug: "asking", title: "When you're asking Allah for something" },
  { slug: "decision", title: "Before a decision (Istikharah)" },
  { slug: "doubt", title: "When doubts come" },
  { slug: "anger", title: "When you're angry" },
  { slug: "gratitude", title: "When good things happen" },
] as const;

export function situationTitle(slug: string): string {
  return SUNNAH_SITUATIONS.find((situation) => situation.slug === slug)?.title ?? "From the Sunnah";
}
