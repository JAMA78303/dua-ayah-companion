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
    <section className="card-elevated flex h-full flex-col gap-3.5 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--gold)]">Hadith of the day</p>
      <blockquote className="flex flex-1 flex-col gap-3.5">
        <p className="font-playfair text-[15px] leading-[1.45] text-[var(--text-primary)]">{`“${hadith.text}”`}</p>
        <footer className="mt-auto">
          <a
            href={hadith.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            {hadith.source}
          </a>
          {hadith.grade ? <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">{hadith.grade}</span> : null}
        </footer>
      </blockquote>
    </section>
  );
}
