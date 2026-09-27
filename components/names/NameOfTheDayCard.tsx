"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { nameOfTheDay, type NameOfAllah } from "@/lib/content/namesOfAllah";

/** Today's name by the viewer's local date — picked after mount so server and client render the same markup. */
export function NameOfTheDayCard() {
  const [name, setName] = useState<NameOfAllah | null>(null);

  useEffect(() => {
    queueMicrotask(() => setName(nameOfTheDay(new Date())));
  }, []);

  if (!name) {
    return (
      <section className="card-elevated p-6">
        <p className="text-xs text-[var(--text-secondary)]">Loading today&apos;s name...</p>
      </section>
    );
  }

  return (
    <Link
      href={`/names/${name.number}`}
      className="card-elevated block bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gold)_8%,var(--card-bg))_0%,color-mix(in_srgb,var(--accent-primary)_6%,var(--card-bg))_100%)] p-6 transition-opacity hover:opacity-[0.97]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-[var(--gold)]">✦ Name of the Day</p>
        <span className="text-xs text-[var(--text-secondary)]">{`${name.number} of 99`}</span>
      </div>

      <p dir="rtl" lang="ar" className="font-scheherazade mt-4 text-center text-4xl leading-relaxed text-[var(--text-arabic)]">
        {name.arabic}
      </p>
      <p className="mt-2 text-center font-playfair text-lg font-semibold text-[var(--text-primary)]">{name.transliteration}</p>
      <p className="text-center text-sm italic text-[var(--text-secondary)]">{name.meaning}</p>

      <div className="mt-5 space-y-3 text-sm leading-relaxed">
        <p className="line-clamp-3 text-[var(--text-primary)]">
          <span className="font-semibold text-[var(--accent-primary)]">Make it a dua · </span>
          {name.dua}
        </p>
        <p className="line-clamp-3 text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--accent-primary)]">Live it · </span>
          {name.live}
        </p>
      </div>

      <p className="mt-5 text-sm font-medium text-[var(--accent-primary)]">Reflect on this name →</p>
    </Link>
  );
}
