import { notFound } from "next/navigation";

import { QuranSurahReader } from "@/components/quran/QuranSurahReader";
import { fetchQfChapters } from "@/lib/quranFoundation/chapters";

interface SurahPageProps {
  params: Promise<{ surahNumber: string }>;
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { surahNumber: surahParam } = await params;
  const surahNumber = Number(surahParam);

  if (!Number.isFinite(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    notFound();
  }

  const chapters = await fetchQfChapters();
  const chapterMeta = chapters.find((c) => c.id === surahNumber) ?? null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 md:px-8">
      <QuranSurahReader surahNumber={surahNumber} chapterMeta={chapterMeta} />
    </main>
  );
}
