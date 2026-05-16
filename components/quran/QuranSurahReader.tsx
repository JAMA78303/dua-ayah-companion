"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ReciterSelector } from "@/components/ReciterSelector";
import { useReciter } from "@/components/ReciterProvider";
import { QuranVerseBlock } from "@/components/quran/QuranVerseBlock";
import type { QfChapter } from "@/lib/quranFoundation/chapters";
import type { QfVerse } from "@/lib/quranFoundation/versesByChapter";
import {
  getContinuousPlayEnabled,
  setContinuousPlayEnabled,
} from "@/lib/quranFoundation/continuousPlayPreference";
import { getSurahName } from "@/lib/quran/surahNames";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
const SPEED_STORAGE_KEY = "dac-playback-speed";

interface QuranSurahReaderProps {
  surahNumber: number;
  chapterMeta: QfChapter | null;
}

export function QuranSurahReader({ surahNumber, chapterMeta }: QuranSurahReaderProps) {
  const { reciterId, reciterName } = useReciter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeVerseKeyRef = useRef<string | null>(null);
  const continuousPlayRef = useRef(false);
  const continueAfterKeyRef = useRef<string | null>(null);

  const [verses, setVerses] = useState<QfVerse[]>([]);
  const [pairingMap, setPairingMap] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioByVerseKey, setAudioByVerseKey] = useState<Record<string, string>>({});
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(localStorage.getItem(SPEED_STORAGE_KEY) ?? 1);
  });

  continuousPlayRef.current = continuousPlay;
  activeVerseKeyRef.current = activeVerseKey;

  const englishName = chapterMeta?.nameSimple ?? getSurahName(surahNumber);
  const arabicName = chapterMeta?.nameArabic ?? englishName;
  const verseCount = chapterMeta?.versesCount;

  const loadAudio = useCallback(
    async (reciter: number) => {
      const audioRes = await fetch(`/api/quran/${surahNumber}/audio?reciterId=${reciter}`, {
        cache: "no-store",
      });
      if (!audioRes.ok) {
        setAudioByVerseKey({});
        return;
      }
      const audioJson = (await audioRes.json()) as { audioByVerseKey?: Record<string, string> };
      setAudioByVerseKey(audioJson.audioByVerseKey ?? {});
    },
    [surahNumber],
  );

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const res = await fetch(`/api/quran/${surahNumber}/verses?page=${pageNum}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("unavailable");
      const json = (await res.json()) as {
        verses: QfVerse[];
        hasMore: boolean;
        currentPage: number;
      };
      setVerses((prev) => (append ? [...prev, ...json.verses] : json.verses));
      setHasMore(json.hasMore);
      setPage(json.currentPage);
    },
    [surahNumber],
  );

  const scrollToVerse = useCallback((verseKey: string) => {
    const id = `verse-${verseKey.replace(":", "-")}`;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setProgress(0);
  }, []);

  const playVerse = useCallback(
    async (verseKey: string) => {
      const url = audioByVerseKey[verseKey];
      const el = audioRef.current;
      if (!url || !el) return;

      setLoadingAudio(true);
      try {
        el.src = url;
        el.playbackRate = speed;
        setActiveVerseKey(verseKey);
        await el.play();
        setPlaying(true);
        scrollToVerse(verseKey);
      } catch {
        setActiveVerseKey(null);
        setPlaying(false);
      } finally {
        setLoadingAudio(false);
      }
    },
    [audioByVerseKey, speed, scrollToVerse],
  );

  const advanceAfterVerse = useCallback(
    async (endedVerseKey: string) => {
      const currentIndex = verses.findIndex((v) => v.verseKey === endedVerseKey);
      if (currentIndex < 0) return;

      for (let i = currentIndex + 1; i < verses.length; i++) {
        const nextKey = verses[i]!.verseKey;
        if (audioByVerseKey[nextKey]) {
          await playVerse(nextKey);
          return;
        }
      }

      if (hasMore && !loadingMore) {
        continueAfterKeyRef.current = endedVerseKey;
        setLoadingMore(true);
        try {
          await loadPage(page + 1, true);
        } catch {
          continueAfterKeyRef.current = null;
          setActiveVerseKey(null);
        } finally {
          setLoadingMore(false);
        }
        return;
      }

      setActiveVerseKey(null);
    },
    [verses, audioByVerseKey, hasMore, loadingMore, loadPage, page, playVerse],
  );

  const handleAudioEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0);

    const endedKey = activeVerseKeyRef.current;
    if (!endedKey) return;

    if (continuousPlayRef.current) {
      void advanceAfterVerse(endedKey);
    } else {
      setActiveVerseKey(null);
    }
  }, [advanceAfterVerse]);

  const handleSpeedToggle = useCallback(() => {
    const speeds = [0.75, 1, 1.25];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]!;
    setSpeed(next);
    localStorage.setItem(SPEED_STORAGE_KEY, String(next));
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, [speed]);

  useEffect(() => {
    queueMicrotask(() => setContinuousPlay(getContinuousPlayEnabled()));
  }, []);

  const stopAllPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setActiveVerseKey(null);
    setPlaying(false);
    setProgress(0);
    setLoadingAudio(false);
  }, []);

  useEffect(() => {
    stopAllPlayback();
  }, [surahNumber, reciterId, stopAllPlayback]);

  useEffect(() => {
    const onReciterChanged = () => stopAllPlayback();
    window.addEventListener("reciter-changed", onReciterChanged);
    return () => window.removeEventListener("reciter-changed", onReciterChanged);
  }, [stopAllPlayback]);

  useEffect(() => {
    const resumeFrom = continueAfterKeyRef.current;
    if (!resumeFrom || !continuousPlayRef.current) return;

    const currentIndex = verses.findIndex((v) => v.verseKey === resumeFrom);
    if (currentIndex < 0) return;

    for (let i = currentIndex + 1; i < verses.length; i++) {
      const nextKey = verses[i]!.verseKey;
      if (audioByVerseKey[nextKey]) {
        continueAfterKeyRef.current = null;
        void playVerse(nextKey);
        return;
      }
    }
  }, [verses, audioByVerseKey, playVerse]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      setAudioByVerseKey({});
      try {
        const pairRes = await fetch(`/api/pairings-by-surah?surah=${surahNumber}`, {
          cache: "no-store",
        });
        if (pairRes.ok) {
          const pairJson = (await pairRes.json()) as { pairings?: Record<string, string> };
          if (!cancelled) setPairingMap(pairJson.pairings ?? {});
        }

        await loadPage(1, false);

        void loadAudio(reciterId).catch(() => {
          if (!cancelled) setAudioByVerseKey({});
        });
      } catch {
        if (!cancelled) setError("This surah could not be loaded right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surahNumber, reciterId, loadPage, loadAudio]);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadPage(page + 1, true);
    } catch {
      setError("Could not load more verses.");
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleContinuousPlay() {
    setContinuousPlay((prev) => {
      const next = !prev;
      setContinuousPlayEnabled(next);
      return next;
    });
  }

  if (loading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading verses...</p>;
  }

  if (error) {
    return (
      <section className="card-elevated space-y-3 p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Link href="/quran" className="text-sm font-medium text-[var(--accent-primary)]">
          Back to surah list
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onEnded={handleAudioEnded}
        onError={() => {
          setActiveVerseKey(null);
          setPlaying(false);
          setLoadingAudio(false);
        }}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (!el || !el.duration) return;
          setProgress((el.currentTime / el.duration) * 100);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/quran" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
          ← All surahs
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={toggleContinuousPlay}
            aria-pressed={continuousPlay}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              continuousPlay
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40"
            }`}
          >
            {continuousPlay ? "Continuous on" : "Continuous off"}
          </button>
          <ReciterSelector compact />
        </div>
      </div>

      <header className="space-y-1 text-center">
        <p dir="rtl" lang="ar" className="font-scheherazade text-3xl text-[var(--text-arabic)]">
          {arabicName}
        </p>
        <h1 className="font-playfair text-xl font-semibold text-[var(--text-primary)]">{englishName}</h1>
        {verseCount ? (
          <p className="text-sm text-[var(--text-secondary)]">{verseCount} verses</p>
        ) : null}
      </header>

      {surahNumber !== 9 ? (
        <p
          dir="rtl"
          lang="ar"
          className="font-scheherazade text-center text-xl text-[var(--accent-primary)]"
        >
          {BISMILLAH}
        </p>
      ) : null}

      <section className="card-elevated px-4 py-2">
        {verses.map((verse) => {
          const isActive = activeVerseKey === verse.verseKey;
          return (
            <QuranVerseBlock
              key={verse.verseKey}
              verse={verse}
              surahNumber={surahNumber}
              pairingId={pairingMap[verse.verseKey] ?? null}
              playback={{
                canPlay: Boolean(audioByVerseKey[verse.verseKey]),
                isPlaying: playing && isActive,
                loading: loadingAudio && isActive,
                progress: isActive ? progress : 0,
                speed,
                reciterName,
                onPlay: () => void playVerse(verse.verseKey),
                onPause: pausePlayback,
                onSpeedToggle: handleSpeedToggle,
              }}
            />
          );
        })}
      </section>

      {hasMore ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-3 text-sm font-medium text-[var(--accent-primary)] shadow-[var(--card-shadow)] disabled:opacity-60"
        >
          {loadingMore ? "Loading..." : "Load more verses"}
        </button>
      ) : null}
    </div>
  );
}
