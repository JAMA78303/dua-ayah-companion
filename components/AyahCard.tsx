"use client";

import { ArabicAyahText } from "@/components/ArabicAyahText";
import { AyahAudioPlayer } from "@/components/AyahAudioPlayer";
import { DuaSection, type DuaSourceType } from "@/components/DuaSection";
import { useReciter } from "@/components/ReciterProvider";
import { JournalTextarea } from "@/components/JournalTextarea";
import { MemoriseSheet } from "@/components/memorise/MemoriseSheet";
import { PropheticStorySection } from "@/components/PropheticStorySection";
import { ResonanceSurvey } from "@/components/ResonanceSurvey";
import { SaveButton } from "@/components/SaveButton";
import { ShareSheet } from "@/components/share/ShareSheet";
import { SurahReferencePill } from "@/components/SurahReferencePill";
import { getSurahName } from "@/lib/quran/surahNames";
import { duaFromOtherAyah, verseRefHref, verseRefLabel } from "@/lib/quran/verseRef";
import { ayahKey, pairingKey } from "@/lib/saves/contentKeys";
import { isUuid } from "@/lib/uuid";
import { quranWords, recitedWordIndex } from "@/lib/audio/clipPlayback";
import { normalizeAudioUrl, type AyahClip } from "@/lib/quranFoundation/fetchAudio";
import type { QfWord } from "@/lib/quranFoundation/fetchAyah";
import { toneGradientVar, type ToneTag } from "@/lib/theme/toneGradient";
import type { EmotionCategory } from "@/types/emotions";
import Link from "next/link";
import { ArrowUpRight, Brain, ExternalLink, Share2 } from "lucide-react";
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
  /** Sets the card's colour. */
  toneTag: ToneTag;
  /** The feeling this ayah was chosen for, shown at the top; none for an ayah opened on its own. */
  feeling?: EmotionCategory | null;
  sourceType?: string | null;
  hadithSource?: string | null;
  /** Ayah the dua is quoted from, when not this one (pairing.dua_verse_key). */
  duaSourceKey?: string | null;
  qfTafsirLong?: string | null;
  /** The ayah's recitation for the default reciter, fetched with the page. */
  qfAudio?: AyahClip | null;
  /** Word-by-word data for `arabicText`, when it's the Quran Foundation text. */
  qfWords?: QfWord[] | null;
  /** When true, pause QF recitation (e.g. feed card scrolled out of view). */
  shouldPauseAudio?: boolean;
  /** Prophets tab: show prophetic story expanded by default. */
  expandPropheticStory?: boolean;
  /**
   * What the reflection box writes to. Defaults to the pairing (or the ayah, when there is none);
   * an ayah opened from the Qur'an reader passes its own key so it matches the reader's reflection.
   */
  journalContentKey?: string;
}

interface RelatedDua {
  id: string;
  surah: number;
  ayah_number: number;
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
  dua_verse_key?: string | null;
}

interface VerseWord {
  transliteration?: { text?: string | null };
}

/** Same text whether stored by the SQL editor (NFC) or served by the Qur'an API (marks in source order). */
function normalizeComparableText(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
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
  feeling,
  sourceType: sourceTypeProp,
  hadithSource,
  duaSourceKey,
  qfTafsirLong,
  qfAudio,
  qfWords,
  shouldPauseAudio,
  expandPropheticStory = false,
  journalContentKey,
}: AyahCardProps) {
  const sourceType: DuaSourceType =
    sourceTypeProp === "prophetic_sunnah" ? "prophetic_sunnah" : "quranic";
  const pauseAudio = shouldPauseAudio ?? false;
  const { reciterId, reciterName } = useReciter();
  /** This reciter's clip for the ayah, from our audio route (every reciter, with word timings). */
  const [reciterClip, setReciterClip] = useState<AyahClip | null>(qfAudio ?? null);

  // A dua quoted from another ayah is cited and linked; its audio lives on that ayah's page.
  const duaOtherAyah = sourceType === "quranic" ? duaFromOtherAyah(duaSourceKey, surah, ayahNumber) : null;
  const duaVerseKey =
    sourceType === "quranic" && !duaOtherAyah && Number.isFinite(surah) && Number.isFinite(ayahNumber)
      ? `${surah}:${ayahNumber}`
      : null;
  const duaCitation = duaOtherAyah ? { label: verseRefLabel(duaOtherAyah), href: verseRefHref(duaOtherAyah) } : null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/quran/${surah}/audio?reciterId=${reciterId}&verse=${ayahNumber}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setReciterClip(null);
          return;
        }
        const json = (await res.json()) as { clips?: Record<string, AyahClip> };
        const key = `${surah}:${ayahNumber}`;
        if (!cancelled) setReciterClip(json.clips?.[key] ?? null);
      } catch {
        if (!cancelled) setReciterClip(null);
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
  /** Fallback when our audio route has nothing: Quran.com's per-ayah file, with its word timings. */
  const [verseFileClip, setVerseFileClip] = useState<AyahClip | null>(null);
  const [ayahTransliteration, setAyahTransliteration] = useState<string | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relatedDua, setRelatedDua] = useState<RelatedDua | null>(null);
  const [memoriseOpen, setMemoriseOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const reflectionAnchorId = `reflection-prompts-${pairingId}`;
  const quranComUrl = `https://quran.com/${surah}/${ayahNumber}`;
  const surahName = getSurahName(surah);
  // Real words, not space-separated tokens: pause marks are separate tokens in the text and would shift
  // the highlight by one after each mark.
  const totalWords = useMemo(() => qfWords?.length ?? quranWords(arabicText).length, [arabicText, qfWords]);
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
          setVerseFileClip(null);
          setAyahTransliteration(null);
          return;
        }

        const payload = (await response.json()) as {
          verse?: { audio?: { url?: string; segments?: number[][] }; words?: VerseWord[] };
        };
        const audioPath = payload.verse?.audio?.url;
        // Quran.com's timings are [word index from 0, position, start, end]; ours are [position from 1, start, end].
        const words = (payload.verse?.audio?.segments ?? [])
          .map((segment) => segment.map(Number))
          .filter((segment) => segment.length === 4 && segment.every((value) => Number.isFinite(value)))
          .map(([index, , start, end]) => [index! + 1, start!, end!] as [number, number, number]);
        setVerseFileClip(audioPath ? { url: normalizeAudioUrl(audioPath), startMs: 0, endMs: null, words } : null);

        const transliteration = (payload.verse?.words ?? [])
          .map((word) => word.transliteration?.text?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
        setAyahTransliteration(transliteration || null);
      } catch {
        setVerseFileClip(null);
        setAyahTransliteration(null);
      }
    }

    void fetchVerseSpecificRecitation();

    return () => controller.abort();
  }, [surah, ayahNumber, reciterId]);

  // One recording drives every player on the card: this reciter's clip, Quran.com's per-ayah file, then
  // Mishari al-Afasy's as a last resort.
  const playerClip: AyahClip = reciterClip ??
    verseFileClip ?? { url: fallbackRecitationUrl, startMs: 0, endMs: null, words: [] };
  const duaClip = duaVerseKey ? playerClip : null;

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

  const updateWordHighlight = (positionMs: number, progress: number) => {
    if (playerClip.words.length > 0) {
      setActiveWordIndex(recitedWordIndex(playerClip.words, positionMs, totalWords));
      return;
    }
    // No word timings for this recording: move through the words evenly.
    setActiveWordIndex(totalWords > 0 ? Math.min(Math.floor(progress * totalWords), totalWords - 1) : null);
  };

  const pillLabel =
    sourceType === "prophetic_sunnah"
      ? `From the Sunnah · ${hadithSource?.trim() || "Hadith"}`
      : `Surah ${surahName} · Ayah ${ayahNumber}`;

  const shareTitle = `${surahName} ${surah}:${ayahNumber}`;
  const saveKey = isUuid(pairingId) ? pairingKey(pairingId) : ayahKey(surah, ayahNumber);
  const sectionTitle = "font-playfair text-[21px] font-semibold text-[var(--text-primary)]";

  return (
    <div className="animate-card-enter flex flex-col gap-4">
      {feeling ? (
        <header className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">Guidance for what you feel</p>
          <h1 className="font-playfair text-[30px] font-semibold capitalize text-[var(--text-primary)]">{`For ${feeling}`}</h1>
        </header>
      ) : null}

      <article className="card-elevated space-y-[18px] p-[22px]" style={{ background: toneGradientVar(toneTag) }}>
        <div className="flex items-start justify-between gap-3">
          <SurahReferencePill>{pillLabel}</SurahReferencePill>
          {feeling ? <span className="text-[10px] font-bold uppercase text-[var(--accent-primary)]">{feeling}</span> : null}
        </div>
        <div className="min-w-0 text-right">
          <ArabicAyahText text={arabicText} words={qfWords} activeWordIndex={isPlaying ? activeWordIndex : null} />
        </div>
        <p className="font-playfair text-lg leading-[1.5] text-[var(--text-primary)]">{translation}</p>
        <p className="text-[10px] text-[var(--text-secondary)]">Saheeh International</p>
        {ayahTransliteration ? <p className="text-xs italic leading-[1.55] text-[var(--text-secondary)]">{ayahTransliteration}</p> : null}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] font-bold text-[var(--text-secondary)]">
          <SaveButton contentKey={saveKey} surah={surah} ayahNumber={ayahNumber} compact />
          <button type="button" onClick={() => setShareOpen(true)} className="flex min-h-11 items-center gap-1.5 px-2 hover:text-[var(--text-primary)]">
            <Share2 className="size-4" strokeWidth={1.6} aria-hidden />
            Share
          </button>
          <Link href={`/quran/${surah}#verse-${surah}-${ayahNumber}`} className="flex min-h-11 items-center gap-1.5 px-2 hover:text-[var(--text-primary)]">
            <ArrowUpRight className="size-4" strokeWidth={1.6} aria-hidden />
            Open full
          </Link>
        </div>
      </article>
      {shareOpen ? (
        <ShareSheet
          card={{ eyebrow: shareTitle, arabic: arabicText, body: translation, footnote: "Saheeh International" }}
          href={`/result?verseKey=${surah}:${ayahNumber}`}
          title={shareTitle}
          text={translation}
          onClose={() => setShareOpen(false)}
        />
      ) : null}

      <section className="card-elevated p-3.5">
        <AyahAudioPlayer
          clip={playerClip}
          verseKey={`${surah}:${ayahNumber}`}
          reciterName={reciterName}
          shouldPause={pauseAudio}
          onTimeUpdate={updateWordHighlight}
          onPlayingChange={(playing) => {
            setIsPlaying(playing);
            if (!playing) setActiveWordIndex(null);
          }}
        />
      </section>

      <div className="flex gap-2">
        <a
          href={quranComUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] px-4 text-[13px] font-bold text-[var(--text-primary)]"
        >
          <ExternalLink className="size-[17px]" strokeWidth={1.6} aria-hidden />
          Quran.com
        </a>
        <button
          type="button"
          onClick={() => setMemoriseOpen(true)}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 text-[13px] font-bold text-[#0a0a0f]"
        >
          <Brain className="size-[17px]" strokeWidth={1.6} aria-hidden />
          Memorise
        </button>
      </div>
      {memoriseOpen ? (
        <MemoriseSheet
          title={`${surahName} ${surah}:${ayahNumber}`}
          words={qfWords?.map((word) => word.arabic) ?? quranWords(arabicText)}
          clip={playerClip}
          onClose={() => setMemoriseOpen(false)}
        />
      ) : null}

      <section className="card-elevated space-y-3.5 p-[18px]">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitle}>A little context</h2>
          {qfTafsirLong?.trim() ? (
            <button type="button" onClick={() => setTafsirOpen((open) => !open)} className="text-xs font-bold text-[var(--accent-primary)]" aria-expanded={tafsirOpen}>
              {tafsirOpen ? "Show less" : "Read more"}
            </button>
          ) : null}
        </div>
        <p className="text-[13px] leading-[1.6] text-[var(--text-primary)]">{tafsirSummary}</p>
        {tafsirOpen && qfTafsirLong?.trim() ? (
          <>
            <p className="whitespace-pre-wrap text-xs leading-[1.6] text-[var(--text-secondary)]">{qfTafsirLong}</p>
            <span className="inline-block rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">Tafsir Ibn Kathir · abridged</span>
          </>
        ) : null}
      </section>

      <section id={reflectionAnchorId} className="card-elevated space-y-3.5 p-[18px]">
        <h2 className={sectionTitle}>Sit with this</h2>
        <ol className="space-y-3">
          {reflectionPrompts.map((prompt, index) => (
            <li key={prompt} className="flex gap-2.5">
              <span className="font-playfair text-lg leading-none text-[var(--gold)]">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[13px] leading-[1.5] text-[var(--text-primary)]">{prompt}</span>
            </li>
          ))}
        </ol>
      </section>

      {propheticStory?.trim() && prophetName ? (
        <section className="card-elevated p-[18px]">
          <PropheticStorySection prophetName={prophetName} story={propheticStory} defaultExpanded={expandPropheticStory} />
        </section>
      ) : null}

      {supplicationMatchesAyah && relatedDua ? (
        <section className="card-elevated space-y-3 bg-[color-mix(in_srgb,var(--gold)_6%,var(--card-bg))] p-5">
          <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">A related supplication</h2>
          <Link href={`/result?pairingId=${relatedDua.id}`} className="block space-y-2">
            <p dir="rtl" lang="ar" className="font-scheherazade text-right text-[28px] leading-[1.8] text-[var(--text-arabic)]">
              {relatedDua.dua_text}
            </p>
            {relatedDua.dua_transliteration?.trim() ? (
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]" dir="ltr" lang="en">
                {relatedDua.dua_transliteration.trim()}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{relatedDua.dua_translation}</p>
            <p className="text-xs font-bold text-[var(--accent-primary)]">
              {duaFromOtherAyah(relatedDua.dua_verse_key, relatedDua.surah, relatedDua.ayah_number)
                ? `From ${verseRefLabel(relatedDua.dua_verse_key!)} — open reflection`
                : `${getSurahName(relatedDua.surah)} ${relatedDua.surah}:${relatedDua.ayah_number} — open reflection`}
            </p>
          </Link>
        </section>
      ) : null}
      {supplicationMatchesAyah && !relatedDua ? (
        <section className="card-elevated p-5">
          <p className="text-sm text-[var(--text-secondary)]">
            This ayah is itself a Qur&apos;anic supplication. We&apos;re finding a different related dua.
          </p>
        </section>
      ) : null}
      {!supplicationMatchesAyah ? (
        <section className="card-elevated bg-[color-mix(in_srgb,var(--gold)_6%,var(--card-bg))] p-5">
          <DuaSection
            dua_text={duaText}
            dua_transliteration={duaTransliteration ?? null}
            dua_translation={duaTranslation}
            source_type={sourceType}
            surah={surah}
            ayah_number={ayahNumber}
            hadith_source={hadithSource ?? null}
            duaAudio={duaClip}
            duaVerseKey={duaVerseKey}
            reciterName={reciterName}
            citation={duaCitation}
          />
        </section>
      ) : null}

      <section className="card-elevated space-y-3.5 p-[18px]">
        <ResonanceSurvey pairingId={pairingId} revealTargetId={reflectionAnchorId} />
        <JournalTextarea
          contentKey={journalContentKey ?? saveKey}
          surah={surah}
          ayahNumber={ayahNumber}
        />
      </section>
    </div>
  );
}
