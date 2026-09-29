import { isValidAyahRef } from "@/lib/quran/verseCounts";

/**
 * What a save points at. Same format as the feed item ids and the review keys, and checked by
 * the database (migration 019).
 */
export type ParsedContentKey =
  | { kind: "pairing"; pairingId: string }
  | { kind: "ayah"; surah: number; ayah: number }
  | { kind: "adhkar"; id: string }
  | { kind: "name"; number: number }
  | { kind: "story"; slug: string; chapterIndex: number }
  | { kind: "sunnah"; id: string };

export const pairingKey = (pairingId: string) => `pairing:${pairingId}`;
export const ayahKey = (surah: number, ayah: number) => `ayah:${surah}:${ayah}`;
export const adhkarKey = (id: string) => `adhkar:${id}`;
export const nameKey = (number: number) => `name:${number}`;
export const storyKey = (slug: string, chapterIndex: number) => `story:${slug}:${chapterIndex}`;
export const sunnahKey = (id: string) => `sunnah:${id}`;

const PAIRING = /^pairing:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const AYAH = /^ayah:(\d{1,3}):(\d{1,3})$/;
const ADHKAR = /^adhkar:([a-z0-9-]{1,40})$/;
const NAME = /^name:(\d{1,2})$/;
const STORY = /^story:([a-z0-9-]{1,60}):(\d{1,2})$/;
const SUNNAH = /^sunnah:(\d{1,3}[a-z]?|jk\d{1,2})$/;

export function parseContentKey(key: string): ParsedContentKey | null {
  let match = PAIRING.exec(key);
  if (match) return { kind: "pairing", pairingId: match[1]! };
  match = AYAH.exec(key);
  if (match) {
    return isValidAyahRef(`${match[1]}:${match[2]}`) ? { kind: "ayah", surah: Number(match[1]), ayah: Number(match[2]) } : null;
  }
  match = ADHKAR.exec(key);
  if (match) return { kind: "adhkar", id: match[1]! };
  match = NAME.exec(key);
  if (match) {
    const number = Number(match[1]);
    return number >= 1 && number <= 99 ? { kind: "name", number } : null;
  }
  match = STORY.exec(key);
  if (match) return { kind: "story", slug: match[1]!, chapterIndex: Number(match[2]) };
  match = SUNNAH.exec(key);
  if (match) return { kind: "sunnah", id: match[1]! };
  return null;
}
