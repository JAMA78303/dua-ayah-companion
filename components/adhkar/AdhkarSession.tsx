"use client";

import Link from "next/link";
import { Check, CircleCheck, Sunrise, Sunset } from "lucide-react";
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {dhikr.title ? (
            <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">{dhikr.title}</span>
          ) : null}
          {dhikr.repeat > 1 ? (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-primary)]">
              {`${dhikr.repeat}×`}
            </span>
          ) : null}
        </div>
        <SaveButton contentKey={adhkarKey(dhikr.id)} icon />
      </div>
      <p dir="rtl" lang="ar" className="font-scheherazade text-right text-[28px] leading-[2] text-[var(--text-arabic)]">
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
        className={`flex w-full flex-col items-center gap-1 rounded-[16px] py-4 transition active:scale-[0.98] ${
          done
            ? "bg-[var(--bg-subtle)] text-[var(--accent-primary)]"
            : "bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] text-[var(--accent-primary)]"
        }`}
      >
        {done ? (
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <Check className="size-4" strokeWidth={2} aria-hidden />
            Done
          </span>
        ) : (
          <>
            <span className="font-playfair text-[30px] font-semibold leading-none tabular-nums">{`${count} / ${dhikr.repeat}`}</span>
            <span className="text-[11px] font-bold">{dhikr.repeat === 1 ? "Tap when said" : "Tap to count"}</span>
          </>
        )}
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
    return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;
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

  const percent = Math.round((done / total) * 100);
  const label = time === "morning" ? "Morning" : "Evening";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["morning", "evening"] as const).map((t) => {
          const Icon = t === "morning" ? Sunrise : Sunset;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={time === t}
              onClick={() => setTime(t)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
                time === t
                  ? "bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
                  : "bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--text-primary)]"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.8} aria-hidden />
              {t === "morning" ? "Morning" : "Evening"}
            </button>
          );
        })}
      </div>

      <div className="sticky top-[calc(var(--app-header-h)+0.5rem)] z-20 space-y-2 rounded-[16px] bg-[color-mix(in_srgb,var(--bg-subtle)_92%,transparent)] px-3 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--text-primary)]">{`Today · ${done} of ${total}`}</span>
          <span className="flex items-center gap-3">
            {done > 0 ? (
              <button type="button" onClick={reset} className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
                Reset
              </button>
            ) : null}
            <span className="font-bold text-[var(--accent-primary)]">{`${percent}%`}</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div className="h-full rounded-full bg-[var(--accent-primary)] transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {complete ? (
        <section className="card-elevated space-y-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
            <CircleCheck className="size-5" strokeWidth={1.6} aria-hidden />
          </span>
          <h2 className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">{`${label} adhkar complete`}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{`${total} remembrances · May Allah accept it from you.`}</p>
        </section>
      ) : null}

      <ol className="space-y-4">
        {list.map((dhikr) => (
          <DhikrCard key={dhikr.id} dhikr={dhikr} time={time} count={progress[dhikr.id] ?? 0} onCount={() => count(dhikr)} />
        ))}
      </ol>
    </div>
  );
}
