import { useMemo } from "react";

import { quranWords } from "@/lib/audio/clipPlayback";

interface RecitedArabicProps {
  text: string;
  /** The word being recited (from 0), which glows; null when nothing is playing. */
  activeWordIndex: number | null;
  className?: string;
}

/** An ayah's Arabic, word by word, with the word being recited glowing. */
export function RecitedArabic({ text, activeWordIndex, className = "" }: RecitedArabicProps) {
  const words = useMemo(() => quranWords(text), [text]);
  return (
    <p dir="rtl" lang="ar" className={className}>
      {words.map((word, index) => (
        <span key={`${index}-${word}`}>
          <span className="recited-word" data-active={activeWordIndex === index}>
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
