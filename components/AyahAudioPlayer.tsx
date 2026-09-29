"use client";

import { useEffect, useRef, useState } from "react";

import { clipProgress, cueClip, reachedClipEnd, settleAtClipStart, type ClipRange } from "@/lib/audio/clipPlayback";
import { cyclePlaybackSpeed, readPlaybackSpeed } from "@/lib/audio/playbackSpeed";
import { usePlaybackTicker } from "@/lib/audio/usePlaybackTicker";

interface AyahAudioPlayerProps {
  /** The ayah's recitation: its own file, or its part of the reciter's whole-surah file. */
  clip: ClipRange | null;
  verseKey: string;
  reciterName: string;
  /** Pause when another ayah is playing (Qur'an reader list). */
  shouldPause?: boolean;
  /** Start playback when parent advances (continuous mode). */
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onEnded?: () => void;
  /**
   * Every frame while playing, e.g. for word highlighting: the position in the file (ms) and how far
   * through the ayah that is (0 to 1).
   */
  onTimeUpdate?: (positionMs: number, progress: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}

export function AyahAudioPlayer({
  clip,
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
  /** The file the element has loaded (its src may carry a #t= fragment). */
  const loadedUrlRef = useRef<string | null>(null);
  const clipRef = useRef(clip);
  const callbacksRef = useRef({ onPlayingChange, onTimeUpdate, onEnded });

  useEffect(() => {
    clipRef.current = clip;
    callbacksRef.current = { onPlayingChange, onTimeUpdate, onEnded };
  });

  useEffect(() => {
    callbacksRef.current.onPlayingChange?.(playing);
  }, [playing]);

  useEffect(() => {
    // Read after mount so server and client render the same initial speed.
    queueMicrotask(() => setSpeed(readPlaybackSpeed()));
  }, []);

  function unload() {
    if (audioRef.current) {
      // Unload without `src = ""` — an empty src fires `error`, which would hide the player.
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    loadedUrlRef.current = null;
    setPlaying(false);
    setProgress(0);
  }

  function finish() {
    audioRef.current?.pause();
    setPlaying(false);
    setProgress(0);
    callbacksRef.current.onEnded?.();
  }

  const clipKey = clip ? `${clip.url}|${clip.startMs}|${clip.endMs}` : null;

  useEffect(() => {
    queueMicrotask(() => {
      if (!clipKey) unload();
      setLoading(false);
      setError(false);
    });
  }, [verseKey, clipKey]);

  useEffect(() => {
    if (!shouldPause) return;
    queueMicrotask(() => unload());
  }, [shouldPause]);

  useEffect(() => {
    const onReciterChanged = () => unload();
    window.addEventListener("reciter-changed", onReciterChanged);
    return () => window.removeEventListener("reciter-changed", onReciterChanged);
  }, []);

  useEffect(() => {
    const card = audioRef.current?.closest("[data-feed-card]");
    if (!card) return;

    const onDeactivated = () => unload();
    card.addEventListener("feed-card-deactivated", onDeactivated);
    return () => card.removeEventListener("feed-card-deactivated", onDeactivated);
  }, [clipKey]);

  /** Report the position and stop at the end of the ayah (a whole-surah file would run on into the next). */
  const follow = () => {
    const el = audioRef.current;
    const current = clipRef.current;
    if (!el || !current || el.paused) return;
    const positionMs = el.currentTime * 1000;
    callbacksRef.current.onTimeUpdate?.(positionMs, clipProgress(current, positionMs, el.duration * 1000));
    if (reachedClipEnd(current, positionMs)) finish();
  };
  usePlaybackTicker(playing, follow);

  async function startPlayback() {
    const el = audioRef.current;
    if (!el || !clip) return;

    setLoading(true);
    try {
      // Resume where it was paused inside the ayah; otherwise start the ayah from the beginning.
      const positionMs = el.currentTime * 1000;
      const insideClip =
        loadedUrlRef.current === clip.url && positionMs >= clip.startMs && !reachedClipEnd(clip, positionMs) && positionMs > 0;
      if (!insideClip) loadedUrlRef.current = cueClip(el, clip, loadedUrlRef.current);
      el.playbackRate = speed;
      await el.play();
      setPlaying(true);
      onPlayStart?.();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoPlay || shouldPause || !clip || playing || loading) return;
    queueMicrotask(() => void startPlayback());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to autoPlay request
  }, [autoPlay, clipKey, shouldPause]);

  if (!clip || error) return null;

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
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onLoadedMetadata={() => {
          if (audioRef.current && clip) settleAtClipStart(audioRef.current, clip);
        }}
        onEnded={finish}
        onError={() => {
          // Only a real load failure should hide the player, not an unloaded element.
          if (audioRef.current?.getAttribute("src")) setError(true);
        }}
        onTimeUpdate={() => {
          follow();
          const el = audioRef.current;
          if (!el || !clip) return;
          setProgress(clipProgress(clip, el.currentTime * 1000, el.duration * 1000));
        }}
      />
    </div>
  );
}
