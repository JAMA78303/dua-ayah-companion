"use client";

import Link from "next/link";

import { AyahAudioPlayer } from "@/components/AyahAudioPlayer";
import type { ClipRange } from "@/lib/audio/clipPlayback";

export type DuaSourceType = "quranic" | "prophetic_sunnah";

export interface DuaSectionProps {
  dua_text: string;
  dua_transliteration: string | null;
  dua_translation: string;
  source_type: DuaSourceType;
  surah: number | null;
  ayah_number: number | null;
  hadith_source: string | null;
  /** The dua's ayah recitation, when the dua is this ayah. */
  duaAudio: ClipRange | null;
  duaVerseKey: string | null;
  reciterName: string;
  /** A Qur'anic dua quoted from another ayah: where it is from (links to that ayah). */
  citation?: { label: string; href: string } | null;
  compact?: boolean;
}

function hasTransliteration(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function ArabicDuaText({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <p
      dir="rtl"
      lang="ar"
      className={`font-scheherazade w-full text-right leading-[2] text-[var(--text-arabic)] ${
        compact ? "text-[20px] md:text-[22px]" : "text-[30px] leading-[1.8]"
      }`}
    >
      {text}
    </p>
  );
}

export function DuaSection({
  dua_text,
  dua_transliteration,
  dua_translation,
  source_type,
  duaAudio,
  duaVerseKey,
  reciterName,
  citation = null,
  compact = false,
}: DuaSectionProps) {
  const showAudio = source_type === "quranic" && Boolean(duaAudio && duaVerseKey);

  return (
    <section className="space-y-3">
      <h2
        className={
          compact
            ? "text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]"
            : "font-playfair text-lg font-semibold text-[var(--text-primary)]"
        }
      >
        {compact ? "A related supplication" : "Say this back"}
      </h2>

      <ArabicDuaText text={dua_text} compact={compact} />

      {hasTransliteration(dua_transliteration) ? (
        <p
          className="mb-1 mt-2 text-sm font-light italic leading-relaxed tracking-wide text-[var(--text-secondary)]"
          dir="ltr"
          lang="en"
        >
          {dua_transliteration.trim()}
        </p>
      ) : null}

      <p className="text-sm leading-relaxed text-[var(--text-primary)]">{dua_translation}</p>

      {citation ? (
        <Link href={citation.href} className="inline-block text-xs font-medium text-[var(--accent-primary)] hover:opacity-80">
          {`From ${citation.label} →`}
        </Link>
      ) : null}

      {showAudio ? (
        <AyahAudioPlayer
          clip={duaAudio}
          verseKey={duaVerseKey!}
          reciterName={reciterName}
        />
      ) : null}

      {source_type === "prophetic_sunnah" ? (
        <p className="mt-2 text-xs italic text-[var(--text-secondary)]">From the Sunnah of the Prophet ﷺ</p>
      ) : null}
    </section>
  );
}
