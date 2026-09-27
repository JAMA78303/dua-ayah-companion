"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SaveButton } from "@/components/SaveButton";
import { adhkarCompletion, readAdhkarProgress, writeAdhkarProgress, type AdhkarProgress } from "@/lib/adhkar/progress";
import { adhkarFor, adhkarTimeNow, type AdhkarTime, type Dhikr } from "@/lib/content/adhkar";
import { getSurahName } from "@/lib/quran/surahNames";
import { adhkarKey } from "@/lib/saves/contentKeys";

function DhikrCard({
  dhikr,
  time,
  count,
  onCount,
}: {
  dhikr: Dhikr;
  time: AdhkarTime;
  count: number;
  onCount: () => void;
}) {
  const done = count >= dhikr.repeat;
  // A full evening version replaces the morning wording; otherwise the evening change is shown as a note.
  const useEvening = time === "evening" && Boolean(dhikr.eveningEnglish);
  const arabic = useEvening && dhikr.eveningArabic ? dhikr.eveningArabic : dhikr.arabic;
  const translit = useEvening ? dhikr.eveningTranslit : dhikr.translit;
  const english = useEvening ? dhikr.eveningEnglish! : dhikr.english;
  const eveningFragment = time === "evening" && !useEvening ? dhikr.eveningArabic : undefined;

  return (
    <li id={dhikr.id} className={`card-elevated scroll-mt-24 space-y-3 p-5 transition ${done ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        {dhikr.title ? <p className="font-playfair text-base font-semibold text-[var(--text-primary)]">{dhikr.title}</p> : <span />}
        <SaveButton contentKey={adhkarKey(dhikr.id)} compact />
      </div>
      <p dir="rtl" lang="ar" className="font-scheherazade text-right text-2xl leading-[2.1] text-[var(--text-arabic)]">
        {arabic}
      </p>
      {translit ? <p className="text-sm italic leading-relaxed text-[var(--text-secondary)]">{translit}</p> : null}
      <p className="text-sm leading-relaxed text-[var(--text-primary)]">{english}</p>

      {eveningFragment ? (
        <p className="text-xs text-[var(--text-secondary)]">
          In the evening, say:{" "}
          <span dir="rtl" lang="ar" className="font-scheherazade text-base text-[var(--text-arabic)]">
            {eveningFragment}
          </span>
        </p>
      ) : null}
      {time === "evening" && dhikr.eveningNote ? <p className="text-xs text-[var(--text-secondary)]">{dhikr.eveningNote}</p> : null}
      {dhikr.note ? <p className="text-xs italic text-[var(--text-secondary)]">{dhikr.note}</p> : null}
      {dhikr.refs ? (
        <p className="text-xs">
          {dhikr.refs.map((ref) => (
            <Link key={ref} href={`/result?verseKey=${ref.split("-")[0]}`} className="text-[var(--accent-primary)] hover:opacity-80">
              {`${getSurahName(Number(ref.split(":")[0]))} ${ref.replace("-", "–")}`}
            </Link>
          ))}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onCount}
        disabled={done}
        aria-label={done ? "Completed" : `Count, ${count} of ${dhikr.repeat}`}
        className={`w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${
          done
            ? "bg-[var(--bg-subtle)] text-[var(--accent-primary)]"
            : "bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
        }`}
      >
        {done ? "✓ Done" : dhikr.repeat === 1 ? "Tap when said" : `Tap to count · ${count} of ${dhikr.repeat}`}
      </button>
    </li>
  );
}

export function AdhkarSession({ initialTime }: { initialTime?: AdhkarTime }) {
  const [time, setTime] = useState<AdhkarTime | null>(initialTime ?? null);
  const [progress, setProgress] = useState<AdhkarProgress>({});

  // Pick morning/evening from the viewer's clock after mount (avoids a server/client mismatch).
  useEffect(() => {
    queueMicrotask(() => {
      setTime((current) => current ?? adhkarTimeNow(new Date()) ?? (new Date().getHours() < 15 ? "morning" : "evening"));
    });
  }, []);

  useEffect(() => {
    if (!time) return;
    queueMicrotask(() => setProgress(readAdhkarProgress(time)));
  }, [time]);

  if (!time) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading...</p>;
  }

  const list = adhkarFor(time);
  const { done, total, complete } = adhkarCompletion(time, progress);

  function count(dhikr: Dhikr) {
    if (!time) return;
    const next = { ...progress, [dhikr.id]: Math.min(dhikr.repeat, (progress[dhikr.id] ?? 0) + 1) };
    setProgress(next);
    writeAdhkarProgress(time, next);
  }

  function reset() {
    if (!time) return;
    setProgress({});
    writeAdhkarProgress(time, {});
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2" role="tablist">
        {(["morning", "evening"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={time === t}
            onClick={() => setTime(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              time === t
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            {t === "morning" ? "Morning" : "Evening"}
          </button>
        ))}
      </div>

      <div className="sticky top-[calc(var(--app-header-h)+0.5rem)] z-20 space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[var(--text-primary)]">
            {complete ? `${time === "morning" ? "Morning" : "Evening"} adhkar complete. May Allah accept.` : `${done} of ${total} done`}
          </span>
          {done > 0 ? (
            <button type="button" onClick={reset} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
              Reset
            </button>
          ) : null}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div className="h-full rounded-full bg-[var(--accent-primary)] transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      <ol className="space-y-4">
        {list.map((dhikr) => (
          <DhikrCard key={dhikr.id} dhikr={dhikr} time={time} count={progress[dhikr.id] ?? 0} onCount={() => count(dhikr)} />
        ))}
      </ol>
    </div>
  );
}
