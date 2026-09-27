import { qfContentGet } from "@/lib/quranFoundation/client";

export const DEFAULT_RECITER_ID = 7;

const chapterAudioCache = new Map<string, Record<string, string>>();
const inflight = new Map<string, Promise<Record<string, string> | null>>();

function cacheKey(surahNumber: number, reciterId: number): string {
  return `audio-${surahNumber}-${reciterId}`;
}

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

/** Force HTTPS on every URL before storing. */
export function normalizeAudioUrl(url: string): string {
  const trimmed = url.trim().replace(/^http:\/\//i, "https://");
  if (trimmed.startsWith("https://")) return trimmed;
  return `https://verses.quran.com/${trimmed.replace(/^\/+/, "")}`;
}

function buildMapFromVerseEntries(
  files: unknown[],
  surahNumber: number,
): Record<string, string> | null {
  const map: Record<string, string> = {};
  const prefix = `${surahNumber}:`;

  for (const entry of files) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry as { verse_key?: unknown; url?: unknown; audio_url?: unknown };
    const verseKey = pickString(rec.verse_key);
    const rawUrl = pickString(rec.url) ?? pickString(rec.audio_url);
    if (!verseKey || !rawUrl || !verseKey.startsWith(prefix)) continue;
    map[verseKey] = normalizeAudioUrl(rawUrl);
  }

  return Object.keys(map).length > 0 ? map : null;
}

async function fetchFromReciterAudioFiles(
  surahNumber: number,
  reciterId: number,
): Promise<Record<string, string> | null> {
  const response = await qfContentGet(
    `/audio/reciters/${reciterId}/audio_files?chapter=${surahNumber}`,
    { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) return null;

  const payload = (await response.json()) as { audio_files?: unknown[] };
  const files = Array.isArray(payload.audio_files) ? payload.audio_files : [];
  return buildMapFromVerseEntries(files, surahNumber);
}

/** Ayah-by-ayah fallback when reciter audio_files returns chapter-level MP3 only. */
async function fetchFromQuranRecitations(
  surahNumber: number,
  reciterId: number,
): Promise<Record<string, string> | null> {
  const response = await qfContentGet(
    `/quran/recitations/${reciterId}?chapter=${surahNumber}`,
    { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) return null;

  const payload = (await response.json()) as { audio_files?: unknown[] };
  const files = Array.isArray(payload.audio_files) ? payload.audio_files : [];
  return buildMapFromVerseEntries(files, surahNumber);
}

async function fetchChapterAudioMapUncached(
  surahNumber: number,
  reciterId: number,
): Promise<Record<string, string> | null> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return null;
  }
  if (!Number.isInteger(reciterId) || reciterId < 1) {
    return null;
  }

  // Ayah-by-ayah URLs live on recitations; reciter audio_files is chapter-level only.
  const fromRecitations = await fetchFromQuranRecitations(surahNumber, reciterId).catch(() => null);
  if (fromRecitations) return fromRecitations;

  return fetchFromReciterAudioFiles(surahNumber, reciterId).catch(() => null);
}

/**
 * Per-chapter ayah audio URLs keyed by verse_key (e.g. "1:1").
 * Cached with compound key: audio-{surah}-{reciterId}.
 */
export async function fetchChapterAudioMap(
  surahNumber: number,
  reciterId = DEFAULT_RECITER_ID,
): Promise<Record<string, string> | null> {
  const key = cacheKey(surahNumber, reciterId);
  const cached = chapterAudioCache.get(key);
  if (cached) return cached;

  let pending = inflight.get(key);
  if (!pending) {
    // Only successful maps are cached; failures are retried on the next call.
    pending = fetchChapterAudioMapUncached(surahNumber, reciterId)
      .then((map) => {
        if (map) chapterAudioCache.set(key, map);
        return map;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }

  return pending;
}

export async function fetchVerseAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  reciterId = DEFAULT_RECITER_ID,
): Promise<string | null> {
  const map = await fetchChapterAudioMap(surahNumber, reciterId);
  if (!map) return null;
  return map[`${surahNumber}:${ayahNumber}`] ?? null;
}
