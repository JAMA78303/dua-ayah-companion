import { qfContentGet } from "@/lib/quranFoundation/client";
import { VERSE_COUNTS } from "@/lib/quran/verseCounts";

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

/** Force HTTPS on every URL before storing; bare paths are on verses.quran.com. */
export function normalizeAudioUrl(url: string): string {
  const trimmed = url.trim().replace(/^http:\/\//i, "https://");
  if (trimmed.startsWith("https://")) return trimmed;
  // Protocol-relative ("//mirrors.quranicaudio.com/...", as Al-Husary's files are listed) is another host.
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
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


/**
 * One ayah's recitation: a file and where the ayah is in it. Most reciters' audio is one file per surah
 * with timings for every ayah and word; a few older recordings are one file per ayah.
 */
export interface AyahClip {
  url: string;
  /** Where the ayah starts in the file, in ms (0 for a file per ayah). */
  startMs: number;
  /** Where it ends, in ms, or null to play to the end of the file. */
  endMs: number | null;
  /** Word timings in ms from the start of the file: [word position from 1, start, end]. */
  words: [number, number, number][];
}

const finite = (value: unknown): number | null => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};

function parseWordTimings(segments: unknown): [number, number, number][] {
  if (!Array.isArray(segments)) return [];
  const words: [number, number, number][] = [];
  for (const segment of segments) {
    if (!Array.isArray(segment) || segment.length !== 3) continue;
    const [position, start, end] = segment.map(finite);
    if (position === null || start === null || end === null || position < 1 || end < start) continue;
    words.push([position, start, end]);
  }
  return words;
}

/**
 * Clips from a reciter's whole-surah file and its verse timings. Verses whose timing is missing or broken
 * (a few recordings have zero-length ones) are left out rather than played wrongly.
 */
export function clipsFromTimedChapter(payload: unknown, surahNumber: number): Record<string, AyahClip> | null {
  const file = (payload as { audio_files?: unknown[] } | null)?.audio_files?.[0] as
    | { audio_url?: unknown; verse_timings?: unknown[] }
    | undefined;
  const rawUrl = pickString(file?.audio_url);
  if (!rawUrl || !Array.isArray(file?.verse_timings)) return null;
  const url = normalizeAudioUrl(rawUrl);

  const clips: Record<string, AyahClip> = {};
  for (const timing of file.verse_timings) {
    const rec = timing as { verse_key?: unknown; timestamp_from?: unknown; timestamp_to?: unknown; segments?: unknown };
    const verseKey = pickString(rec?.verse_key);
    const startMs = finite(rec?.timestamp_from);
    const endMs = finite(rec?.timestamp_to);
    if (!verseKey?.startsWith(`${surahNumber}:`) || startMs === null || endMs === null || endMs <= startMs) continue;
    clips[verseKey] = { url, startMs, endMs, words: parseWordTimings(rec.segments) };
  }
  return Object.keys(clips).length > 0 ? clips : null;
}

async function fetchTimedChapter(surahNumber: number, reciterId: number): Promise<Record<string, AyahClip> | null> {
  const response = await qfContentGet(`/audio/reciters/${reciterId}/audio_files?chapter=${surahNumber}&segments=true`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  return clipsFromTimedChapter(await response.json(), surahNumber);
}

const clipsCache = new Map<string, Record<string, AyahClip>>();
const clipsInflight = new Map<string, Promise<Record<string, AyahClip> | null>>();

async function fetchChapterClipsUncached(surahNumber: number, reciterId: number): Promise<Record<string, AyahClip> | null> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) return null;
  if (!Number.isInteger(reciterId) || reciterId < 1) return null;

  const timed = await fetchTimedChapter(surahNumber, reciterId).catch(() => null);
  if (timed && Object.keys(timed).length === VERSE_COUNTS[surahNumber - 1]) return timed;

  const perAyah = await fetchChapterAudioMap(surahNumber, reciterId).catch(() => null);
  if (!timed && !perAyah) return null;

  // Timed clips first; a per-ayah file fills any verse the timings left out.
  const clips: Record<string, AyahClip> = {};
  for (const [verseKey, url] of Object.entries(perAyah ?? {})) clips[verseKey] = { url, startMs: 0, endMs: null, words: [] };
  Object.assign(clips, timed ?? {});
  return clips;
}

/**
 * Every ayah's clip in a surah for this reciter, keyed by verse_key ("2:255"). Cached per surah and reciter;
 * failures are retried on the next call.
 */
export async function fetchChapterClips(surahNumber: number, reciterId = DEFAULT_RECITER_ID): Promise<Record<string, AyahClip> | null> {
  const key = cacheKey(surahNumber, reciterId);
  const cached = clipsCache.get(key);
  if (cached) return cached;

  let pending = clipsInflight.get(key);
  if (!pending) {
    pending = fetchChapterClipsUncached(surahNumber, reciterId)
      .then((clips) => {
        if (clips) clipsCache.set(key, clips);
        return clips;
      })
      .finally(() => clipsInflight.delete(key));
    clipsInflight.set(key, pending);
  }
  return pending;
}

export async function fetchVerseClip(surahNumber: number, ayahNumber: number, reciterId = DEFAULT_RECITER_ID): Promise<AyahClip | null> {
  const clips = await fetchChapterClips(surahNumber, reciterId);
  return clips?.[`${surahNumber}:${ayahNumber}`] ?? null;
}
