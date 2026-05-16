"use client";

import Link from "next/link";

export type JournalServerEntry = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  ayah_pairings: {
    surah: number;
    ayah_number: number;
    translation: string;
    emotion_category: string | null;
    prophet_name: string | null;
  } | null;
};

interface JournalViewProps {
  entries: JournalServerEntry[];
  olderHiddenCount: number;
  isPremium: boolean;
}

export function JournalView({ entries, olderHiddenCount, isPremium }: JournalViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">My Journal</h1>
        <Link href="/" className="text-sm font-medium text-[var(--accent-primary)]">
          Back
        </Link>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        {isPremium
          ? "Your full journal history is shown below."
          : "Reflections from the last 7 days are shown below."}
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Your journal is waiting. Start with today&apos;s ayah.</p>
      ) : (
        entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm"
          >
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date(entry.created_at).toLocaleString()}
            </p>
            {entry.ayah_pairings ? (
              <p className="mt-1 text-xs text-[var(--accent-primary)]">
                Surah {entry.ayah_pairings.surah}, Ayah {entry.ayah_pairings.ayah_number}
                {entry.ayah_pairings.emotion_category ? ` · ${entry.ayah_pairings.emotion_category}` : null}
              </p>
            ) : null}
            <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--text-primary)]">{entry.content}</p>
          </article>
        ))
      )}

      {!isPremium && olderHiddenCount > 0 ? (
        <p className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          You have {olderHiddenCount} older reflection{olderHiddenCount === 1 ? "" : "s"}. Upgrade to read them.
        </p>
      ) : null}
    </main>
  );
}
