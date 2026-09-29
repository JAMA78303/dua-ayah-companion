import { unstable_cache } from "next/cache";

import { DEFAULT_RECITER_ID, fetchVerseClip, type AyahClip } from "@/lib/quranFoundation/fetchAudio";
import { qfContentGet } from "@/lib/quranFoundation/client";

/**
 * Fetches a single verse from the Quran Foundation **content** API (QDC).
 * Docs reference (verse payload shape aligns with Quran.com-compatible JSON APIs):
 * https://api-docs.quran.foundation
 *
 * - fields=text_uthmani — the verse text is only returned when asked for
 * - translations=20 (Saheeh International; 131 is not served by QDC)
 * - tafsir 169 (Ibn Kathir, abridged) comes from its own endpoint, not an embedded `tafsirs` param
 * - audio comes from the per-chapter audio map (fetchAudio.ts)
 */
/** One word of the verse, for word-by-word meaning (the ayah-number marker is excluded). */
export type QfWord = {
  arabic: string;
  translit: string | null;
  meaning: string | null;
};

export type QfAyahBundle = {
  textUthmani: string | null;
  translation: string | null;
  /** The ayah's recitation for the reciter: its own file, or its part of a whole-surah file. */
  audio: AyahClip | null;
  tafsirText: string | null;
  /** Aligned with `textUthmani`'s words (pause marks stay attached to their word). */
  words: QfWord[] | null;
};

const TRANSLATION_ID = "20";
const TAFSIR_ID = 169;

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

const HTML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Plain text from QDC's HTML (tafsir paragraphs, translation footnote markers). Never rendered as HTML. */
function htmlToText(html: string): string {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<\/(p|h\d|div|li)>|<br\s*\/?>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== "#") return HTML_ENTITIES[code.toLowerCase()] ?? entity;
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : entity;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTranslation(payload: Record<string, unknown>): string | null {
  const verse = payload.verse as Record<string, unknown> | undefined;
  const direct = verse?.translations;
  if (Array.isArray(direct) && direct[0] && typeof direct[0] === "object") {
    const text = (direct[0] as { text?: unknown }).text;
    const s = pickString(typeof text === "string" ? htmlToText(text) : text);
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

type QfAyahText = Pick<QfAyahBundle, "textUthmani" | "translation" | "words">;

function extractWords(verse: Record<string, unknown> | undefined): QfWord[] | null {
  const words = verse?.words;
  if (!Array.isArray(words)) return null;
  const out = words
    .filter((w): w is Record<string, unknown> => Boolean(w) && typeof w === "object" && (w as { char_type_name?: unknown }).char_type_name === "word")
    .map((w) => ({
      arabic: pickString(w.text_uthmani) ?? "",
      translit: pickString((w.transliteration as { text?: unknown } | undefined)?.text),
      meaning: pickString((w.translation as { text?: unknown } | undefined)?.text),
    }))
    .filter((w) => w.arabic);
  return out.length ? out : null;
}

/** Throws on failure so `unstable_cache` never stores a failed lookup. */
async function fetchAyahTextUncached(surah: number, ayah: number): Promise<QfAyahText> {
  const verseKey = `${surah}:${ayah}`;
  const query = new URLSearchParams({
    fields: "text_uthmani",
    translations: TRANSLATION_ID,
    words: "true",
    word_fields: "text_uthmani",
    word_translation_language: "en",
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
  const translation = extractTranslation(payload);
  if (!textUthmani && !translation) throw new Error(`QF verse ${verseKey} returned no text`);

  return { textUthmani, translation, words: extractWords(verse) };
}

/** Tafsir covers a passage (several ayat); throws on failure so it isn't cached. */
async function fetchTafsirUncached(surah: number, ayah: number): Promise<string | null> {
  const verseKey = `${surah}:${ayah}`;
  const response = await qfContentGet(`/tafsirs/${TAFSIR_ID}/by_ayah/${verseKey}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`QF tafsir ${verseKey} failed: ${response.status}`);
  const payload = (await response.json()) as { tafsir?: { text?: unknown } };
  const html = pickString(payload.tafsir?.text);
  return html ? pickString(htmlToText(html)) : null;
}

// v3: adds word-by-word data (v2 entries have none; v1 had no text at all).
function cachedAyahText(surah: number, ayah: number) {
  return unstable_cache(async () => fetchAyahTextUncached(surah, ayah), ["qf-ayah-text-v3", String(surah), String(ayah)], {
    revalidate: 86_400,
  })();
}

/** Just the Arabic and translation (shares the text cache; no tafsir or audio lookups). */
export async function fetchAyahText(surah: number, ayah: number): Promise<{ textUthmani: string | null; translation: string | null } | null> {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) return null;
  try {
    const text = await cachedAyahText(surah, ayah);
    return text ? { textUthmani: text.textUthmani, translation: text.translation } : null;
  } catch {
    return null;
  }
}

export async function fetchAyahFromQF(
  surah: number,
  ayah: number,
  reciterId = DEFAULT_RECITER_ID,
): Promise<QfAyahBundle | null> {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  if (!Number.isInteger(ayah) || ayah < 1) return null;

  const cachedText = () => cachedAyahText(surah, ayah);
  const cachedTafsir = unstable_cache(
    async () => fetchTafsirUncached(surah, ayah),
    ["qf-ayah-tafsir", String(surah), String(ayah)],
    { revalidate: 86_400 },
  );

  // Audio has its own per-chapter cache (which skips failures), so keep it out of the 24h text cache.
  // Tafsir is optional: its failure must not hide the verse.
  const [text, tafsirText, audio] = await Promise.all([
    cachedText().catch(() => null),
    cachedTafsir().catch(() => null),
    fetchVerseClip(surah, ayah, reciterId).catch(() => null),
  ]);
  if (!text) return null;
  return { ...text, tafsirText, audio };
}
