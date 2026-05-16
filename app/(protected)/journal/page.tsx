import { JournalView } from "@/components/journal/JournalView";
import { createClient } from "@/lib/supabase/server";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).maybeSingle();
  const isPremium = Boolean(profile?.is_premium);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("journal_entries")
    .select(
      `id, content, created_at, updated_at, ayah_pairings ( surah, ayah_number, translation, emotion_category, prophet_name )`,
    )
    .eq("user_id", user.id);

  if (!isPremium) {
    query = query.gte("created_at", sevenDaysAgo);
  }

  const { data: entries, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-700">Could not load journal: {error.message}</p>
      </main>
    );
  }

  let olderHiddenCount = 0;
  if (!isPremium) {
    const { count } = await supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lt("created_at", sevenDaysAgo);
    olderHiddenCount = count ?? 0;
  }

  const normalised =
    (entries ?? []).map((row) => {
      const ap = row.ayah_pairings;
      const pairing = Array.isArray(ap) ? ap[0] ?? null : ap;
      return { ...row, ayah_pairings: pairing };
    }) ?? [];

  return <JournalView entries={normalised} olderHiddenCount={olderHiddenCount} isPremium={isPremium} />;
}
