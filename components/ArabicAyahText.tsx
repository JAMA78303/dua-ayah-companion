"use client";

import { useState } from "react";

import { RecitedArabic } from "@/components/RecitedArabic";
import type { QfWord } from "@/lib/quranFoundation/fetchAyah";

interface ArabicAyahTextProps {
  text: string;
  activeWordIndex?: number | null;
  className?: string;
  /** Word-by-word data aligned with `text`; when present, each word can be tapped for its meaning. */
  words?: QfWord[] | null;
}

/** A word tapped for its meaning. */
const SELECTED = "bg-[var(--accent-gold)]/35";

export function ArabicAyahText({ text, activeWordIndex = null, className = "", words = null }: ArabicAyahTextProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const textClass = `arabic-display text-[2rem] leading-[2.2] text-[var(--text-arabic)] md:text-[2.5rem] [text-shadow:0_0_30px_color-mix(in_srgb,var(--gold)_20%,transparent)] ${className}`;

  if (!words?.length) {
    return <RecitedArabic text={text} activeWordIndex={activeWordIndex} className={textClass} />;
  }

  const chosen = selected !== null ? words[selected] : undefined;

  return (
    <div className="space-y-3">
      <p dir="rtl" lang="ar" className={textClass}>
        {words.map((word, index) => (
          <span key={`${word.arabic}-${index}`}>
            <button
              type="button"
              onClick={() => setSelected(selected === index ? null : index)}
              aria-pressed={selected === index}
              aria-label={word.meaning ? `${word.arabic}: ${word.meaning}` : word.arabic}
              data-active={activeWordIndex === index}
              className={`recited-word cursor-pointer rounded hover:bg-[var(--accent-gold)]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                selected === index ? SELECTED : ""
              }`}
            >
              {word.arabic}
            </button>
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      {chosen ? (
        <div
          role="status"
          className="mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-left"
        >
          <span dir="rtl" lang="ar" className="font-scheherazade text-2xl text-[var(--text-arabic)]">
            {chosen.arabic}
          </span>
          <span className="min-w-0 flex-1">
            {chosen.translit ? <span className="block text-xs italic text-[var(--text-secondary)]">{chosen.translit}</span> : null}
            <span className="block text-sm font-medium text-[var(--text-primary)]">{chosen.meaning ?? "—"}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close word meaning"
            className="shrink-0 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-[var(--text-secondary)]">Tap any word for its meaning</p>
      )}
    </div>
  );
}
