"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ReciterSelector } from "@/components/ReciterSelector";
import { useReciter } from "@/components/ReciterProvider";
import { QuranVerseBlock } from "@/components/quran/QuranVerseBlock";
import { setRecitedWord } from "@/components/quran/recitationStore";
import {
  clipProgress,
  cueClip,
  quranWords,
  reachedClipEnd,
  recitedWordIndex,
  settleAtClipStart,
} from "@/lib/audio/clipPlayback";
import { fetchReflectedAyat } from "@/lib/journal/reflectedAyat";
import type { QfChapter } from "@/lib/quranFoundation/chapters";
import type { AyahClip } from "@/lib/quranFoundation/fetchAudio";
import type { QfVerse } from "@/lib/quranFoundation/versesByChapter";
import {
  getContinuousPlayEnabled,
  setContinuousPlayEnabled,
} from "@/lib/quranFoundation/continuousPlayPreference";
import { getSurahName } from "@/lib/quran/surahNames";
import { cyclePlaybackSpeed, readPlaybackSpeed } from "@/lib/audio/playbackSpeed";
import { usePlaybackTicker } from "@/lib/audio/usePlaybackTicker";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

/** Gap allowed between one ayah's end and the next one's start for playback to simply carry on. */
const CONTIGUOUS_MS = 1500;

interface QuranSurahReaderProps {
  surahNumber: number;
  chapterMeta: QfChapter | null;
}

const ayahNumberOf = (verseKey: string) => Number(verseKey.split(":")[1]);

export function QuranSurahReader({ surahNumber, chapterMeta }: QuranSurahReaderProps) {
  const { reciterId, reciterName } = useReciter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** The file the element has loaded (its src may carry a #t= fragment). */
  const loadedUrlRef = useRef<string | null>(null);
  const activeVerseKeyRef = useRef<string | null>(null);
  const continuousPlayRef = useRef(false);
  /** The ayah whose end has been handled, so it isn't handled again on the next frame. */
  const endedKeyRef = useRef<string | null>(null);
  const scrolledKeyRef = useRef<string | null>(null);

  const [verses, setVerses] = useState<QfVerse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Every ayah's recitation for the chosen reciter (whole-surah file with timings, or one file per ayah). */
  const [clips, setClips] = useState<Record<string, AyahClip>>({});
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [reflected, setReflected] = useState<Set<string>>(() => new Set());

  const clipsRef = useRef(clips);
  const versesRef = useRef(verses);
  useEffect(() => {
    clipsRef.current = clips;
    versesRef.current = verses;
    continuousPlayRef.current = continuousPlay;
    activeVerseKeyRef.current = activeVerseKey;
  });

  useEffect(() => {
    let cancelled = false;
    void fetchReflectedAyat(surahNumber).then((keys) => {
      if (!cancelled) setReflected(keys);
    });
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  const noteReflected = useCallback((key: string) => {
    setReflected((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const englishName = chapterMeta?.nameSimple ?? getSurahName(surahNumber);
  const arabicName = chapterMeta?.nameArabic ?? englishName;
  const verseCount = chapterMeta?.versesCount;

  const loadAudio = useCallback(
    async (reciter: number): Promise<Record<string, AyahClip>> => {
      const audioRes = await fetch(`/api/quran/${surahNumber}/audio?reciterId=${reciter}`, {
        cache: "no-store",
      });
      if (!audioRes.ok) return {};
      const audioJson = (await audioRes.json()) as { clips?: Record<string, AyahClip> };
      return audioJson.clips ?? {};
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
    const el = document.getElementById(`verse-${verseKey.replace(":", "-")}`);
    if (!el) return;
    scrolledKeyRef.current = verseKey;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const selectVerse = useCallback((verseKey: string | null) => {
    activeVerseKeyRef.current = verseKey;
    endedKeyRef.current = null;
    setActiveVerseKey(verseKey);
    if (!verseKey) setRecitedWord(null, null);
  }, []);

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const stopAllPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    loadedUrlRef.current = null;
    selectVerse(null);
    setPlaying(false);
    setProgress(0);
    setLoadingAudio(false);
  }, [selectVerse]);

  const playVerse = useCallback(
    async (verseKey: string) => {
      const clip = clipsRef.current[verseKey];
      const el = audioRef.current;
      if (!clip || !el) return;

      // Paused part-way through this ayah: carry on from there.
      const positionMs = el.currentTime * 1000;
      const resuming =
        activeVerseKeyRef.current === verseKey &&
        loadedUrlRef.current === clip.url &&
        positionMs > clip.startMs &&
        !reachedClipEnd(clip, positionMs);

      setLoadingAudio(true);
      try {
        if (!resuming) loadedUrlRef.current = cueClip(el, clip, loadedUrlRef.current);
        el.playbackRate = speed;
        selectVerse(verseKey);
        await el.play();
        setPlaying(true);
        scrollToVerse(verseKey);
      } catch {
        selectVerse(null);
        setPlaying(false);
      } finally {
        setLoadingAudio(false);
      }
    },
    [speed, scrollToVerse, selectVerse],
  );

  /** The next ayah after this one that has audio (a broken timing can leave a gap). */
  const nextPlayableKey = useCallback(
    (verseKey: string) => {
      const available = clipsRef.current;
      const total = verseCount ?? Object.keys(available).length;
      for (let n = ayahNumberOf(verseKey) + 1; n <= total; n++) {
        if (available[`${surahNumber}:${n}`]) return `${surahNumber}:${n}`;
      }
      return null;
    },
    [surahNumber, verseCount],
  );

  const loadMoreForVerse = useCallback(
    async (verseKey: string) => {
      if (versesRef.current.some((v) => v.verseKey === verseKey) || !hasMore || loadingMore) return;
      setLoadingMore(true);
      try {
        await loadPage(page + 1, true);
      } catch {
        /* the recitation carries on; the ayah just isn't on screen yet */
      } finally {
        setLoadingMore(false);
      }
    },
    [hasMore, loadingMore, loadPage, page],
  );

  /** The ayah finished: go on to the next when continuous play is on, otherwise stop. */
  const handleVerseEnd = useCallback(
    (endedKey: string) => {
      const el = audioRef.current;
      const next = continuousPlayRef.current ? nextPlayableKey(endedKey) : null;
      if (!el || !next) {
        el?.pause();
        setPlaying(false);
        setProgress(0);
        selectVerse(null);
        return;
      }

      const ended = clipsRef.current[endedKey];
      const upcoming = clipsRef.current[next]!;
      const carriesOn =
        !el.paused &&
        !el.ended &&
        upcoming.url === loadedUrlRef.current &&
        ended?.endMs != null &&
        Math.abs(upcoming.startMs - ended.endMs) < CONTIGUOUS_MS;
      void loadMoreForVerse(next);
      if (carriesOn) {
        // Same surah file, next ayah straight after: keep playing and move the glow along.
        selectVerse(next);
        scrollToVerse(next);
      } else {
        void playVerse(next);
      }
    },
    [nextPlayableKey, loadMoreForVerse, playVerse, scrollToVerse, selectVerse],
  );

  const wordCountsRef = useRef(new Map<string, number>());

  /** Light the word being recited and catch the end of the ayah (a whole-surah file doesn't stop there by itself). */
  const followRecitation = () => {
    const el = audioRef.current;
    const key = activeVerseKeyRef.current;
    const clip = key ? clipsRef.current[key] : undefined;
    if (!el || !key || !clip || el.paused) return;
    const positionMs = el.currentTime * 1000;
    const counts = wordCountsRef.current;
    if (!counts.has(key)) {
      const verse = versesRef.current.find((v) => v.verseKey === key);
      if (verse) counts.set(key, quranWords(verse.textUthmani).length);
    }
    const wordCount = counts.get(key) ?? Math.max(0, ...clip.words.map(([position]) => position));
    setRecitedWord(key, recitedWordIndex(clip.words, positionMs, wordCount));
    if (reachedClipEnd(clip, positionMs) && endedKeyRef.current !== key) {
      endedKeyRef.current = key;
      handleVerseEnd(key);
    }
  };
  usePlaybackTicker(playing, followRecitation);

  // An ayah reached while its page was still loading: bring it into view once it's on screen.
  useEffect(() => {
    if (playing && activeVerseKey && scrolledKeyRef.current !== activeVerseKey) scrollToVerse(activeVerseKey);
  }, [verses, playing, activeVerseKey, scrollToVerse]);

  const handleSpeedToggle = useCallback(() => {
    const next = cyclePlaybackSpeed(speed);
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, [speed]);

  useEffect(() => {
    queueMicrotask(() => {
      setContinuousPlay(getContinuousPlayEnabled());
      setSpeed(readPlaybackSpeed());
    });
  }, []);

  useEffect(() => {
    queueMicrotask(stopAllPlayback);
  }, [surahNumber, reciterId, stopAllPlayback]);

  useEffect(() => {
    const onReciterChanged = () => stopAllPlayback();
    window.addEventListener("reciter-changed", onReciterChanged);
    return () => window.removeEventListener("reciter-changed", onReciterChanged);
  }, [stopAllPlayback]);

  // Leaving the page clears the glow for the next reader.
  useEffect(() => () => setRecitedWord(null, null), []);

  // Verses depend only on the surah; a reciter change must not reset the page.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      setClips({});
      try {
        await loadPage(1, false);
      } catch {
        if (!cancelled) setError("This surah could not be loaded right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surahNumber, loadPage]);

  useEffect(() => {
    let cancelled = false;
    // Keep the previous reciter's clips until the new ones arrive so Listen controls don't
    // vanish and collapse the page (playback is already stopped on reciter change).
    void (async () => {
      const next = await loadAudio(reciterId).catch(() => ({}));
      if (!cancelled) setClips(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [reciterId, loadAudio]);

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
        onLoadedMetadata={() => {
          const key = activeVerseKeyRef.current;
          const clip = key ? clipsRef.current[key] : undefined;
          if (audioRef.current && clip) settleAtClipStart(audioRef.current, clip);
        }}
        onEnded={() => {
          const key = activeVerseKeyRef.current;
          if (key && endedKeyRef.current !== key) {
            endedKeyRef.current = key;
            handleVerseEnd(key);
          }
        }}
        onError={() => {
          selectVerse(null);
          setPlaying(false);
          setLoadingAudio(false);
        }}
        onTimeUpdate={() => {
          followRecitation();
          const el = audioRef.current;
          const key = activeVerseKeyRef.current;
          const clip = key ? clipsRef.current[key] : undefined;
          if (!el || !clip) return;
          setProgress(clipProgress(clip, el.currentTime * 1000, el.duration * 1000) * 100);
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
              hasReflection={reflected.has(`ayah:${verse.verseKey}`)}
              onReflected={noteReflected}
              isReciting={isActive && playing}
              playback={{
                canPlay: Boolean(clips[verse.verseKey]),
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
