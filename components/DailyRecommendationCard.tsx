"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SurahReferencePill } from "@/components/SurahReferencePill";
import { getSurahName } from "@/lib/quran/surahNames";

interface DailyPairing {
  id: string;
  surah: number;
  ayah_number: number;
  arabic_text?: string | null;
  translation: string;
}

export function DailyRecommendationCard() {
  const [pairing, setPairing] = useState<DailyPairing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch("/api/daily");
        if (!response.ok) return;
        const json = (await response.json()) as DailyPairing | null;
        setPairing(json);
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, []);

  if (isLoading) {
    return (
      <section className="card-elevated p-6">
        <p className="text-xs text-[var(--text-secondary)]">Loading today&apos;s reflection...</p>
      </section>
    );
  }

  if (!pairing) {
    return null;
  }

  const surahName = getSurahName(pairing.surah);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <Link
      href={`/result?pairingId=${pairing.id}`}
      className="card-elevated block bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-primary)_8%,var(--card-bg))_0%,color-mix(in_srgb,var(--gold)_6%,var(--card-bg))_100%)] p-6 transition-opacity hover:opacity-[0.97]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-[var(--gold)]">✦ Today&apos;s Reflection</p>
        <time className="text-xs text-[var(--text-secondary)]" dateTime={new Date().toISOString().slice(0, 10)}>
          {dateLabel}
        </time>
      </div>

      <div className="mt-5 flex justify-center">
        <SurahReferencePill>
          Surah {surahName} · Ayah {pairing.ayah_number}
        </SurahReferencePill>
      </div>

      {pairing.arabic_text?.trim() ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-scheherazade mt-4 line-clamp-1 text-xl leading-relaxed text-[var(--text-arabic)]"
        >
          {pairing.arabic_text}
        </p>
      ) : null}

      <p className="font-playfair mt-3 line-clamp-2 text-sm italic leading-relaxed text-[var(--text-secondary)]">
        {pairing.translation}
      </p>

      <p className="mt-5 text-sm font-medium text-[var(--accent-primary)]">Begin your reflection →</p>
    </Link>
  );
}
