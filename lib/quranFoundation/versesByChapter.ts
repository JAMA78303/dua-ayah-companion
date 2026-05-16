import { qfContentGet } from "@/lib/quranFoundation/client";

export interface QfVerse {
  id: number;
  verseKey: string;
  verseNumber: number;
  textUthmani: string;
  translation: string;
}

export interface QfVersesPage {
  verses: QfVerse[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function extractTextFromWords(verse: Record<string, unknown>): string | null {
  const words = verse.words;
  if (!Array.isArray(words)) return null;

  const parts: string[] = [];
  for (const item of words) {
    if (!item || typeof item !== "object") continue;
    const word = item as { char_type_name?: unknown; text_uthmani?: unknown; text?: unknown };
    if (word.char_type_name !== "word") continue;
    const segment = pickString(word.text_uthmani) ?? pickString(word.text);
    if (segment) parts.push(segment);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function extractTranslationFromWords(verse: Record<string, unknown>): string | null {
  const words = verse.words;
  if (!Array.isArray(words)) return null;

  const parts: string[] = [];
  for (const item of words) {
    if (!item || typeof item !== "object") continue;
    const word = item as { char_type_name?: unknown; translation?: unknown };
    if (word.char_type_name !== "word") continue;
    if (!word.translation || typeof word.translation !== "object") continue;
    const text = pickString((word.translation as { text?: unknown }).text);
    if (text) parts.push(text);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function extractTranslation(verse: Record<string, unknown>): string {
  const translations = verse.translations;
  if (Array.isArray(translations) && translations[0] && typeof translations[0] === "object") {
    const text = (translations[0] as { text?: unknown }).text;
    const s = pickString(text);
    if (s) return s;
  }
  return extractTranslationFromWords(verse) ?? "";
}

function normalizeVerse(raw: Record<string, unknown>): QfVerse | null {
  const verseKey = pickString(raw.verse_key) ?? pickString(raw.verseKey);
  if (!verseKey) return null;

  const ayahPart = verseKey.split(":")[1];
  const verseNumber = Number(ayahPart);
  if (!Number.isFinite(verseNumber)) return null;

  const textUthmani =
    pickString(raw.text_uthmani) ??
    pickString(raw.text_uthmani_simple) ??
    pickString(raw.text) ??
    extractTextFromWords(raw) ??
    "";

  const id = typeof raw.id === "number" ? raw.id : Number(raw.id ?? 0);

  return {
    id: Number.isFinite(id) ? id : verseNumber,
    verseKey,
    verseNumber,
    textUthmani,
    translation: extractTranslation(raw),
  };
}

export async function fetchQfVersesByChapter(
  surahNumber: number,
  page = 1,
): Promise<QfVersesPage | null> {
  const query = new URLSearchParams({
    language: "en",
    words: "true",
    translations: "131",
    word_fields: "text_uthmani,translation",
    translation_fields: "text",
    fields: "text_uthmani,translations",
    per_page: "50",
    page: String(page),
  });

  const response = await qfContentGet(`/verses/by_chapter/${surahNumber}?${query.toString()}`);
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    verses?: unknown[];
    pagination?: { current_page?: number; total_pages?: number };
  };

  const verses = (Array.isArray(payload.verses) ? payload.verses : [])
    .map((v) => (v && typeof v === "object" ? normalizeVerse(v as Record<string, unknown>) : null))
    .filter((v): v is QfVerse => v !== null);

  const currentPage = payload.pagination?.current_page ?? page;
  const totalPages = payload.pagination?.total_pages ?? 1;

  return {
    verses,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
  };
}
