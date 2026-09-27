import type { SupabaseClient } from "@supabase/supabase-js";

import { ADHKAR } from "@/lib/content/adhkar";
import { getNameOfAllah } from "@/lib/content/namesOfAllah";
import { getProphetStory } from "@/lib/content/prophetStories";
import { prophetEnglishLabel } from "@/lib/prophets/displayNames";
import { getSurahName } from "@/lib/quran/surahNames";
import { fetchAyahText } from "@/lib/quranFoundation/fetchAyah";
import { parseContentKey } from "@/lib/saves/contentKeys";
import type { SavedEntry } from "@/lib/saves/types";

interface PairingSummary {
  id: string;
  surah: number;
  ayah_number: number;
  dua_text: string;
  dua_translation: string;
  source_type: string | null;
  hadith_source: string | null;
  prophet_name: string | null;
}

const ADHKAR_TIME_LABEL = { morning: "Morning", evening: "Evening", both: "Morning & evening" } as const;

/**
 * Turn saved content keys into cards, in the order given. Keys whose content no longer exists
 * (a removed pairing, a renamed story) are left out.
 */
export async function resolveSavedEntries(keys: string[], supabase: SupabaseClient): Promise<SavedEntry[]> {
  const parsed = keys.map((key) => ({ key, content: parseContentKey(key) }));

  const pairingIds = parsed.flatMap(({ content }) => (content?.kind === "pairing" ? [content.pairingId] : []));
  const pairings = new Map<string, PairingSummary>();
  if (pairingIds.length > 0) {
    const { data } = await supabase
      .from("ayah_pairings")
      .select("id, surah, ayah_number, dua_text, dua_translation, source_type, hadith_source, prophet_name")
      .in("id", pairingIds);
    for (const row of (data ?? []) as PairingSummary[]) pairings.set(row.id, row);
  }

  const entries = await Promise.all(
    parsed.map(async ({ key, content }): Promise<SavedEntry | null> => {
      switch (content?.kind) {
        case "pairing": {
          const pairing = pairings.get(content.pairingId);
          if (!pairing) return null;
          return {
            key,
            group: "duas",
            eyebrow: pairing.prophet_name ? `Dua of ${prophetEnglishLabel(pairing.prophet_name)}` : "Dua",
            arabic: pairing.dua_text,
            body: pairing.dua_translation,
            source:
              pairing.source_type === "prophetic_sunnah" && pairing.hadith_source
                ? pairing.hadith_source
                : `${getSurahName(pairing.surah)} ${pairing.surah}:${pairing.ayah_number}`,
            href: `/result?pairingId=${pairing.id}`,
            surah: pairing.surah,
            ayahNumber: pairing.ayah_number,
          };
        }
        case "ayah": {
          const text = await fetchAyahText(content.surah, content.ayah);
          return {
            key,
            group: "ayat",
            eyebrow: `${getSurahName(content.surah)} ${content.surah}:${content.ayah}`,
            arabic: text?.textUthmani ?? undefined,
            body: text?.translation ?? "Open to read this ayah.",
            href: `/result?verseKey=${content.surah}:${content.ayah}`,
            surah: content.surah,
            ayahNumber: content.ayah,
          };
        }
        case "adhkar": {
          const dhikr = ADHKAR.find((item) => item.id === content.id);
          if (!dhikr) return null;
          return {
            key,
            group: "duas",
            eyebrow: `${ADHKAR_TIME_LABEL[dhikr.time]} adhkar`,
            title: dhikr.title,
            arabic: dhikr.arabic,
            body: dhikr.english,
            source: dhikr.refs
              ? dhikr.refs.map((ref) => `${getSurahName(Number(ref.split(":")[0]))} ${ref.replace("-", "–")}`).join(" · ")
              : "Hisn al-Muslim",
            href: `/adhkar?time=${dhikr.time === "evening" ? "evening" : "morning"}#${dhikr.id}`,
          };
        }
        case "name": {
          const name = getNameOfAllah(content.number);
          if (!name) return null;
          return {
            key,
            group: "names",
            eyebrow: `The Names of Allah · ${name.number} of 99`,
            title: `${name.transliteration} · ${name.meaning}`,
            arabic: name.arabic,
            body: name.dua,
            source: name.duaSource,
            href: `/names/${name.number}`,
          };
        }
        case "story": {
          const story = getProphetStory(content.slug);
          const chapter = story?.chapters[content.chapterIndex];
          if (!story || !chapter) return null;
          return {
            key,
            group: "stories",
            eyebrow: `${prophetEnglishLabel(story.name)} · Chapter ${content.chapterIndex + 1}`,
            title: chapter.title,
            body: chapter.body,
            href: `/stories/${story.slug}#chapter-${content.chapterIndex + 1}`,
          };
        }
        default:
          return null;
      }
    }),
  );
  return entries.filter((entry): entry is SavedEntry => entry !== null);
}
