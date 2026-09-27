import { describe, expect, it } from "vitest";

import type { Pairing } from "@/lib/content/fetchPairings";
import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { buildMixedFeed } from "@/lib/feed/mixedFeed";

const pairings = Array.from({ length: 35 }, (_, i) => ({ id: `p${i}`, surah: 1, ayah_number: i + 1 }) as unknown as Pairing);
const chapterCount = PROPHET_STORIES.reduce((sum, story) => sum + story.chapters.length, 0);

describe("buildMixedFeed", () => {
  it("contains every pairing, story chapter and Name exactly once", () => {
    const feed = buildMixedFeed(123, pairings);
    expect(feed).toHaveLength(pairings.length + chapterCount + NAMES_OF_ALLAH.length);
    expect(new Set(feed.map((item) => item.id)).size).toBe(feed.length);
  });

  it("is deterministic for a seed and different across seeds", () => {
    const ids = (seed: number) => buildMixedFeed(seed, pairings).map((item) => item.id);
    expect(ids(42)).toEqual(ids(42));
    expect(ids(42)).not.toEqual(ids(43));
  });

  it("follows the ayah, story, ayah, Name rhythm while every pool has items", () => {
    const kinds = buildMixedFeed(7, pairings).slice(0, 40).map((item) => item.kind);
    for (let i = 0; i < kinds.length; i += 4) {
      expect(kinds.slice(i, i + 4)).toEqual(["pairing", "story", "pairing", "name"]);
    }
  });

  it("keeps each prophet's chapters in order", () => {
    const feed = buildMixedFeed(99, pairings);
    for (const story of PROPHET_STORIES) {
      const order = feed.flatMap((item) => (item.kind === "story" && item.slug === story.slug ? [item.chapterIndex] : []));
      expect(order).toEqual(story.chapters.map((_, i) => i));
    }
  });

  it("still works with no pairings (e.g. the database is unreachable)", () => {
    const feed = buildMixedFeed(1, []);
    expect(feed).toHaveLength(chapterCount + NAMES_OF_ALLAH.length);
  });
});
