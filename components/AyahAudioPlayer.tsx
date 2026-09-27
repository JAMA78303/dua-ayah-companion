"use client";

import { useEffect, useRef, useState } from "react";

import { cyclePlaybackSpeed, readPlaybackSpeed } from "@/lib/audio/playbackSpeed";

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
  /** Playback position, e.g. for word highlighting. */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}

export function AyahAudioPlayer({
  audioUrl,
  verseKey,
  reciterName,
  shouldPause = false,
  autoPlay = false,
  onPlayStart,
  onEnded,
  onTimeUpdate,
  onPlayingChange,
}: AyahAudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onPlayingChangeRef = useRef(onPlayingChange);

  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  });

  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
  }, [playing]);

  useEffect(() => {
    // Read after mount so server and client render the same initial speed.
    queueMicrotask(() => setSpeed(readPlaybackSpeed()));
  }, []);

  function pausePlayback() {
    if (audioRef.current) {
      // Unload without `src = ""` — an empty src fires `error`, which would hide the player.
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
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
      // Resume a paused clip; only (re)load when the source changed or was unloaded.
      if (audioRef.current.getAttribute("src") !== audioUrl) {
        audioRef.current.src = audioUrl;
      }
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
    queueMicrotask(() => void startPlayback());
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
    const next = cyclePlaybackSpeed(speed);
    setSpeed(next);
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
          className="flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent-primary)_35%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent-primary)_8%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "·····" : playing ? "⏸" : "▶"}
          {loading ? "Loading" : playing ? "Pause" : "Listen"}
        </button>

        <button
          type="button"
          onClick={handleSpeedToggle}
          className="font-mono text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          aria-label="Toggle playback speed"
        >
          {speed}×
        </button>

        <span className="flex-1 truncate text-xs italic text-[var(--text-secondary)]">{reciterName}</span>
      </div>

      {(playing || progress > 0) && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-100"
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
        onError={() => {
          // Only a real load failure should hide the player, not an unloaded element.
          if (audioRef.current?.getAttribute("src")) setError(true);
        }}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          const { currentTime, duration } = audioRef.current;
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
          onTimeUpdate?.(currentTime, duration);
        }}
      />
    </div>
  );
}
