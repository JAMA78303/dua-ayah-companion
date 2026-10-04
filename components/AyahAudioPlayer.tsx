"use client";

import { Pause, Play } from "lucide-react";
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
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handlePlay()}
          disabled={loading}
          aria-label={playing ? "Pause recitation" : "Play recitation"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-[#0a0a0f] transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          ) : playing ? (
            <Pause className="size-[19px]" strokeWidth={1.8} aria-hidden />
          ) : (
            <Play className="size-[19px] translate-x-px" strokeWidth={1.8} aria-hidden />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-xs font-bold text-[var(--text-primary)]">{reciterName}</p>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div className="h-full rounded-full bg-[var(--gold)] transition-all duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSpeedToggle}
          className="flex min-h-9 shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3 text-xs font-bold text-[var(--text-primary)]"
          aria-label="Toggle playback speed"
        >
          {speed}×
        </button>
      </div>

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
