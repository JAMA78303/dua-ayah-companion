export type SavedGroup = "duas" | "ayat" | "names" | "stories";

/** A saved item, ready to show on the Saved page. */
export interface SavedEntry {
  key: string;
  group: SavedGroup;
  eyebrow: string;
  title?: string;
  arabic?: string;
  body: string;
  source?: string;
  href: string;
  surah?: number;
  ayahNumber?: number;
}

export const SAVED_GROUPS: { group: SavedGroup; heading: string }[] = [
  { group: "duas", heading: "Duas & adhkar" },
  { group: "ayat", heading: "Ayat" },
  { group: "names", heading: "Names of Allah" },
  { group: "stories", heading: "Stories" },
];
