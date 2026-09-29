import Link from "next/link";

import { AyahCard } from "@/components/AyahCard";
import { SunnahDuaCard } from "@/components/duas/SunnahDuaCard";
import {
  fetchPairingById,
  fetchPairingByVerseKey,
  fetchPairingsForCategory,
} from "@/lib/content/fetchPairings";
import { fetchApprovedSunnahDuas, pickSunnahDuas } from "@/lib/content/sunnahDuas";
import { getSurahName } from "@/lib/quran/surahNames";
import { fetchAyahFromQF } from "@/lib/quranFoundation/fetchAyah";
import { ayahKey } from "@/lib/saves/contentKeys";
import { isEmotionCategory } from "@/types/emotions";

interface ResultPageProps {
  searchParams: Promise<{ category?: string; pairingId?: string; verseKey?: string }>;
}

const VERSE_REFLECTION_PROMPTS = [
  "What is Allah saying to you in this ayah?",
  "How does this verse meet you where you are right now?",
  "What would it look like to carry this ayah with you today?",
];

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const category = params.category;
  const pairingId = params.pairingId;
  const verseKey = params.verseKey;

  if (verseKey) {
    const parts = verseKey.split(":");
    const surah = Number(parts[0]);
    const ayahNumber = Number(parts[1]);

    if (!Number.isFinite(surah) || !Number.isFinite(ayahNumber)) {
      return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Invalid verse</h1>
          <Link href="/quran" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back to Qur&apos;an
          </Link>
        </main>
      );
    }

    const existing = await fetchPairingByVerseKey(verseKey);
    const qf = await fetchAyahFromQF(surah, ayahNumber);

    if (!existing && !qf?.textUthmani && !qf?.translation) {
      return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reflection unavailable</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            We could not load this ayah right now. Please try again shortly.
          </p>
          <Link href={`/quran/${surah}`} className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back to surah
          </Link>
        </main>
      );
    }

    const pairing = existing ?? {
      id: `verse-${surah}-${ayahNumber}`,
      surah,
      ayah_number: ayahNumber,
      arabic_text: qf?.textUthmani ?? "",
      translation: qf?.translation ?? "",
      tafsir_summary: qf?.tafsirText?.slice(0, 400) ?? `Reflect on ${getSurahName(surah)} ${ayahNumber}.`,
      reflection_prompts: VERSE_REFLECTION_PROMPTS,
      prophetic_story: null,
      prophet_name: null,
      tone_tag: "comfort" as const,
      dua_text: qf?.textUthmani ?? qf?.translation ?? "",
      dua_transliteration: null,
      dua_translation: qf?.translation ?? "",
    };

    const arabicText = qf?.textUthmani ?? pairing.arabic_text;
    const translation = qf?.translation ?? pairing.translation;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <Link href={`/quran/${surah}`} className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          ← Back to {getSurahName(surah)}
        </Link>
        <p className="text-xs text-[var(--text-secondary)]">
          Reflecting on {getSurahName(surah)} · Ayah {ayahNumber}
        </p>
        <AyahCard
          pairingId={pairing.id}
          surah={pairing.surah}
          ayahNumber={pairing.ayah_number}
          journalContentKey={ayahKey(surah, ayahNumber)}
          arabicText={arabicText}
          translation={translation}
          tafsirSummary={pairing.tafsir_summary}
          reflectionPrompts={pairing.reflection_prompts}
          propheticStory={pairing.prophetic_story}
          prophetName={pairing.prophet_name}
          duaText={pairing.dua_text}
          duaTransliteration={pairing.dua_transliteration}
          duaTranslation={pairing.dua_translation}
          toneTag={pairing.tone_tag}
          sourceType={pairing.source_type}
          hadithSource={pairing.hadith_source}
          duaSourceKey={existing?.dua_verse_key ?? null}
          qfTafsirLong={qf?.tafsirText ?? null}
          qfAudioUrl={qf?.audioUrl ?? null}
        qfWords={qf?.textUthmani ? qf.words : null}
        />
      </main>
    );
  }

  if (pairingId) {
    const pairing = await fetchPairingById(pairingId);
    if (!pairing) {
      return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reflection unavailable</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            We could not load this reflection right now.
          </p>
          <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back to Discover
          </Link>
        </main>
      );
    }

    const qf = await fetchAyahFromQF(pairing.surah, pairing.ayah_number);
    const arabicText = qf?.textUthmani ?? pairing.arabic_text;
    const translation = qf?.translation ?? pairing.translation;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          Back
        </Link>
        <AyahCard
          pairingId={pairing.id}
          surah={pairing.surah}
          ayahNumber={pairing.ayah_number}
          arabicText={arabicText}
          translation={translation}
          tafsirSummary={pairing.tafsir_summary}
          reflectionPrompts={pairing.reflection_prompts}
          propheticStory={pairing.prophetic_story}
          prophetName={pairing.prophet_name}
          duaText={pairing.dua_text}
          duaTransliteration={pairing.dua_transliteration}
          duaTranslation={pairing.dua_translation}
          toneTag={pairing.tone_tag}
          sourceType={pairing.source_type}
          hadithSource={pairing.hadith_source}
          duaSourceKey={pairing.dua_verse_key}
          qfTafsirLong={qf?.tafsirText ?? null}
          qfAudioUrl={qf?.audioUrl ?? null}
        qfWords={qf?.textUthmani ? qf.words : null}
        />
      </main>
    );
  }

  if (!category || !isEmotionCategory(category)) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Invalid category</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Please return home and choose a valid emotion category.
        </p>
        <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          Back to Discover
        </Link>
      </main>
    );
  }

  const [pairing, sunnahDuas] = await Promise.all([fetchPairingsForCategory(category), fetchApprovedSunnahDuas(category)]);

  if (!pairing && sunnahDuas.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Nothing here yet</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Ayat and duas for this feeling are still being reviewed. Please try another one for now.
        </p>
        <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          Back to Discover
        </Link>
      </main>
    );
  }

  const qf = pairing ? await fetchAyahFromQF(pairing.surah, pairing.ayah_number) : null;
  const shownDuas = pickSunnahDuas(sunnahDuas, 3);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
      <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
        Back
      </Link>
      {pairing ? (
      <AyahCard
        pairingId={pairing.id}
        surah={pairing.surah}
        ayahNumber={pairing.ayah_number}
        arabicText={qf?.textUthmani ?? pairing.arabic_text}
        translation={qf?.translation ?? pairing.translation}
        tafsirSummary={pairing.tafsir_summary}
        reflectionPrompts={pairing.reflection_prompts}
        propheticStory={pairing.prophetic_story}
        prophetName={pairing.prophet_name}
        duaText={pairing.dua_text}
        duaTransliteration={pairing.dua_transliteration}
        duaTranslation={pairing.dua_translation}
        toneTag={pairing.tone_tag}
        sourceType={pairing.source_type}
        hadithSource={pairing.hadith_source}
        duaSourceKey={pairing.dua_verse_key}
        qfTafsirLong={qf?.tafsirText ?? null}
        qfAudioUrl={qf?.audioUrl ?? null}
        qfWords={qf?.textUthmani ? qf.words : null}
      />
      ) : null}

      {shownDuas.length > 0 ? (
        <section aria-labelledby="sunnah-duas-heading" className="space-y-4">
          <h2 id="sunnah-duas-heading" className="font-playfair text-lg font-semibold text-[var(--text-primary)]">
            Duas from the Sunnah
          </h2>
          {shownDuas.map((dua) => (
            <SunnahDuaCard key={dua.id} dua={dua} showSituation />
          ))}
          {sunnahDuas.length > shownDuas.length ? (
            <Link href={`/duas?feeling=${category}`} className="block text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
              {`All ${sunnahDuas.length} duas for ${category} →`}
            </Link>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
