"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getJournalEntries, type LocalJournalEntry } from "@/lib/local/journalEntries";

export function JournalEntriesPageClient() {
  const [entries, setEntries] = useState<LocalJournalEntry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(getJournalEntries());
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "dua-app:journal-entries") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("dua-app-journal-changed", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dua-app-journal-changed", refresh);
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">My Journal</h1>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)]">
          Back
        </Link>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        Reflections are stored on this device only (no account required).
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No journal entries yet.</p>
      ) : (
        entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm"
          >
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            <Link
              href={`/result?pairingId=${entry.pairing_id}`}
              className="mt-1 inline-block text-sm font-medium text-[var(--accent-primary)]"
            >
              Open paired reflection
            </Link>
            <p className="mt-2 text-sm text-[var(--text-primary)] whitespace-pre-wrap">{entry.content}</p>
          </article>
        ))
      )}
    </main>
  );
}
