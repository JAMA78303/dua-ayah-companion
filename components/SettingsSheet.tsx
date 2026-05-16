"use client";

import { ReciterSelector } from "@/components/ReciterSelector";
import { useReciter } from "@/components/ReciterProvider";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { reciterName } = useReciter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex max-h-[70vh] flex-col rounded-t-[20px] bg-[var(--card-bg)] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />

        <h2 id="settings-sheet-title" className="font-playfair text-lg text-[var(--text-primary)]">
          Settings
        </h2>

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Audio &amp; Recitation</h3>
          <p className="text-xs text-[var(--text-secondary)]">Currently: {reciterName}</p>
          <ReciterSelector />
        </section>
      </div>
    </div>
  );
}
