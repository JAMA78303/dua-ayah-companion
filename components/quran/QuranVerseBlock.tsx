"use client";

import Link from "next/link";
import { NotebookPen, Pause, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";

import { JournalTextarea } from "@/components/JournalTextarea";
import { useRecitedWord } from "@/components/quran/recitationStore";
import { RecitedArabic } from "@/components/RecitedArabic";
import { SaveButton } from "@/components/SaveButton";
import { ayahKey } from "@/lib/saves/contentKeys";
import type { QfVerse } from "@/lib/quranFoundation/versesByChapter";

export interface QuranVersePlayback {
  canPlay: boolean;
  isPlaying: boolean;
  loading: boolean;
  progress: number;
  speed: number;
  reciterName: string;
  onPlay: () => void;
  onPause: () => void;
  onSpeedToggle: () => void;
}

interface QuranVerseBlockProps {
  verse: QfVerse;
  surahNumber: number;
  playback: QuranVersePlayback;
  /** The signed-in user has a journal reflection on this ayah. */
  hasReflection: boolean;
  onReflected: (contentKey: string) => void;
  /** This ayah is being recited: it glows, and so does the word being read. */
  isReciting: boolean;
}

export function QuranVerseBlock({ verse, surahNumber, playback, hasReflection, onReflected, isReciting }: QuranVerseBlockProps) {
  const recitedWord = useRecitedWord(verse.verseKey);
  const reflectHref = `/result?verseKey=${encodeURIComponent(verse.verseKey)}`;
  const contentKey = ayahKey(surahNumber, verse.verseNumber);
  const [journalOpen, setJournalOpen] = useState(false);

  const iconButton =
    "flex size-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--accent-primary)] disabled:opacity-40";

  return (
    <article
      id={`verse-${verse.verseKey.replace(":", "-")}`}
      data-active={isReciting}
      className="recited-ayah card-elevated scroll-mt-24 space-y-3 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--gold)]">
          {verse.verseKey}
        </span>
        <div className="flex items-center">
          {playback.canPlay ? (
            <button
              type="button"
              onClick={playback.isPlaying ? playback.onPause : playback.onPlay}
              disabled={playback.loading}
              aria-label={playback.isPlaying ? "Pause recitation" : "Play recitation"}
              className={`${iconButton} ${playback.isPlaying ? "text-[var(--accent-primary)]" : ""}`}
            >
              {playback.loading ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
              ) : playback.isPlaying ? (
                <Pause className="size-[18px]" strokeWidth={1.6} aria-hidden />
              ) : (
                <Volume2 className="size-[18px]" strokeWidth={1.6} aria-hidden />
              )}
            </button>
          ) : null}
          <SaveButton contentKey={contentKey} surah={surahNumber} ayahNumber={verse.verseNumber} icon />
          <button
            type="button"
            aria-expanded={journalOpen}
            aria-label={hasReflection ? "Your reflection" : "Journal on this ayah"}
            onClick={() => setJournalOpen((open) => !open)}
            className={`${iconButton} ${hasReflection ? "text-[var(--accent-primary)]" : ""}`}
          >
            <NotebookPen className="size-[18px]" strokeWidth={1.6} aria-hidden />
          </button>
          <Link href={reflectHref} aria-label="Reflect on this ayah" className={iconButton}>
            <Sparkles className="size-[18px]" strokeWidth={1.6} aria-hidden />
          </Link>
        </div>
      </div>

      <RecitedArabic
        text={verse.textUthmani}
        activeWordIndex={isReciting ? recitedWord : null}
        className="font-scheherazade text-right text-[30px] leading-[2] text-[var(--text-arabic)]"
      />
      {verse.translation ? (
        <p className="text-left text-sm leading-relaxed text-[var(--text-primary)]">{verse.translation}</p>
      ) : null}

      {journalOpen ? (
        <div className="rounded-[14px] bg-[var(--bg-subtle)] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">Your reflection · private</p>
          <JournalTextarea
            contentKey={contentKey}
            surah={surahNumber}
            ayahNumber={verse.verseNumber}
            onSavedChange={(saved) => {
              if (saved) onReflected(contentKey);
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
