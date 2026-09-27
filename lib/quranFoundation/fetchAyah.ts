import { unstable_cache } from "next/cache";

import { DEFAULT_RECITER_ID, fetchVerseAudioUrl } from "@/lib/quranFoundation/fetchAudio";
import { qfContentGet } from "@/lib/quranFoundation/client";

/**
 * Fetches a single verse from the Quran Foundation **content** API (QDC).
 * Docs reference (verse payload shape aligns with Quran.com-compatible JSON APIs):
 * https://api-docs.quran.foundation
 *
 * Params per hackathon spec:
 * - translations=131 (Saheeh International)
 * - tafsirs=169 (Ibn Kathir English)
 * - audio=7 (Mishari al-Afasy)
 */
export type QfAyahBundle = {
  textUthmani: string | null;
  translation: string | null;
  audioUrl: string | null;
  tafsirText: string | null;
};

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function extractTranslation(payload: Record<string, unknown>): string | null {
  const verse = payload.verse as Record<string, unknown> | undefined;
  const direct = verse?.translations;
  if (Array.isArray(direct) && direct[0] && typeof direct[0] === "object") {
    const text = (direct[0] as { text?: unknown }).text;
    const s = pickString(text);
    if (s) return s;
  }
  const included = payload.included as unknown[] | undefined;
  if (Array.isArray(included)) {
    for (const item of included) {
      if (!item || typeof item !== "object") continue;
      const rec = item as { type?: unknown; text?: unknown };
      if (rec.type === "translation" || rec.type === "verse_translation") {
        const s = pickString(rec.text);
        if (s) return s;
      }
    }
  }
  return null;
}

function extractTafsir(payload: Record<string, unknown>): string | null {
  const verse = payload.verse as Record<string, unknown> | undefined;
  const direct = verse?.tafsirs;
  if (Array.isArray(direct) && direct[0] && typeof direct[0] === "object") {
    const text = (direct[0] as { text?: unknown }).text;
    const s = pickString(text);
    if (s) return s;
  }
  const included = payload.included as unknown[] | undefined;
  if (Array.isArray(included)) {
    for (const item of included) {
      if (!item || typeof item !== "object") continue;
      const rec = item as { type?: unknown; text?: unknown };
      if (rec.type === "tafsir") {
        const s = pickString(rec.text);
        if (s) return s;
      }
    }
  }
  return null;
}

type QfAyahText = Omit<QfAyahBundle, "audioUrl">;

/** Throws on failure so `unstable_cache` never stores a failed lookup. */
async function fetchAyahTextUncached(surah: number, ayah: number): Promise<QfAyahText> {
  const verseKey = `${surah}:${ayah}`;
  const query = new URLSearchParams({
    translations: "131",
    tafsirs: "169",
    audio: "7",
  });

  // QDC mirrors Quran.com-style verse routes; see QF API docs.
  const response = await qfContentGet(`/verses/by_key/${verseKey}?${query.toString()}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`QF verse ${verseKey} failed: ${response.status}`);
  const payload = (await response.json()) as Record<string, unknown>;
  const verse = payload.verse as Record<string, unknown> | undefined;
  const textUthmani = pickString(verse?.text_uthmani) ?? pickString(verse?.text_uthmani_simple) ?? null;

  return {
    textUthmani,
    translation: extractTranslation(payload),
    tafsirText: extractTafsir(payload),
  };
}

export async function fetchAyahFromQF(
  surah: number,
  ayah: number,
  reciterId = DEFAULT_RECITER_ID,
): Promise<QfAyahBundle | null> {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  if (!Number.isInteger(ayah) || ayah < 1) return null;

  const cachedText = unstable_cache(
    async () => fetchAyahTextUncached(surah, ayah),
    ["qf-ayah-text", String(surah), String(ayah)],
    { revalidate: 86_400 },
  );

  try {
    // Audio has its own per-chapter cache (which skips failures), so keep it out of the 24h text cache.
    const [text, audioUrl] = await Promise.all([
      cachedText(),
      fetchVerseAudioUrl(surah, ayah, reciterId),
    ]);
    return { ...text, audioUrl };
  } catch {
    return null;
  }
}
