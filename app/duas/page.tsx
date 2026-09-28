import type { Metadata } from "next";
import Link from "next/link";

import { SunnahDuaCard } from "@/components/duas/SunnahDuaCard";
import { SUNNAH_SITUATIONS } from "@/lib/content/sunnahSituations";
import { fetchApprovedSunnahDuas } from "@/lib/content/sunnahDuas";
import { EMOTION_CATEGORIES, isEmotionCategory } from "@/types/emotions";

export const metadata: Metadata = {
  title: "Duas from the Sunnah · Dua & Ayah Companion",
  description: "Duas the Prophet ﷺ taught for worry, fear, anger, loss and more, each linked to its hadith.",
};

interface DuasPageProps {
  searchParams: Promise<{ feeling?: string }>;
}

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
    active
      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
      : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
  }`;

export default async function DuasPage({ searchParams }: DuasPageProps) {
  const { feeling: rawFeeling } = await searchParams;
  const feeling = rawFeeling && isEmotionCategory(rawFeeling) ? rawFeeling : undefined;
  const duas = await fetchApprovedSunnahDuas(feeling);
  const sections = SUNNAH_SITUATIONS.map((situation) => ({
    ...situation,
    duas: duas.filter((dua) => dua.situation === situation.slug),
  })).filter((section) => section.duas.length > 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Duas from the Sunnah</h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          What the Prophet ﷺ said and taught for the moments that weigh on us, from Hisn al-Muslim (Fortress of the
          Muslim). Each dua links to the hadith it comes from.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by feeling">
        <Link href="/duas" className={chipClass(!feeling)}>
          All
        </Link>
        {EMOTION_CATEGORIES.map((category) => (
          <Link key={category} href={`/duas?feeling=${category}`} className={chipClass(feeling === category)}>
            {category}
          </Link>
        ))}
      </nav>

      {sections.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          {feeling ? "No duas for this feeling yet." : "These duas are being reviewed and will appear here soon, in sha Allah."}
        </p>
      ) : (
        sections.map((section) => (
          <section key={section.slug} aria-labelledby={`situation-${section.slug}`} className="space-y-4">
            <h2 id={`situation-${section.slug}`} className="font-playfair text-lg font-semibold text-[var(--text-primary)]">
              {section.title}
            </h2>
            {section.duas.map((dua) => (
              <SunnahDuaCard key={dua.id} dua={dua} />
            ))}
          </section>
        ))
      )}
    </main>
  );
}
