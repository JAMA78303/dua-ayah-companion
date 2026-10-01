"use client";

import { useEffect, useState } from "react";

import { hadithOfTheDay, type DailyHadith } from "@/lib/content/hadithOfTheDay";

/** Today's hadith by the viewer's local date — picked after mount so server and client render the same markup. */
export function HadithOfTheDayCard() {
  const [hadith, setHadith] = useState<DailyHadith | null>(null);

  useEffect(() => {
    queueMicrotask(() => setHadith(hadithOfTheDay(new Date())));
  }, []);

  if (!hadith) {
    return (
      <section className="card-elevated p-6">
        <p className="text-xs text-[var(--text-secondary)]">Loading today&apos;s hadith...</p>
      </section>
    );
  }

  return (
    <section className="card-elevated space-y-4 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-primary)_6%,var(--card-bg))_0%,color-mix(in_srgb,var(--gold)_8%,var(--card-bg))_100%)] p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--gold)]">✦ Hadith of the Day</p>
      <blockquote className="space-y-3">
        <p className="font-playfair text-lg leading-relaxed text-[var(--text-primary)]">{hadith.text}</p>
        <footer className="text-xs text-[var(--text-secondary)]">
          <a href={hadith.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            {hadith.source}
          </a>
          {hadith.grade ? ` · ${hadith.grade}` : null}
        </footer>
      </blockquote>
    </section>
  );
}
