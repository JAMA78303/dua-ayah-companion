import type { AyahClip } from "@/lib/quranFoundation/fetchAudio";

/** The part of a clip a player needs: which file, and where the ayah is in it. */
export type ClipRange = Pick<AyahClip, "url" | "startMs" | "endMs">;

/** Arabic letters; a token without any is a pause, section or sajdah mark. */
const ARABIC_LETTER = /[ء-يٱ-ۓۺ-ۿ]/;

/**
 * The words of an ayah's Uthmani text, numbered as the word timings number them: pause marks (ۖ ۗ ۚ …)
 * stay with the word before, and a mark that opens the ayah (۞) with the word after.
 */
export function quranWords(text: string): string[] {
  const words: string[] = [];
  let lead = "";
  for (const token of text.trim().split(/\s+/).filter(Boolean)) {
    if (ARABIC_LETTER.test(token)) {
      words.push(lead + token);
      lead = "";
    } else if (words.length > 0) {
      words[words.length - 1] += ` ${token}`;
    } else {
      lead += `${token} `;
    }
  }
  if (lead && words.length === 0) words.push(lead.trim());
  return words;
}

/**
 * Index (from 0) of the word being recited at `ms`: the last word to have begun, so the glow holds through
 * the short pauses between words. Null before the first word.
 */
export function recitedWordIndex(words: AyahClip["words"], ms: number, wordCount: number): number | null {
  let position: number | null = null;
  for (const [wordPosition, startMs] of words) {
    if (startMs <= ms) position = wordPosition;
    else break;
  }
  if (position === null || wordCount === 0) return null;
  return Math.min(Math.max(position - 1, 0), wordCount - 1);
}

/** How far through the ayah playback is, 0 to 1. */
export function clipProgress(clip: ClipRange, currentMs: number, fileDurationMs: number): number {
  const end = clip.endMs ?? fileDurationMs;
  if (!Number.isFinite(end) || end <= clip.startMs) return 0;
  return Math.min(Math.max((currentMs - clip.startMs) / (end - clip.startMs), 0), 1);
}

/**
 * Point the element at the clip. A different file is loaded starting at the ayah (a temporal media fragment,
 * so the surah's opening never plays first); the same file is just moved to the ayah. Returns the file loaded.
 */
export function cueClip(el: HTMLAudioElement, clip: ClipRange, loadedUrl: string | null): string {
  const startSeconds = clip.startMs / 1000;
  if (loadedUrl !== clip.url) {
    el.src = clip.startMs > 0 ? `${clip.url}#t=${startSeconds}` : clip.url;
    return clip.url;
  }
  if (Math.abs(el.currentTime - startSeconds) > 0.25) el.currentTime = startSeconds;
  return loadedUrl;
}

/** For browsers that ignore the media fragment: once the file's length is known, move to the ayah. */
export function settleAtClipStart(el: HTMLAudioElement, clip: ClipRange) {
  if (el.currentTime * 1000 < clip.startMs - 500) el.currentTime = clip.startMs / 1000;
}

/** Whether playback has reached the end of the ayah (a whole-surah file keeps going into the next one). */
export function reachedClipEnd(clip: ClipRange, currentMs: number): boolean {
  return clip.endMs !== null && currentMs >= clip.endMs;
}
