import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { NameOfTheDayCard } from "@/components/names/NameOfTheDayCard";
import { NamesList } from "@/components/names/NamesList";

export const metadata: Metadata = {
  title: "The 99 Names of Allah · Dua & Ayah Companion",
  description: "Learn a name of Allah each day, call on Him by it, and live it.",
};

export default function NamesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader eyebrow="Know Allah by His Names" title="99 Names" back={{ href: "/library", label: "Library" }} />

      <section className="card-elevated space-y-2 bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] p-5">
        <p className="font-playfair text-lg leading-snug text-[var(--text-primary)]">
          &ldquo;And to Allah belong the best names, so invoke Him by them.&rdquo;
        </p>
        <Link
          href="/result?verseKey=7:180"
          className="inline-block rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--gold)]"
        >
          Qur&apos;an 7:180
        </Link>
        <p className="pt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          The Prophet ﷺ said that Allah has ninety-nine names (Bukhari and Muslim). This list follows the order of a narration
          in at-Tirmidhi; scholars differ over exactly which names it includes.
        </p>
      </section>

      <NameOfTheDayCard />

      <NamesList />
    </main>
  );
}
