import { PageHeader } from "@/components/layout/PageHeader";
import { QuranSurahList } from "@/components/quran/QuranSurahList";

export default function QuranPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader eyebrow="114 surahs" title="Qur'an" />
      <QuranSurahList />
    </main>
  );
}
