import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { SaveButton } from "@/components/SaveButton";
import { NAMES_OF_ALLAH, getNameOfAllah } from "@/lib/content/namesOfAllah";
import { getSurahName } from "@/lib/quran/surahNames";
import { nameKey } from "@/lib/saves/contentKeys";

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

  const pill =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-5 py-6 md:px-8">
      <PageHeader eyebrow={`Name ${name.number} of 99`} title={name.transliteration} back={{ href: "/names", label: "99 Names" }} />

      <section className="card-elevated space-y-2 bg-[color-mix(in_srgb,var(--gold)_14%,var(--card-bg))] p-6 text-center">
        <p dir="rtl" lang="ar" className="font-scheherazade text-[56px] leading-[1.6] text-[var(--text-arabic)]">
          {name.arabic}
        </p>
        <p className="font-playfair text-[26px] font-semibold text-[var(--text-primary)]">{name.transliteration}</p>
        <p className="text-sm font-bold text-[var(--gold)]">{name.meaning}</p>
        <p className="pt-2 text-xs text-[var(--text-secondary)]">
          {name.refKind === "name" ? "Named in " : "Its meaning in the Qur'an: "}
          <Link
            href={`/result?verseKey=${name.ref}`}
            className="inline-block rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] px-2.5 py-1 font-bold text-[var(--gold)]"
          >
            {refLabel}
          </Link>
        </p>
      </section>

      <section className="card-elevated space-y-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-playfair text-[21px] font-semibold text-[var(--text-primary)]">Make it a dua</h2>
          <SaveButton contentKey={nameKey(name.number)} compact />
        </div>
        <p className="text-[15px] leading-7 text-[var(--text-primary)]">{name.dua}</p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          {name.duaSource ?? "Personal supplication · simple words to make your own, not a hadith."}
        </p>
      </section>

      <section className="card-elevated space-y-2 p-5">
        <h2 className="font-playfair text-[21px] font-semibold text-[var(--text-primary)]">Live it</h2>
        <p className="text-[15px] leading-7 text-[var(--text-primary)]">{name.live}</p>
      </section>

      <nav className="flex gap-2" aria-label="More names">
        {previous ? (
          <Link href={`/names/${previous.number}`} className={pill}>
            {`← ${previous.transliteration}`}
          </Link>
        ) : null}
        {next ? (
          <Link href={`/names/${next.number}`} className={pill}>
            {`${next.transliteration} →`}
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
