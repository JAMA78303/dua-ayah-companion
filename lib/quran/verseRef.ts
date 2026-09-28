import { getSurahName } from "@/lib/quran/surahNames";

/** "Ta-Ha 20:25–26" for "20:25-26". */
export function verseRefLabel(verseKey: string): string {
  const [surah, ayat = ""] = verseKey.split(":");
  return `${getSurahName(Number(surah))} ${surah}:${ayat.replace("-", "–")}`;
}

/**
 * The ayah a pairing's Qur'anic dua is quoted from, when that isn't the pairing's own ayah
 * (`dua_verse_key`, migration 020). Null for older pairings, whose dua is their own ayah.
 */
export function duaFromOtherAyah(duaVerseKey: string | null | undefined, surah: number, ayahNumber: number): string | null {
  if (!duaVerseKey || duaVerseKey === `${surah}:${ayahNumber}`) return null;
  return duaVerseKey;
}

/** Link target for a verse key or range: the reflection page of its first ayah. */
export function verseRefHref(verseKey: string): string {
  return `/result?verseKey=${verseKey.split("-")[0]}`;
}
