import { qfContentGet } from "@/lib/quranFoundation/client";

export interface QfChapter {
  id: number;
  nameArabic: string;
  nameSimple: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah" | string;
}

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function normalizeChapter(raw: Record<string, unknown>): QfChapter | null {
  const id = typeof raw.id === "number" ? raw.id : Number(raw.id);
  if (!Number.isFinite(id) || id < 1) return null;

  const nameArabic =
    pickString(raw.name_arabic) ?? pickString(raw.name_arabic_v2) ?? pickString(raw.name_arabic_long) ?? "";
  const nameSimple = pickString(raw.name_simple) ?? pickString(raw.name_complex) ?? `Surah ${id}`;
  const versesCount =
    typeof raw.verses_count === "number" ? raw.verses_count : Number(raw.verses_count ?? 0);
  const revelationPlace = (pickString(raw.revelation_place) ?? "makkah").toLowerCase();

  return {
    id,
    nameArabic,
    nameSimple,
    versesCount: Number.isFinite(versesCount) ? versesCount : 0,
    revelationPlace,
  };
}

export async function fetchQfChapters(): Promise<QfChapter[]> {
  const response = await qfContentGet("/chapters?language=en");
  if (!response.ok) return [];

  const payload = (await response.json()) as { chapters?: unknown[] };
  const list = Array.isArray(payload.chapters) ? payload.chapters : [];

  return list
    .map((item) => (item && typeof item === "object" ? normalizeChapter(item as Record<string, unknown>) : null))
    .filter((c): c is QfChapter => c !== null)
    .sort((a, b) => a.id - b.id);
}
