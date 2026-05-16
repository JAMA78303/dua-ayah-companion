"use client";

import { useEffect } from "react";

import { ThemeSelector } from "@/components/ThemeSelector";

interface ThemeSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeSettingsPanel({ open, onClose }: ThemeSettingsPanelProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/45"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-panel-title"
        className="card-elevated rounded-b-none rounded-t-2xl border-b-0 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="theme-panel-title" className="font-playfair text-lg font-semibold text-[var(--text-primary)]">
          Kiswah themes
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Six historical Kiswah colours — hold a swatch to read its story. Al-Abyad and Al-Aswad are
          free; Supporters unlock all six.
        </p>
        <div className="mt-5">
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}
