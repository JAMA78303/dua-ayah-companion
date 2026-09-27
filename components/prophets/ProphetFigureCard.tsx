import Link from "next/link";

import { prophetArabicName, prophetEnglishLabel } from "@/lib/prophets/displayNames";

interface ProphetFigureCardProps {
  name: string;
  duaCount: number;
  asProphet?: boolean;
}

export function ProphetFigureCard({ name, duaCount, asProphet = true }: ProphetFigureCardProps) {
  return (
    <Link
      href={`/prophets/${encodeURIComponent(name)}`}
      className="card-elevated block rounded-2xl bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-subtle)] p-5 transition hover:border-[var(--accent-primary)]"
    >
      <p dir="rtl" lang="ar" className="font-scheherazade text-xl text-[var(--text-arabic)]">
        {prophetArabicName(name)}
      </p>
      <p className="mt-2 font-nunito text-sm font-semibold text-[var(--text-primary)]">
        {prophetEnglishLabel(name, asProphet)}
      </p>
      <p className="mt-2 text-xs text-[var(--accent-primary)]">
        {`${duaCount} ${duaCount === 1 ? "dua" : "duas"} in the Qur'an`}
      </p>
    </Link>
  );
}
