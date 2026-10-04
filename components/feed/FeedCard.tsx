"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AyahAudioPlayer } from "@/components/AyahAudioPlayer";
import { DuaSection, type DuaSourceType } from "@/components/DuaSection";
import { FeedCardActions } from "@/components/feed/FeedCardActions";
import { RecitedArabic } from "@/components/RecitedArabic";
import { useReciter } from "@/components/ReciterProvider";
import { SurahReferencePill } from "@/components/SurahReferencePill";
import { quranWords, recitedWordIndex } from "@/lib/audio/clipPlayback";
import type { Pairing } from "@/lib/content/fetchPairings";
import { getSurahName } from "@/lib/quran/surahNames";
import { duaFromOtherAyah, verseRefHref, verseRefLabel } from "@/lib/quran/verseRef";
import { pairingKey } from "@/lib/saves/contentKeys";
import type { QfAyahBundle } from "@/lib/quranFoundation/fetchAyah";
import { toneGradientVar } from "@/lib/theme/toneGradient";

interface FeedCardProps {
  pairing: Pairing;
  index: number;
  /** Shown as "n of total" when the feed has a fixed length. */
  total?: number;
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
  /** The word being recited, which glows. */
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const sourceType: DuaSourceType =
    pairing.source_type === "prophetic_sunnah" ? "prophetic_sunnah" : "quranic";
  const duaOtherAyah =
    sourceType === "quranic" ? duaFromOtherAyah(pairing.dua_verse_key, pairing.surah, pairing.ayah_number) : null;
  const duaVerseKey =
    sourceType === "quranic" && !duaOtherAyah && pairing.surah && pairing.ayah_number
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
        // v=2: responses cached before ayah audio became clips have no `audio`.
        params.set("v", "2");
        const response = await fetch(`/api/qf/ayah?${params.toString()}`, { cache: "force-cache" });
        if (!response.ok) return;
        const data = (await response.json()) as Partial<QfAyahBundle>;
        if (cancelled) return;
        if (data && (data.textUthmani || data.translation || data.audio || data.tafsirText)) {
          setQf({
            textUthmani: data.textUthmani ?? null,
            translation: data.translation ?? null,
            audio: data.audio ?? null,
            tafsirText: data.tafsirText ?? null,
            words: data.words ?? null,
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

  const arabicText = qf?.textUthmani ?? pairing.arabic_text;
  const wordCount = useMemo(() => quranWords(arabicText).length, [arabicText]);
  const translation = qf?.translation ?? pairing.translation;
  const surahName = getSurahName(pairing.surah);
  const pillLabel =
    sourceType === "prophetic_sunnah"
      ? `From the Sunnah · ${pairing.hadith_source?.trim() || "Hadith"}`
      : `Surah ${surahName} · Ayah ${pairing.ayah_number}`;

  return (
    <div ref={cardRef} data-feed-card className="animate-card-enter relative flex min-h-0 flex-1 flex-col">
      {total ? (
        <p className="pointer-events-none absolute right-1 top-0 z-[2] text-xs text-[var(--text-secondary)]">
          {index + 1} of {total}
        </p>
      ) : null}

      {/* One full-screen moment per swipe; it scrolls inside only when a long pairing doesn't fit. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-auto py-2">
        {/* my-auto centres when it fits and top-aligns when it overflows (justify-center would clip the top). */}
        <div className="my-auto flex flex-col gap-3">
          <article className="card-elevated space-y-4 p-[18px]" style={{ background: toneGradientVar(pairing.tone_tag) }}>
            <div className="flex items-center justify-between gap-3">
              <SurahReferencePill>{pillLabel}</SurahReferencePill>
              {pairing.emotion_category ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-primary)]">{`For ${pairing.emotion_category}`}</span>
              ) : null}
            </div>

            <RecitedArabic
              text={arabicText}
              activeWordIndex={activeWordIndex}
              className="arabic-display text-right text-[clamp(26px,7vw,36px)] leading-[1.95] text-[var(--text-arabic)]"
            />
            <p className="font-playfair text-lg leading-[1.5] text-[var(--text-primary)]">{translation}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Saheeh International</p>

            {qf?.audio ? (
              <AyahAudioPlayer
                clip={qf.audio}
                verseKey={`${pairing.surah}:${pairing.ayah_number}`}
                reciterName={reciterName}
                onTimeUpdate={(positionMs) => setActiveWordIndex(recitedWordIndex(qf.audio!.words, positionMs, wordCount))}
                onPlayingChange={(playing) => {
                  if (!playing) setActiveWordIndex(null);
                }}
              />
            ) : null}

            <div className="border-t border-[var(--border)]">
              <FeedCardActions
                href={`/result?pairingId=${pairing.id}`}
                openLabel="Open full"
                shareTitle={pillLabel}
                shareText={`${translation} (${pillLabel})`}
                card={{ eyebrow: pillLabel, arabic: arabicText, body: translation }}
                save={{ contentKey: pairingKey(pairing.id), surah: pairing.surah, ayahNumber: pairing.ayah_number }}
              />
            </div>
          </article>

          <section className="card-elevated bg-[color-mix(in_srgb,var(--gold)_6%,var(--card-bg))] p-[18px]">
            <DuaSection
              dua_text={pairing.dua_text}
              dua_transliteration={pairing.dua_transliteration}
              dua_translation={pairing.dua_translation}
              source_type={sourceType}
              surah={pairing.surah}
              ayah_number={pairing.ayah_number}
              hadith_source={pairing.hadith_source ?? null}
              duaAudio={null}
              duaVerseKey={duaVerseKey}
              reciterName={reciterName}
              citation={duaOtherAyah ? { label: verseRefLabel(duaOtherAyah), href: verseRefHref(duaOtherAyah) } : null}
            />
          </section>
        </div>
      </div>

      {index === 0 && scrollHintVisible ? (
        <div className="feed-scroll-hint-hide pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-1 text-xs text-[var(--text-secondary)]">
          <span>Swipe up ↑</span>
        </div>
      ) : null}
    </div>
  );
}
