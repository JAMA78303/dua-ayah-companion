import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
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
  `inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-bold capitalize transition ${
    active
      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]"
      : "border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader eyebrow="Sourced for everyday life" title="Sunnah duas" back={{ href: "/library", label: "Library" }}>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          What the Prophet ﷺ said and taught for the moments that weigh on us, from <em>Hisn al-Muslim</em> (Fortress
          of the Muslim) and the duas Ibn al-Qayyim cites in <em>al-Jawab al-Kafi</em>. Each dua links to the hadith it
          comes from.
        </p>
      </PageHeader>

      <Link
        href="/duas/how-to"
        className="rounded-[18px] border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] flex items-center justify-between gap-4 p-5 transition hover:opacity-90"
      >
        <span>
          <span className="block font-playfair text-xl font-semibold text-[var(--text-primary)]">How to make dua</span>
          <span className="block text-xs text-[var(--text-secondary)]">
            How to ask, the times dua is answered, and what holds it back, from Ibn al-Qayyim.
          </span>
        </span>
        <ChevronRight className="size-[17px] shrink-0 text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
      </Link>

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
            <h2 id={`situation-${section.slug}`} className="font-playfair text-[22px] font-semibold text-[var(--text-primary)]">
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
