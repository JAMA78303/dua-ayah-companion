import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReviewDashboard, type ContentReview, type ReviewPairing } from "@/components/admin/ReviewDashboard";
import { isCurrentUserAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Review content · Dua & Ayah Companion",
  robots: { index: false },
};

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/review");

  if (!(await isCurrentUserAdmin())) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-10">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Admins only</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This page is for reviewers. If you should have access, ask the app owner to add your account to the
          reviewers list.
        </p>
      </main>
    );
  }

  const [{ data: pairings, error }, { data: reviews }] = await Promise.all([
    supabase
      .from("ayah_pairings")
      .select(
        "id, surah, ayah_number, arabic_text, translation, emotion_category, tone_tag, tafsir_summary, reflection_prompts, dua_text, dua_transliteration, dua_translation, dua_verse_key, inclusion_reason, tafsir_source, prophetic_story, prophet_name, status, reviewer_notes, reviewed_at",
      )
      .order("surah", { ascending: true })
      .order("ayah_number", { ascending: true }),
    supabase.from("content_reviews").select("content_key, status, notes, reviewed_at"),
  ]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-[var(--text-secondary)]">Couldn&apos;t load content for review right now.</p>
      </main>
    );
  }

  return <ReviewDashboard pairings={(pairings ?? []) as ReviewPairing[]} reviews={(reviews ?? []) as ContentReview[]} />;
}
