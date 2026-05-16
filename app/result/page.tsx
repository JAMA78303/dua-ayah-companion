import Link from "next/link";

import { AyahCard } from "@/components/AyahCard";
import {
  fetchPairingById,
  fetchPairingByVerseKey,
  fetchPairingsForCategory,
} from "@/lib/content/fetchPairings";
import { getSurahName } from "@/lib/quran/surahNames";
import { fetchAyahFromQF } from "@/lib/quranFoundation/fetchAyah";
import type { EmotionCategory } from "@/types/emotions";

interface ResultPageProps {
  searchParams: Promise<{ category?: string; pairingId?: string; verseKey?: string }>;
}

const VERSE_REFLECTION_PROMPTS = [
  "What is Allah saying to you in this ayah?",
  "How does this verse meet you where you are right now?",
  "What would it look like to carry this ayah with you today?",
];

const VALID_CATEGORIES: EmotionCategory[] = [
  "anxiety",
  "sadness",
  "gratitude",
  "guidance",
  "patience",
  "guilt",
  "grief",
  "hope",
  "forgiveness",
  "loneliness",
];

function isEmotionCategory(value: string): value is EmotionCategory {
  return VALID_CATEGORIES.includes(value as EmotionCategory);
}

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
          qfTafsirLong={qf?.tafsirText ?? null}
          qfAudioUrl={qf?.audioUrl ?? null}
        />
      </main>
    );
  }

  if (pairingId) {
    const pairing = await fetchPairingById(pairingId);
    if (!pairing) {
      return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
          <h1 className="text-xl font-semibold text-zinc-900">Reflection unavailable</h1>
          <p className="text-sm text-zinc-600">
            We could not load this reflection right now.
          </p>
          <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back to Home
          </Link>
        </main>
      );
    }

    const qf = await fetchAyahFromQF(pairing.surah, pairing.ayah_number);
    const arabicText = qf?.textUthmani ?? pairing.arabic_text;
    const translation = qf?.translation ?? pairing.translation;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
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
          qfTafsirLong={qf?.tafsirText ?? null}
          qfAudioUrl={qf?.audioUrl ?? null}
        />
      </main>
    );
  }

  if (!category || !isEmotionCategory(category)) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-zinc-900">Invalid category</h1>
        <p className="text-sm text-zinc-600">
          Please return home and choose a valid emotion category.
        </p>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          Back to Home
        </Link>
      </main>
    );
  }

  const pairing = await fetchPairingsForCategory(category);

  if (!pairing) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
        <h1 className="text-xl font-semibold text-zinc-900">No approved pairings yet</h1>
        <p className="text-sm text-zinc-600">
          We couldn&apos;t find approved content for this category yet. Please try another one.
        </p>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          Back to Home
        </Link>
      </main>
    );
  }

  const qf = await fetchAyahFromQF(pairing.surah, pairing.ayah_number);
  const arabicText = qf?.textUthmani ?? pairing.arabic_text;
  const translation = qf?.translation ?? pairing.translation;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
      <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
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
        qfTafsirLong={qf?.tafsirText ?? null}
        qfAudioUrl={qf?.audioUrl ?? null}
      />
    </main>
  );
}
