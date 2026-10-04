"use client";

import Link from "next/link";
import { useState } from "react";

import { StarMark } from "@/components/brand/StarMark";
import { SettingsSheet } from "@/components/SettingsSheet";
import { ThemeSettingsPanel } from "@/components/ThemeSettingsPanel";

export function AppHeader() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[var(--app-header-h)] items-center border-b border-[var(--border)] bg-[var(--bg-base)]/90 px-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90" aria-label="Companion, home">
            <StarMark size={34} />
            <span className="font-playfair text-[22px] font-semibold leading-none text-[var(--text-primary)]">Companion</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              className="flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              aria-label="Open theme picker"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M12 3a9 9 0 1 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01a1.5 1.5 0 0 1 1.13-2.49H16a5 5 0 0 0 5-5C21 6.58 16.97 3 12 3Z" strokeLinejoin="round" />
                <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
              aria-label="Open settings"
            >
              <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </header>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ThemeSettingsPanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  );
}
