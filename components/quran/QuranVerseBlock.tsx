"use client";

import Link from "next/link";
import { useState } from "react";

import { AyahListenControls } from "@/components/AyahListenControls";
import { JournalTextarea } from "@/components/JournalTextarea";
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
}

export function QuranVerseBlock({ verse, surahNumber, playback, hasReflection, onReflected }: QuranVerseBlockProps) {
  const reflectHref = `/result?verseKey=${encodeURIComponent(verse.verseKey)}`;
  const contentKey = ayahKey(surahNumber, verse.verseNumber);
  const [journalOpen, setJournalOpen] = useState(false);

  return (
    <article
      id={`verse-${verse.verseKey.replace(":", "-")}`}
      className="scroll-mt-24 border-b border-[var(--border)] py-6 last:border-b-0"
    >
      <div className="flex gap-3">
        <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-xs font-semibold text-[var(--accent-primary)]">
          {verse.verseNumber}
        </span>
        <div className="min-w-0 flex-1">
          <p
            dir="rtl"
            lang="ar"
            className="font-scheherazade text-right text-[28px] leading-[2] text-[var(--text-arabic)]"
          >
            {verse.textUthmani}
          </p>
          {verse.translation ? (
            <p className="mt-2 text-left text-sm leading-relaxed text-[var(--text-secondary)]">
              {verse.translation}
            </p>
          ) : null}

          <AyahListenControls
            canPlay={playback.canPlay}
            isPlaying={playback.isPlaying}
            loading={playback.loading}
            progress={playback.progress}
            speed={playback.speed}
            reciterName={playback.reciterName}
            onPlay={playback.onPlay}
            onPause={playback.onPause}
            onSpeedToggle={playback.onSpeedToggle}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <SaveButton contentKey={contentKey} surah={surahNumber} ayahNumber={verse.verseNumber} compact />
            <button
              type="button"
              aria-expanded={journalOpen}
              onClick={() => setJournalOpen((open) => !open)}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                hasReflection
                  ? "bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20"
                  : "border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
              }`}
            >
              {hasReflection ? "✎ Your reflection" : "✎ Journal"}
            </button>
            <Link
              href={reflectHref}
              className="rounded-full bg-[var(--accent-primary)]/12 px-3 py-1 font-semibold text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/20"
            >
              ✦ Reflect
            </Link>
          </div>
          {journalOpen ? (
            <div className="mt-3">
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
        </div>
      </div>
    </article>
  );
}
