"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AyahAudioPlayer } from "@/components/AyahAudioPlayer";
import { DuaSection, type DuaSourceType } from "@/components/DuaSection";
import { useReciter } from "@/components/ReciterProvider";
import { SurahReferencePill } from "@/components/SurahReferencePill";
import type { Pairing } from "@/lib/content/fetchPairings";
import { getSurahName } from "@/lib/quran/surahNames";
import type { QfAyahBundle } from "@/lib/quranFoundation/fetchAyah";
import { toneGradientVar } from "@/lib/theme/toneGradient";

interface FeedCardProps {
  pairing: Pairing;
  index: number;
  total: number;
  isActive: boolean;
}

/**
 * Full-screen feed moment: sacred typography first; open `/result` for the full AyahCard experience.
 */
export function FeedCard({ pairing, index, total, isActive }: FeedCardProps) {
  const { reciterId, reciterName } = useReciter();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [qf, setQf] = useState<QfAyahBundle | null>(null);
  const [scrollHintVisible, setScrollHintVisible] = useState(index === 0);

  const sourceType: DuaSourceType =
    pairing.source_type === "prophetic_sunnah" ? "prophetic_sunnah" : "quranic";
  const duaVerseKey =
    sourceType === "quranic" && pairing.surah && pairing.ayah_number
      ? `${pairing.surah}:${pairing.ayah_number}`
      : null;

  useEffect(() => {
    if (!isActive && cardRef.current) {
      cardRef.current.dispatchEvent(new CustomEvent("feed-card-deactivated"));
    }
  }, [isActive]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const params = new URLSearchParams({
          surah: String(pairing.surah),
          ayah: String(pairing.ayah_number),
          reciterId: String(reciterId),
        });
        const response = await fetch(`/api/qf/ayah?${params.toString()}`, { cache: "force-cache" });
        if (!response.ok) return;
        const data = (await response.json()) as Partial<QfAyahBundle>;
        if (cancelled) return;
        if (data && (data.textUthmani || data.translation || data.audioUrl || data.tafsirText)) {
          setQf({
            textUthmani: data.textUthmani ?? null,
            translation: data.translation ?? null,
            audioUrl: data.audioUrl ?? null,
            tafsirText: data.tafsirText ?? null,
          });
        }
      } catch {
        /* DB pairing still renders */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pairing.surah, pairing.ayah_number, reciterId]);

  useEffect(() => {
    if (index !== 0) return;
    const timer = window.setTimeout(() => setScrollHintVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [index]);

  // The dua recitation is the same verse recording already fetched for this reciter.
  const duaAudioUrl = duaVerseKey ? (qf?.audioUrl ?? null) : null;
  const arabicText = qf?.textUthmani ?? pairing.arabic_text;
  const translation = qf?.translation ?? pairing.translation;
  const surahName = getSurahName(pairing.surah);
  const pillLabel =
    sourceType === "prophetic_sunnah"
      ? `From the Sunnah · ${pairing.hadith_source?.trim() || "Hadith"}`
      : `Surah ${surahName} · Ayah ${pairing.ayah_number}`;

  const toneDotClass =
    pairing.tone_tag === "comfort"
      ? "bg-teal-600"
      : pairing.tone_tag === "balance"
        ? "bg-gold-400"
        : "bg-rose-400";

  return (
    <div
      ref={cardRef}
      data-feed-card
      className="card-elevated animate-card-enter relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: toneGradientVar(pairing.tone_tag),
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="feed-geo-veil pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-8 pb-8 pt-6 md:px-10 md:pt-8">
        <p className="pointer-events-none absolute right-5 top-5 text-xs text-[var(--text-secondary)] md:right-8 md:top-7">
          {index + 1} of {total}
        </p>

        <div className="flex flex-[0_0_18%] flex-col items-center justify-end gap-3 pb-2">
          <SurahReferencePill>{pillLabel}</SurahReferencePill>
          <div className="flex items-center gap-2">
            <span className={`size-2 shrink-0 rounded-full ${toneDotClass}`} aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {pairing.tone_tag}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-[0_0_38%] flex-col justify-center px-2 py-2">
          <p
            dir="rtl"
            lang="ar"
            className="arabic-display text-center text-[36px] leading-[2.2] text-[var(--text-arabic)] md:text-[40px] [text-shadow:0_0_30px_color-mix(in_srgb,var(--gold)_20%,transparent)]"
          >
            {arabicText}
          </p>
          <hr className="gold-rule gold-rule-animate shrink-0 border-0" aria-hidden />
        </div>

        <div className="flex flex-[0_0_18%] flex-col items-center justify-start gap-2 px-2 pt-1">
          <p className="translation-text max-w-[85%] text-center text-[17px] text-[var(--text-primary)]">
            {translation}
          </p>
          {qf?.audioUrl ? (
            <AyahAudioPlayer
              audioUrl={qf.audioUrl}
              verseKey={`${pairing.surah}:${pairing.ayah_number}`}
              reciterName={reciterName}
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center justify-end gap-4 pt-4">
          <div className="w-full max-w-[85%]">
            <DuaSection
              dua_text={pairing.dua_text}
              dua_transliteration={pairing.dua_transliteration}
              dua_translation={pairing.dua_translation}
              source_type={sourceType}
              surah={pairing.surah}
              ayah_number={pairing.ayah_number}
              hadith_source={pairing.hadith_source ?? null}
              duaAudioUrl={duaAudioUrl}
              duaVerseKey={duaVerseKey}
              reciterName={reciterName}
              compact
            />
          </div>
          <Link
            href={`/result?pairingId=${pairing.id}`}
            className="text-sm font-medium text-[var(--accent-primary)] underline-offset-4 hover:underline"
          >
            Open full reflection
          </Link>

          {index === 0 && scrollHintVisible ? (
            <div className="feed-scroll-hint-hide flex flex-col items-center gap-1 text-xs text-[var(--text-secondary)]">
              <span>Next reflection ↓</span>
              <span className="animate-feed-hint-chevron inline-block text-base leading-none" aria-hidden>
                ⌄
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
