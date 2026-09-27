"use client";

import Link from "next/link";
import { useState } from "react";

import { SettingsSheet } from "@/components/SettingsSheet";
import { ThemeSettingsPanel } from "@/components/ThemeSettingsPanel";

export function AppHeader() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[var(--app-header-h)] items-center border-b border-[var(--border)] bg-[var(--card-bg)]/90 px-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-playfair text-sm font-semibold text-[var(--text-primary)] hover:opacity-80"
          >
            Companion
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition hover:border-[var(--gold)] hover:text-[var(--text-primary)]"
              aria-label="Open settings"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] shadow-[var(--card-shadow)] transition hover:border-[var(--gold)]"
              aria-label="Open theme picker"
            >
              <svg
                className="size-4 shrink-0 text-[var(--accent-primary)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c-2.5 3-2.5 15 0 18M12 3c2.5 3 2.5 15 0 18M3 12h18" strokeLinecap="round" />
              </svg>
              Themes
            </button>
          </div>
        </div>
      </header>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ThemeSettingsPanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  );
}
