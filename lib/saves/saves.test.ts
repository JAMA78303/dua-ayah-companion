import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/quranFoundation/fetchAyah", () => ({
  fetchAyahText: vi.fn(async (surah: number, ayah: number) =>
    surah === 2 && ayah === 255 ? { textUthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ", translation: "Allah - there is no deity except Him" } : null,
  ),
}));

import { ADHKAR } from "@/lib/content/adhkar";
import { NAMES_OF_ALLAH } from "@/lib/content/namesOfAllah";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { buildMixedFeed } from "@/lib/feed/mixedFeed";
import type { Pairing } from "@/lib/content/fetchPairings";
import { adhkarKey, ayahKey, nameKey, pairingKey, parseContentKey, storyKey, sunnahKey } from "@/lib/saves/contentKeys";
import { resolveSavedEntries } from "@/lib/saves/resolveSaved";

const PAIRING_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

describe("content keys", () => {
  it("round-trips every kind", () => {
    expect(parseContentKey(pairingKey(PAIRING_ID))).toEqual({ kind: "pairing", pairingId: PAIRING_ID });
    expect(parseContentKey(ayahKey(2, 255))).toEqual({ kind: "ayah", surah: 2, ayah: 255 });
    expect(parseContentKey(adhkarKey("hisn-77"))).toEqual({ kind: "adhkar", id: "hisn-77" });
    expect(parseContentKey(nameKey(99))).toEqual({ kind: "name", number: 99 });
    expect(parseContentKey(storyKey("yusuf", 3))).toEqual({ kind: "story", slug: "yusuf", chapterIndex: 3 });
    expect(parseContentKey(sunnahKey("218a"))).toEqual({ kind: "sunnah", id: "218a" });
    expect(parseContentKey(sunnahKey("jk2"))).toEqual({ kind: "sunnah", id: "jk2" });
  });

  it("rejects ayat that don't exist and other malformed keys", () => {
    for (const key of ["ayah:1:8", "ayah:115:1", "ayah:0:1", "name:0", "name:100", "pairing:p1", "adhkar:", "hello", ""]) {
      expect(parseContentKey(key)).toBeNull();
    }
  });

  it("covers every adhkar, Name and story chapter in the app", () => {
    for (const dhikr of ADHKAR) expect(parseContentKey(adhkarKey(dhikr.id))).not.toBeNull();
    for (const name of NAMES_OF_ALLAH) expect(parseContentKey(nameKey(name.number))).not.toBeNull();
    for (const story of PROPHET_STORIES) {
      story.chapters.forEach((_, index) => expect(parseContentKey(storyKey(story.slug, index))).not.toBeNull());
    }
  });

  it("uses the feed's own item ids for Names and stories", () => {
    const pairing = { id: PAIRING_ID, surah: 1, ayah_number: 1 } as unknown as Pairing;
    for (const item of buildMixedFeed(1, [pairing])) expect(parseContentKey(item.id)).not.toBeNull();
  });
});

describe("resolving saves for the Saved page", () => {
  const supabase = {
    from: () => ({
      select: () => ({
        in: async () => ({
          data: [
            {
              id: PAIRING_ID,
              surah: 3,
              ayah_number: 8,
              dua_text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا",
              dua_translation: "Our Lord, let not our hearts deviate",
              source_type: "quranic",
              hadith_source: null,
              prophet_name: null,
            },
          ],
        }),
      }),
    }),
  } as never;

  it("keeps the saved order, groups each kind and drops content that no longer exists", async () => {
    const entries = await resolveSavedEntries(
      [nameKey(1), adhkarKey("ayat-al-kursi"), ayahKey(2, 255), storyKey("yusuf", 0), pairingKey(PAIRING_ID), adhkarKey("gone"), storyKey("yusuf", 99)],
      supabase,
    );
    expect(entries.map((entry) => [entry.key, entry.group])).toEqual([
      ["name:1", "names"],
      ["adhkar:ayat-al-kursi", "duas"],
      ["ayah:2:255", "ayat"],
      ["story:yusuf:0", "stories"],
      [`pairing:${PAIRING_ID}`, "duas"],
    ]);
    expect(entries[2]).toMatchObject({ body: "Allah - there is no deity except Him", href: "/result?verseKey=2:255", surah: 2, ayahNumber: 255 });
    expect(entries[4]).toMatchObject({ source: "Ali 'Imran 3:8", href: `/result?pairingId=${PAIRING_ID}` });
    expect(entries[1]!.href).toBe("/adhkar?time=morning#ayat-al-kursi");
  });

  it("still lists an ayah when the Qur'an text can't be fetched", async () => {
    const [entry] = await resolveSavedEntries([ayahKey(1, 1)], supabase);
    expect(entry).toMatchObject({ group: "ayat", body: "Open to read this ayah.", href: "/result?verseKey=1:1" });
  });
});
