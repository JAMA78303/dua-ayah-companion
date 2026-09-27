"use client";

import Link from "next/link";

import { SaveButton } from "@/components/SaveButton";
import { SAVED_GROUPS, type SavedEntry } from "@/lib/saves/types";

function SavedEntryCard({ entry }: { entry: SavedEntry }) {
  return (
    <article className="card-elevated space-y-3 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">{entry.eyebrow}</p>
      {entry.title ? <h3 className="font-playfair text-base font-semibold text-[var(--text-primary)]">{entry.title}</h3> : null}
      {entry.arabic ? (
        <p dir="rtl" lang="ar" className="font-scheherazade text-right text-2xl leading-[2] text-[var(--text-arabic)]">
          {entry.arabic}
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-[var(--text-primary)]">{entry.body}</p>
      {entry.source ? <p className="text-xs text-[var(--text-secondary)]">{entry.source}</p> : null}
      <div className="flex items-center justify-between gap-3 pt-1">
        <SaveButton contentKey={entry.key} surah={entry.surah} ayahNumber={entry.ayahNumber} compact />
        <Link href={entry.href} className="text-sm font-medium text-[var(--accent-primary)] underline-offset-4 hover:underline">
          Open →
        </Link>
      </div>
    </article>
  );
}

/** Saved items grouped into duas & adhkar, ayat, Names and stories (newest first within each). */
export function SavedEntries({ entries }: { entries: SavedEntry[] }) {
  const groups = SAVED_GROUPS.map(({ group, heading }) => ({
    group,
    heading,
    entries: entries.filter((entry) => entry.group === group),
  })).filter(({ entries: inGroup }) => inGroup.length > 0);

  return (
    <div className="space-y-10">
      {groups.map(({ group, heading, entries: inGroup }) => (
        <section key={group} aria-labelledby={`saved-${group}`} className="space-y-4">
          <h2 id={`saved-${group}`} className="flex items-baseline gap-2 font-playfair text-lg font-semibold text-[var(--text-primary)]">
            {heading}
            <span className="font-nunito text-xs font-normal text-[var(--text-secondary)]">{inGroup.length}</span>
          </h2>
          {inGroup.map((entry) => (
            <SavedEntryCard key={entry.key} entry={entry} />
          ))}
        </section>
      ))}
    </div>
  );
}

export const SAVED_EMPTY_MESSAGE = "Nothing saved yet. Tap ♡ Save on a dua, dhikr, ayah, Name or story to keep it here.";
