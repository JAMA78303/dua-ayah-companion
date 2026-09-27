import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NAMES_OF_ALLAH, getNameOfAllah } from "@/lib/content/namesOfAllah";
import { getSurahName } from "@/lib/quran/surahNames";

interface NamePageProps {
  params: Promise<{ number: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return NAMES_OF_ALLAH.map((name) => ({ number: String(name.number) }));
}

export async function generateMetadata({ params }: NamePageProps): Promise<Metadata> {
  const name = getNameOfAllah(Number((await params).number));
  if (!name) return {};
  return {
    title: `${name.transliteration} · The 99 Names of Allah`,
    description: `${name.meaning}. ${name.live}`,
  };
}

export default async function NamePage({ params }: NamePageProps) {
  const name = getNameOfAllah(Number((await params).number));
  if (!name) notFound();

  const previous = getNameOfAllah(name.number - 1);
  const next = getNameOfAllah(name.number + 1);
  const [surah] = name.ref.split(":");
  const refLabel = `${getSurahName(Number(surah))} ${name.ref}`;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <Link href="/names" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
        ← The 99 Names
      </Link>

      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{`Name ${name.number} of 99`}</p>
        <p dir="rtl" lang="ar" className="font-scheherazade text-5xl leading-relaxed text-[var(--text-arabic)]">
          {name.arabic}
        </p>
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">{name.transliteration}</h1>
        <p className="text-sm italic text-[var(--text-secondary)]">{name.meaning}</p>
        <p className="pt-2 text-xs text-[var(--text-secondary)]">
          {name.refKind === "name" ? "Named in " : "Its meaning in the Qur'an: "}
          <Link
            href={`/result?verseKey=${name.ref}`}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1 text-[var(--accent-primary)] transition hover:border-[var(--accent-primary)]"
          >
            {refLabel}
          </Link>
        </p>
      </header>

      <section className="card-elevated space-y-2 p-5 md:p-6">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">Make it a dua</h2>
        <p className="text-[15px] leading-7 text-[var(--text-primary)]">{name.dua}</p>
        <p className="text-xs text-[var(--text-secondary)]">
          {name.duaSource ?? "Simple words to make your own. Call on Him by this name in your own language."}
        </p>
      </section>

      <section className="card-elevated space-y-2 p-5 md:p-6">
        <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)]">Live it</h2>
        <p className="text-[15px] leading-7 text-[var(--text-primary)]">{name.live}</p>
      </section>

      <nav className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5 text-sm" aria-label="More names">
        {previous ? (
          <Link href={`/names/${previous.number}`} className="text-[var(--accent-primary)] hover:opacity-80">
            {`← ${previous.transliteration}`}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/names/${next.number}`} className="text-[var(--accent-primary)] hover:opacity-80">
            {`${next.transliteration} →`}
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
