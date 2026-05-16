import { fetchChapterAudioMap } from "@/lib/quranFoundation/fetchAudio";

/**
 * Returns a single verse audio URL from the chapter audio cache (or fetches the chapter once).
 */
export async function getAudioUrl(
  surah: number,
  ayah: number,
  reciterId: number,
): Promise<string | null> {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  if (!Number.isInteger(ayah) || ayah < 1) return null;
  if (!Number.isInteger(reciterId) || reciterId < 1) return null;

  const map = await fetchChapterAudioMap(surah, reciterId);
  if (!map) return null;

  return map[`${surah}:${ayah}`] ?? null;
}
