import type { Pairing } from "@/lib/content/fetchPairings";
import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import type { FeedItem } from "@/lib/feed/types";

/** Card rhythm: ayah & dua, story chapter, ayah & dua, Name of Allah — then repeat. */
const RHYTHM: FeedItem["kind"][] = ["pairing", "story", "pairing", "name"];

/** Small deterministic PRNG so a session seed always produces the same order (stable pagination). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * The whole feed for one visit. Each pool is a permutation, so nothing repeats within a session;
 * a new seed gives a fresh order. Stories are serialised: prophets come in shuffled order, but each
 * prophet's chapters stay in sequence as they reappear down the feed.
 */
export function buildMixedFeed(seed: number, pairings: Pairing[]): FeedItem[] {
  const random = mulberry32(seed);

  const pools: { [K in FeedItem["kind"]]: FeedItem[] } = {
    pairing: shuffled(pairings, random).map((pairing) => ({ kind: "pairing", id: `pairing:${pairing.id}`, pairing })),
    story: shuffled(PROPHET_STORIES, random).flatMap((story) =>
      story.chapters.map((chapter, chapterIndex) => ({
        kind: "story" as const,
        id: `story:${story.slug}:${chapterIndex}`,
        slug: story.slug,
        prophetName: story.name,
        chapterIndex,
        chapterCount: story.chapters.length,
        chapter,
      })),
    ),
    name: shuffled(NAMES_OF_ALLAH, random).map((name) => ({ kind: "name", id: `name:${name.number}`, name })),
  };

  const feed: FeedItem[] = [];
  let step = 0;
  while (pools.pairing.length || pools.story.length || pools.name.length) {
    const kind = RHYTHM[step % RHYTHM.length]!;
    step++;
    const next = pools[kind].shift();
    if (next) feed.push(next);
  }
  return feed;
}
