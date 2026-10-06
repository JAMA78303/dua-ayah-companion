import type { Metadata } from "next";

import { MyDuasView, type PersonalDua } from "@/components/myDuas/MyDuasView";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "My duas · Dua & Ayah Companion",
};

export default async function MyDuasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("personal_duas")
    .select("id, text, answered_at, answered_note, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <PageHeader eyebrow="Your personal supplications" title="My duas" back={{ href: "/you", label: "You" }}>
        <p className="text-sm text-[var(--text-secondary)]">
          Keep the things you&apos;re asking Allah for in one place. When a dua is answered, mark it, so you can look back
          on how He answered you. Only you can see this list.
        </p>
      </PageHeader>
      {error ? (
        <p className="text-sm text-[var(--text-secondary)]">Your duas couldn&apos;t be loaded right now.</p>
      ) : (
        <MyDuasView duas={(data ?? []) as PersonalDua[]} />
      )}
    </main>
  );
}
