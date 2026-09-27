"use client";

import { useEffect, useState } from "react";

import { useReciter } from "@/components/ReciterProvider";
import { PINNED_RECITER_IDS, type QfReciter } from "@/lib/quranFoundation/fetchReciters";

interface ReciterSelectorProps {
  compact?: boolean;
}

function styleBadgeClass(style: string | null): string {
  if (style?.toLowerCase().includes("mujawwad")) {
    return "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800";
  }
  return "rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_8%,transparent)] px-2 py-0.5 text-xs text-[var(--accent-primary)]";
}

function ReciterRow({
  reciter,
  selected,
  onSelect,
}: {
  reciter: QfReciter;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(reciter.id)}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-[var(--bg-subtle)]"
    >
      <div className="min-w-0 flex-1">
        <p dir="rtl" lang="ar" className="font-scheherazade text-base text-[var(--text-primary)]">
          {reciter.arabic_name}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">{reciter.name}</p>
      </div>
      {selected ? (
        <span className="shrink-0 text-sm font-semibold text-[var(--accent-primary)]" aria-hidden>
          ✓
        </span>
      ) : reciter.style ? (
        <span className={styleBadgeClass(reciter.style)}>{reciter.style}</span>
      ) : null}
    </button>
  );
}

export function ReciterSelector({ compact = false }: ReciterSelectorProps) {
  const { reciterId, reciters, reciterShortName, reciterName, saveReciterId } = useReciter();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handleSelect(id: number) {
    if (id === reciterId) {
      setOpen(false);
      return;
    }
    setPendingId(id);
    saveReciterId(id);
    window.setTimeout(() => {
      setPendingId(null);
      setOpen(false);
    }, 150);
  }

  const pinnedSet = new Set<number>(PINNED_RECITER_IDS);
  const pinned = reciters.filter((r) => pinnedSet.has(r.id));
  const rest = reciters.filter((r) => !pinnedSet.has(r.id));
  const selectedId = pendingId ?? reciterId;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "flex items-center gap-1 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            : "flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-left text-sm text-[var(--text-primary)]"
        }
        aria-label="Choose reciter"
      >
        <span className={compact ? "truncate" : "font-medium"}>
          {compact ? reciterShortName : reciterName}
        </span>
        <span className="shrink-0 text-[var(--text-secondary)]" aria-hidden>
          ›
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close reciter picker"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative z-[1] flex max-h-[70vh] flex-col rounded-t-[20px] bg-[var(--card-bg)] pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reciter-sheet-title"
          >
            <div
              className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--border)]"
              aria-hidden
            />

            <h2
              id="reciter-sheet-title"
              className="font-playfair px-5 pb-1 pt-3 text-lg text-[var(--text-primary)]"
            >
              Choose Reciter
            </h2>
            <p className="px-5 pb-4 text-xs italic text-[var(--text-secondary)]">
              Murattal is clear and measured. Mujawwad is melodic and expressive.
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {pinned.map((reciter) => (
                <ReciterRow
                  key={reciter.id}
                  reciter={reciter}
                  selected={selectedId === reciter.id}
                  onSelect={handleSelect}
                />
              ))}
              {rest.length > 0 ? <hr className="mx-5 border-[var(--border)]" /> : null}
              {rest.map((reciter) => (
                <ReciterRow
                  key={reciter.id}
                  reciter={reciter}
                  selected={selectedId === reciter.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
