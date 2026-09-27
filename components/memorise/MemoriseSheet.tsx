"use client";

import { useEffect, useRef, useState } from "react";

interface MemoriseSheetProps {
  title: string;
  /** The ayah's words in order (pause marks attached to their word where possible). */
  words: string[];
  audioUrl: string | null;
  onClose: () => void;
}

const LEVELS = ["Show all", "Hide some", "Hide most", "From memory"] as const;
const REPEATS = [1, 3, 5, 10] as const;

/** Which words a level hides: none, every third, two in three, all. */
function isHidden(level: number, index: number) {
  if (level === 0) return false;
  if (level === 1) return index % 3 === 1;
  if (level === 2) return index % 3 !== 0;
  return true;
}

export function MemoriseSheet({ title, words, audioUrl, onClose }: MemoriseSheetProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [level, setLevel] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [repeat, setRepeat] = useState<(typeof REPEATS)[number]>(3);
  const [played, setPlayed] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Stop the recitation when the sheet closes.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  function chooseLevel(next: number) {
    setLevel(next);
    setRevealed(new Set());
  }

  async function play() {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setPlayed(0);
    audio.currentTime = 0;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function onEnded() {
    const count = played + 1;
    setPlayed(count);
    if (count < repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    } else {
      setPlaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memorise-title"
        className="relative z-[1] mx-auto max-h-[90dvh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-t-[20px] bg-[var(--card-bg)] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <h2 id="memorise-title" className="font-playfair text-lg text-[var(--text-primary)]">{`Memorise · ${title}`}</h2>
          <button type="button" onClick={onClose} className="text-sm text-[var(--text-secondary)]">
            Done
          </button>
        </div>

        <p dir="rtl" lang="ar" className="font-scheherazade text-right text-3xl leading-[2.3] text-[var(--text-arabic)]">
          {words.map((word, index) => {
            const hidden = isHidden(level, index) && !revealed.has(index);
            return (
              <span key={`${word}-${index}`}>
                {hidden ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((prev) => new Set(prev).add(index))}
                    aria-label="Reveal word"
                    className="inline-block rounded-md bg-[var(--bg-subtle)] align-middle text-transparent"
                    style={{ minWidth: `${Math.max(2, word.length * 0.45)}em`, height: "1.2em" }}
                  >
                    {word}
                  </button>
                ) : (
                  word
                )}
                {index < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </p>
        <p className="text-center text-xs text-[var(--text-secondary)]">
          {level === 0 ? "Read it through a few times, then hide some words." : "Recite the hidden words from memory. Tap one to check it."}
        </p>

        <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="How much to hide">
          {LEVELS.map((label, index) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={level === index}
              onClick={() => chooseLevel(index)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                level === index
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
                  : "border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {audioUrl ? (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => void play()}
              className="rounded-full bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-[var(--on-accent-text)]"
            >
              {playing ? `⏸ Playing ${Math.min(played + 1, repeat)} of ${repeat}` : "▶ Listen on repeat"}
            </button>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              Repeat
              <select
                value={repeat}
                onChange={(e) => setRepeat(Number(e.target.value) as (typeof REPEATS)[number])}
                className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 text-sm text-[var(--text-primary)]"
              >
                {REPEATS.map((n) => (
                  <option key={n} value={n}>
                    {`${n}×`}
                  </option>
                ))}
              </select>
            </label>
            <audio ref={audioRef} src={audioUrl} preload="none" onEnded={onEnded} className="hidden" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
