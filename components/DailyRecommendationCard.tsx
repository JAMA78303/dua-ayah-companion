"use client";

import Link from "next/link";
import { Feather } from "lucide-react";
import { useEffect, useState } from "react";

import { verseRefLabel } from "@/lib/quran/verseRef";

interface DailyPairing {
  id: string;
  surah: number;
  ayah_number: number;
  translation: string;
  reflection_prompts?: string[] | null;
}

/** Today's reflection: a question to sit with, drawn from the day's ayah, opening that ayah. */
export function DailyRecommendationCard() {
  const [pairing, setPairing] = useState<DailyPairing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const response = await fetch(`/api/daily?date=${localDate}`);
        if (!response.ok) return;
        setPairing((await response.json()) as DailyPairing | null);
      } finally {
        setIsLoading(false);
      }
    }
    void run();
  }, []);

  if (isLoading) {
    return (
      <section className="card-elevated p-[18px]">
        <p className="text-xs text-[var(--text-secondary)]">Loading today&apos;s reflection...</p>
      </section>
    );
  }
  if (!pairing) return null;

  const prompt = pairing.reflection_prompts?.find((p) => p.trim()) ?? pairing.translation;

  return (
    <Link href={`/result?pairingId=${pairing.id}`} className="card-elevated block space-y-3.5 p-[18px] transition hover:border-[var(--accent-primary)]">
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">Today&apos;s reflection</span>
        <Feather className="size-[18px] text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
      </div>
      <p className="font-playfair text-[21px] leading-[1.4] text-[var(--text-primary)]">{prompt}</p>
      <p className="text-[11px] text-[var(--text-secondary)]">{`Inspired by ${verseRefLabel(`${pairing.surah}:${pairing.ayah_number}`)}`}</p>
    </Link>
  );
}
