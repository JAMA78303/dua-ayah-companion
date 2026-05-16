"use client";

interface ArabicAyahTextProps {
  text: string;
  activeWordIndex?: number | null;
  className?: string;
}

export function ArabicAyahText({ text, activeWordIndex = null, className = "" }: ArabicAyahTextProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return (
    <p
      dir="rtl"
      lang="ar"
      className={`arabic-display text-[2rem] leading-[2.2] text-[var(--text-arabic)] md:text-[2.5rem] [text-shadow:0_0_30px_color-mix(in_srgb,var(--gold)_20%,transparent)] ${className}`}
    >
      {words.length > 0
        ? words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={
                activeWordIndex === index
                  ? "rounded bg-[var(--accent-gold)]/35 px-1 text-[var(--text-arabic)] transition-colors"
                  : "transition-colors"
              }
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          ))
        : text}
    </p>
  );
}
