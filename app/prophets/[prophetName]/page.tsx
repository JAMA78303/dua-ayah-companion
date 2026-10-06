import Link from "next/link";
import { notFound } from "next/navigation";

import { AyahCard } from "@/components/AyahCard";
import { fetchPairingsForFigure } from "@/lib/content/fetchPairings";
import { getStoryByProphetName } from "@/lib/content/prophetStories";
import { fetchAyahFromQF } from "@/lib/quranFoundation/fetchAyah";
import { PageHeader } from "@/components/layout/PageHeader";
import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

export default async function ProphetDetailPage({
  params,
}: {
  params: Promise<{ prophetName: string }>;
}) {
  const { prophetName: raw } = await params;
  const figureName = decodeURIComponent(raw);
  const pairings = await fetchPairingsForFigure(figureName);

  if (!pairings.length) {
    notFound();
  }

  const enriched = await Promise.all(
    pairings.map(async (pairing) => {
      const qf = await fetchAyahFromQF(pairing.surah, pairing.ayah_number);
      return {
        pairing,
        arabicText: qf?.textUthmani ?? pairing.arabic_text,
        translation: qf?.translation ?? pairing.translation,
        qfTafsirLong: qf?.tafsirText ?? null,
        qfAudio: qf?.audio ?? null,
        qfWords: qf?.textUthmani ? qf.words : null,
      };
    }),
  );

  const isProphet = pairings.some((p) => p.prophet_name === figureName);
  const story = isProphet ? getStoryByProphetName(figureName) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader
        eyebrow={`${pairings.length} ${pairings.length === 1 ? "dua" : "duas"} in the Qur'an`}
        title={prophetEnglishLabel(figureName, isProphet)}
        back={{ href: "/prophets", label: "Duas of the Prophets" }}
      >
        <p dir="rtl" lang="ar" className="font-scheherazade text-right text-3xl text-[var(--text-arabic)]">
          {prophetArabicName(figureName)}
        </p>
        {story ? (
          <Link
            href={`/stories/${story.slug}`}
            className="inline-flex min-h-9 items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] px-4 text-xs font-bold text-[var(--text-primary)]"
          >
            {`Read the story of ${prophetEnglishLabel(figureName)}`}
          </Link>
        ) : null}
      </PageHeader>

      {enriched.map(({ pairing, arabicText, translation, qfTafsirLong, qfAudio, qfWords }) => (
        <AyahCard
          key={pairing.id}
          pairingId={pairing.id}
          surah={pairing.surah}
          ayahNumber={pairing.ayah_number}
          arabicText={arabicText}
          translation={translation}
          tafsirSummary={pairing.tafsir_summary}
          reflectionPrompts={pairing.reflection_prompts}
          propheticStory={pairing.prophetic_story}
          prophetName={pairing.prophet_name ?? figureName}
          duaText={pairing.dua_text}
          duaTransliteration={pairing.dua_transliteration}
          duaTranslation={pairing.dua_translation}
          toneTag={pairing.tone_tag}
          feeling={pairing.emotion_category ?? null}
          sourceType={pairing.source_type}
          hadithSource={pairing.hadith_source}
          duaSourceKey={pairing.dua_verse_key}
          qfTafsirLong={qfTafsirLong}
          qfAudio={qfAudio}
          qfWords={qfWords}
          expandPropheticStory
        />
      ))}
    </main>
  );
}
