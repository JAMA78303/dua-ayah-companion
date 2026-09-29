import Link from "next/link";

export type JournalServerEntry = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  /** "Al-Baqarah 2:255" */
  label: string;
  /** The feeling a curated pairing belongs to, if it's one. */
  feeling: string | null;
  ayahTranslation: string | null;
  href: string | null;
};

interface JournalViewProps {
  entries: JournalServerEntry[];
  olderHiddenCount: number;
  isPremium: boolean;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

export function JournalView({ entries, olderHiddenCount, isPremium }: JournalViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 md:px-8">
      <header className="space-y-1">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">My journal</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {isPremium
            ? "Your reflections on the ayat, newest first."
            : "Your reflections from the last 7 days, newest first."}{" "}
          Write one on any ayah: from its reflection page, or with ✎ Journal in the{" "}
          <Link href="/quran" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            Qur&apos;an
          </Link>
          .
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Your journal is waiting. Start with today&apos;s ayah.</p>
      ) : (
        entries.map((entry) => (
          <article key={entry.id} className="card-elevated space-y-2 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-xs font-semibold text-[var(--accent-primary)]">
                {entry.href ? (
                  <Link href={entry.href} className="hover:opacity-80">
                    {entry.label}
                  </Link>
                ) : (
                  entry.label
                )}
                {entry.feeling ? <span className="font-normal capitalize text-[var(--text-secondary)]">{` · ${entry.feeling}`}</span> : null}
              </p>
              <time dateTime={entry.updated_at} suppressHydrationWarning className="text-xs text-[var(--text-secondary)]">
                {new Date(entry.updated_at).toLocaleDateString(undefined, DATE_FORMAT)}
              </time>
            </div>
            {entry.ayahTranslation ? (
              <p className="line-clamp-2 text-xs italic leading-relaxed text-[var(--text-secondary)]">{entry.ayahTranslation}</p>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">{entry.content}</p>
          </article>
        ))
      )}

      {!isPremium && olderHiddenCount > 0 ? (
        <p className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          You have {olderHiddenCount} older reflection{olderHiddenCount === 1 ? "" : "s"}.{" "}
          <Link href="/supporter" className="font-medium text-[var(--accent-primary)] hover:opacity-80">
            Become a supporter
          </Link>{" "}
          to read them.
        </p>
      ) : null}
    </main>
  );
}
