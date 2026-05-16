"use client";

import Link from "next/link";

import { AyahListenControls } from "@/components/AyahListenControls";
import { SaveButton } from "@/components/SaveButton";
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
  pairingId?: string | null;
  playback: QuranVersePlayback;
}

export function QuranVerseBlock({ verse, surahNumber, pairingId, playback }: QuranVerseBlockProps) {
  const reflectHref = `/result?verseKey=${encodeURIComponent(verse.verseKey)}`;
  const canSave = Boolean(pairingId);

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
            {canSave ? (
              <SaveButton pairingId={pairingId!} surah={surahNumber} ayahNumber={verse.verseNumber} />
            ) : (
              <span className="text-[var(--text-secondary)]" title="No curated pairing for this ayah yet">
                🔖 Save
              </span>
            )}
            <Link
              href={reflectHref}
              className="rounded-full bg-[var(--accent-primary)]/12 px-3 py-1 font-semibold text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/20"
            >
              ✦ Reflect
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
