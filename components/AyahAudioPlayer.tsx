"use client";

import { useEffect, useRef, useState } from "react";

interface AyahAudioPlayerProps {
  audioUrl: string | null;
  verseKey: string;
  reciterName: string;
  /** Pause when another ayah is playing (Qur'an reader list). */
  shouldPause?: boolean;
  /** Start playback when parent advances (continuous mode). */
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onEnded?: () => void;
}

export function AyahAudioPlayer({
  audioUrl,
  verseKey,
  reciterName,
  shouldPause = false,
  autoPlay = false,
  onPlayStart,
  onEnded,
}: AyahAudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(localStorage.getItem("dac-playback-speed") ?? 1);
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function pausePlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlaying(false);
    setProgress(0);
  }

  useEffect(() => {
    if (!audioUrl) {
      queueMicrotask(() => {
        pausePlayback();
        setLoading(false);
        setError(false);
      });
      return;
    }
    queueMicrotask(() => {
      setLoading(false);
      setError(false);
    });
  }, [verseKey, audioUrl]);

  useEffect(() => {
    if (!shouldPause) return;
    queueMicrotask(() => pausePlayback());
  }, [shouldPause]);

  useEffect(() => {
    const onReciterChanged = () => pausePlayback();
    window.addEventListener("reciter-changed", onReciterChanged);
    return () => window.removeEventListener("reciter-changed", onReciterChanged);
  }, []);

  useEffect(() => {
    const card = audioRef.current?.closest("[data-feed-card]");
    if (!card) return;

    const onDeactivated = () => pausePlayback();
    card.addEventListener("feed-card-deactivated", onDeactivated);
    return () => card.removeEventListener("feed-card-deactivated", onDeactivated);
  }, [audioUrl]);

  async function startPlayback() {
    if (!audioRef.current || !audioUrl) return;

    setLoading(true);
    try {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = speed;
      await audioRef.current.play();
      setPlaying(true);
      onPlayStart?.();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoPlay || shouldPause || !audioUrl || playing || loading) return;
    void startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to autoPlay request
  }, [autoPlay, audioUrl, shouldPause]);

  if (!audioUrl || error) return null;

  async function handlePlay() {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    await startPlayback();
  }

  function handleSpeedToggle() {
    const speeds = [0.75, 1, 1.25];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]!;
    setSpeed(next);
    localStorage.setItem("dac-playback-speed", String(next));
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handlePlay()}
          disabled={loading}
          aria-label={playing ? "Pause recitation" : "Play recitation"}
          className="flex items-center gap-2 rounded-full border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "·····" : playing ? "⏸" : "▶"}
          {loading ? "Loading" : playing ? "Pause" : "Listen"}
        </button>

        <button
          type="button"
          onClick={handleSpeedToggle}
          className="font-mono text-xs text-slate-400 transition-colors hover:text-slate-600"
          aria-label="Toggle playback speed"
        >
          {speed}×
        </button>

        <span className="flex-1 truncate text-xs italic text-slate-400">{reciterName}</span>
      </div>

      {(playing || progress > 0) && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          onEnded?.();
        }}
        onError={() => setError(true)}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          const { currentTime, duration } = audioRef.current;
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }}
      />
    </div>
  );
}
