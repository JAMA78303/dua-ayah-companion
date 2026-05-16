"use client";

interface AyahListenControlsProps {
  reciterName: string;
  canPlay: boolean;
  isPlaying: boolean;
  loading: boolean;
  progress: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onSpeedToggle: () => void;
}

export function AyahListenControls({
  reciterName,
  canPlay,
  isPlaying,
  loading,
  progress,
  speed,
  onPlay,
  onPause,
  onSpeedToggle,
}: AyahListenControlsProps) {
  if (!canPlay) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={loading}
          aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
          className="flex items-center gap-2 rounded-full border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "·····" : isPlaying ? "⏸" : "▶"}
          {loading ? "Loading" : isPlaying ? "Pause" : "Listen"}
        </button>

        <button
          type="button"
          onClick={onSpeedToggle}
          className="font-mono text-xs text-slate-400 transition-colors hover:text-slate-600"
          aria-label="Toggle playback speed"
        >
          {speed}×
        </button>

        <span className="flex-1 truncate text-xs italic text-slate-400">{reciterName}</span>
      </div>

      {(isPlaying || progress > 0) && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
