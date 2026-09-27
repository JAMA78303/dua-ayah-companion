"use client";

import { ArabicAyahText } from "@/components/ArabicAyahText";
import { AyahAudioPlayer } from "@/components/AyahAudioPlayer";
import { DuaSection, type DuaSourceType } from "@/components/DuaSection";
import { useReciter } from "@/components/ReciterProvider";
import { JournalTextarea } from "@/components/JournalTextarea";
import { PropheticStorySection } from "@/components/PropheticStorySection";
import { ResonanceSurvey } from "@/components/ResonanceSurvey";
import { SaveButton } from "@/components/SaveButton";
import { SurahReferencePill } from "@/components/SurahReferencePill";
import { getSurahName } from "@/lib/quran/surahNames";
import { normalizeAudioUrl } from "@/lib/quranFoundation/fetchAudio";
import type { QfWord } from "@/lib/quranFoundation/fetchAyah";
import { toneGradientVar, type ToneTag } from "@/lib/theme/toneGradient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface AyahCardProps {
  pairingId: string;
  surah: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  tafsirSummary: string;
  reflectionPrompts: string[];
  propheticStory?: string | null;
  prophetName?: string | null;
  duaText: string;
  duaTransliteration?: string | null;
  duaTranslation: string;
  toneTag: ToneTag;
  sourceType?: string | null;
  hadithSource?: string | null;
  qfTafsirLong?: string | null;
  qfAudioUrl?: string | null;
  /** Word-by-word data for `arabicText`, when it's the Quran Foundation text. */
  qfWords?: QfWord[] | null;
  /** When true, pause QF recitation (e.g. feed card scrolled out of view). */
  shouldPauseAudio?: boolean;
  /** Prophets tab: show prophetic story expanded by default. */
  expandPropheticStory?: boolean;
}

interface RelatedDua {
  id: string;
  surah: number;
  ayah_number: number;
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
}

/** Quran.com word timing: [wordIndex (0-based), wordPosition, startMs, endMs]. */
type AudioSegment = [number, number, number, number];
interface VerseWord {
  transliteration?: { text?: string | null };
}

function normalizeComparableText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function AyahCard({
  pairingId,
  surah,
  ayahNumber,
  arabicText,
  translation,
  tafsirSummary,
  reflectionPrompts,
  propheticStory,
  prophetName,
  duaText,
  duaTransliteration,
  duaTranslation,
  toneTag,
  sourceType: sourceTypeProp,
  hadithSource,
  qfTafsirLong,
  qfAudioUrl,
  qfWords,
  shouldPauseAudio,
  expandPropheticStory = false,
}: AyahCardProps) {
  const sourceType: DuaSourceType =
    sourceTypeProp === "prophetic_sunnah" ? "prophetic_sunnah" : "quranic";
  const pauseAudio = shouldPauseAudio ?? false;
  const { reciterId, reciterName } = useReciter();
  const [clientAudioUrl, setClientAudioUrl] = useState<string | null>(qfAudioUrl ?? null);

  const duaVerseKey =
    sourceType === "quranic" && Number.isFinite(surah) && Number.isFinite(ayahNumber)
      ? `${surah}:${ayahNumber}`
      : null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/quran/${surah}/audio?reciterId=${reciterId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setClientAudioUrl(null);
          return;
        }
        const json = (await res.json()) as { audioByVerseKey?: Record<string, string> };
        const key = `${surah}:${ayahNumber}`;
        if (!cancelled) setClientAudioUrl(json.audioByVerseKey?.[key] ?? null);
      } catch {
        if (!cancelled) setClientAudioUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surah, ayahNumber, reciterId]);

  useEffect(() => {
    if (pauseAudio) return;
    window.dispatchEvent(new CustomEvent("qf-streak-refresh"));
  }, [pauseAudio, pairingId]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dua-app:core-loop-complete", "1");
    } catch {
      /* BUG-034: iOS banner gate — ignore storage failures */
    }
  }, [pairingId]);

  const surahPadded = String(surah).padStart(3, "0");
  const ayahPadded = String(ayahNumber).padStart(3, "0");
  const fallbackRecitationUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${ayahPadded}.mp3`;
  const [recitationUrl, setRecitationUrl] = useState(fallbackRecitationUrl);
  /** Word timings, tagged with the recording they belong to. */
  const [timedSegments, setTimedSegments] = useState<{ url: string; segments: AudioSegment[] } | null>(null);
  const [ayahTransliteration, setAyahTransliteration] = useState<string | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relatedDua, setRelatedDua] = useState<RelatedDua | null>(null);
  const reflectionAnchorId = `reflection-prompts-${pairingId}`;
  const quranComUrl = `https://quran.com/${surah}/${ayahNumber}`;
  const surahName = getSurahName(surah);
  // Real words, not space-separated tokens: pause marks are separate tokens in the text and would shift
  // the highlight by one after each mark.
  const totalWords = useMemo(
    () => qfWords?.length ?? arabicText.trim().split(/\s+/).filter(Boolean).length,
    [arabicText, qfWords],
  );
  const supplicationMatchesAyah =
    normalizeComparableText(duaText) === normalizeComparableText(arabicText);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchVerseSpecificRecitation() {
      try {
        // Same recording as the QF chapter audio for this reciter, plus word timings + transliteration.
        const response = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayahNumber}?audio=${reciterId}&words=true`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setRecitationUrl(fallbackRecitationUrl);
          setTimedSegments(null);
          setAyahTransliteration(null);
          return;
        }

        const payload = (await response.json()) as {
          verse?: { audio?: { url?: string; segments?: number[][] }; words?: VerseWord[] };
        };
        const audioPath = payload.verse?.audio?.url;
        const normalizedUrl = audioPath ? normalizeAudioUrl(audioPath) : fallbackRecitationUrl;
        setRecitationUrl(normalizedUrl);
        const rawSegments = payload.verse?.audio?.segments ?? [];
        const normalizedSegments = rawSegments.filter(
          (segment): segment is AudioSegment =>
            Array.isArray(segment) &&
            segment.length === 4 &&
            segment.every((value) => Number.isFinite(value)),
        );
        setTimedSegments(audioPath ? { url: normalizedUrl, segments: normalizedSegments } : null);

        const transliteration = (payload.verse?.words ?? [])
          .map((word) => word.transliteration?.text?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
        setAyahTransliteration(transliteration || null);
      } catch {
        setRecitationUrl(fallbackRecitationUrl);
        setTimedSegments(null);
        setAyahTransliteration(null);
      }
    }

    void fetchVerseSpecificRecitation();

    return () => controller.abort();
  }, [surah, ayahNumber, reciterId, fallbackRecitationUrl]);

  // One recording drives both players: QF chapter audio first, Quran.com verse audio as fallback.
  const playerAudioUrl = clientAudioUrl ?? recitationUrl;
  const duaAudioUrl = duaVerseKey ? playerAudioUrl : null;
  const audioSegments = timedSegments?.url === playerAudioUrl ? timedSegments.segments : [];

  useEffect(() => {
    if (!supplicationMatchesAyah) {
      queueMicrotask(() => setRelatedDua(null));
      return;
    }

    const controller = new AbortController();

    async function fetchRelatedDua() {
      try {
        const params = new URLSearchParams({
          excludePairingId: pairingId,
          excludeDuaText: duaText,
        });
        const response = await fetch(`/api/related-dua?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as RelatedDua | null;
        if (!payload?.id || !payload.dua_text) return;
        setRelatedDua(payload);
      } catch {
        // Keep the default message if no alternate supplication can be loaded.
      }
    }

    void fetchRelatedDua();

    return () => controller.abort();
  }, [supplicationMatchesAyah, pairingId, duaText]);

  const updateWordHighlight = (currentTime: number, duration: number) => {
    if (audioSegments.length > 0) {
      const currentTimeMs = currentTime * 1000;
      const segment = audioSegments.find(
        ([, , startMs, endMs]) => currentTimeMs >= startMs && currentTimeMs <= endMs,
      );
      if (segment) {
        const segmentWordIndex = Math.max(0, Math.min(segment[0], totalWords - 1));
        setActiveWordIndex(segmentWordIndex);
        return;
      }
    }

    if (!Number.isFinite(duration) || duration <= 0 || totalWords === 0) {
      setActiveWordIndex(null);
      return;
    }

    const progress = Math.min(Math.max(currentTime / duration, 0), 1);
    const nextWordIndex = Math.min(Math.floor(progress * totalWords), totalWords - 1);
    setActiveWordIndex(nextWordIndex);
  };

  const pillLabel =
    sourceType === "prophetic_sunnah"
      ? `From the Sunnah · ${hadithSource?.trim() || "Hadith"}`
      : `Surah ${surahName} · Ayah ${ayahNumber}`;

  return (
    <article
      className="card-elevated animate-card-enter space-y-6 overflow-hidden"
      style={{
        background: toneGradientVar(toneTag),
        boxShadow: "var(--card-shadow)",
      }}
    >
      <header className="px-5 pt-5 md:px-8 md:pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
          {toneTag}
        </p>
      </header>

      <div className="px-5 pb-2 pt-2 md:px-8">
        <div className="flex justify-center">
          <SurahReferencePill>{pillLabel}</SurahReferencePill>
        </div>
        <div className="min-w-0 pt-8 text-right">
          <ArabicAyahText text={arabicText} words={qfWords} activeWordIndex={isPlaying ? activeWordIndex : null} />
        </div>
        <hr className="gold-rule gold-rule-animate" aria-hidden />
        <p className="translation-text mx-auto max-w-prose text-center text-lg text-[var(--text-primary)] md:text-xl">
          {translation}
        </p>
      </div>

      <div className="space-y-6 px-5 pb-8 md:px-8">
      {ayahTransliteration ? (
        <p className="text-center text-sm italic text-[var(--text-secondary)]">{ayahTransliteration}</p>
      ) : null}

      <AyahAudioPlayer
        audioUrl={playerAudioUrl}
        verseKey={`${surah}:${ayahNumber}`}
        reciterName={reciterName}
        shouldPause={pauseAudio}
        onTimeUpdate={updateWordHighlight}
        onPlayingChange={(playing) => {
          setIsPlaying(playing);
          if (!playing) setActiveWordIndex(null);
        }}
      />

      <p className="text-xs text-[var(--text-secondary)]">
        <a
          href={quranComUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)]"
        >
          Open on Quran.com
        </a>
      </p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Tafsir Summary</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{tafsirSummary}</p>
        {qfTafsirLong?.trim() ? (
          <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
            <summary className="cursor-pointer text-sm font-medium text-[var(--accent-primary)]">
              Deeper tafsir
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
              {qfTafsirLong}
            </p>
          </details>
        ) : null}
      </section>

      <section id={reflectionAnchorId} className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Reflection Prompts</h2>
        <ul className="space-y-2">
          {reflectionPrompts.map((prompt) => (
            <li
              key={prompt}
              className="rounded-md border-l-4 border-[var(--accent-gold)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]"
            >
              {prompt}
            </li>
          ))}
        </ul>
      </section>

      {propheticStory?.trim() && prophetName ? (
        <PropheticStorySection
          prophetName={prophetName}
          story={propheticStory}
          defaultExpanded={expandPropheticStory}
        />
      ) : null}

      {supplicationMatchesAyah && relatedDua ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">A Related Supplication</h2>
          <Link
            href={`/result?pairingId=${relatedDua.id}`}
            className="block rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3 transition hover:border-[var(--accent-primary)]"
          >
            <p className="text-[var(--text-primary)]">{relatedDua.dua_text}</p>
            {relatedDua.dua_transliteration?.trim() ? (
              <p
                className="mb-1 mt-2 text-sm font-light leading-relaxed tracking-wide text-[var(--text-secondary)]"
                dir="ltr"
                lang="en"
              >
                {relatedDua.dua_transliteration.trim()}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{relatedDua.dua_translation}</p>
            <p className="mt-2 text-xs font-medium text-[var(--accent-primary)]">
              Surah {relatedDua.surah} ({getSurahName(relatedDua.surah)}), Ayah {relatedDua.ayah_number} — open
              reflection
            </p>
          </Link>
        </section>
      ) : null}
      {supplicationMatchesAyah && !relatedDua ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">A Related Supplication</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            This ayah is itself a Qur&apos;anic supplication. We&apos;re finding a different related dua.
          </p>
        </section>
      ) : null}
      {!supplicationMatchesAyah ? (
        <DuaSection
          dua_text={duaText}
          dua_transliteration={duaTransliteration ?? null}
          dua_translation={duaTranslation}
          source_type={sourceType}
          surah={surah}
          ayah_number={ayahNumber}
          hadith_source={hadithSource ?? null}
          duaAudioUrl={duaAudioUrl}
          duaVerseKey={duaVerseKey}
          reciterName={reciterName}
        />
      ) : null}

      <section className="space-y-3 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2">
          <SaveButton pairingId={pairingId} surah={surah} ayahNumber={ayahNumber} />
        </div>
        <ResonanceSurvey pairingId={pairingId} revealTargetId={reflectionAnchorId} />
        <JournalTextarea pairingId={pairingId} surah={surah} ayahNumber={ayahNumber} />
      </section>
      </div>
    </article>
  );
}
