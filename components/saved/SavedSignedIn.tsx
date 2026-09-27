import Link from "next/link";

import { SAVED_EMPTY_MESSAGE, SavedEntries } from "@/components/saved/SavedEntries";
import { FREE_SAVE_CAP } from "@/lib/saves/limits";
import { resolveSavedEntries } from "@/lib/saves/resolveSaved";
import { createClient } from "@/lib/supabase/server";

export async function SavedSignedIn({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase.from("saved_items").select("content_key, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("profiles").select("is_premium").eq("id", userId).maybeSingle(),
  ]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-700">Could not load saves: {error.message}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-[var(--accent-primary)]">
          Back home
        </Link>
      </main>
    );
  }

  const keys = (data ?? []).map((row) => row.content_key as string);
  const entries = await resolveSavedEntries(keys, supabase);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Saved</h1>
        <p className="text-sm text-[var(--text-secondary)]">Duas, adhkar, ayat, Names and stories you&apos;ve kept.</p>
        {profile?.is_premium ? null : (
          <p className="text-xs text-[var(--text-secondary)]">
            {`${Math.min(keys.length, FREE_SAVE_CAP)} of ${FREE_SAVE_CAP} free saves used. `}
            <Link href="/supporter" className="font-medium text-[var(--accent-primary)]">
              Unlimited as a Supporter →
            </Link>
          </p>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">{SAVED_EMPTY_MESSAGE}</p>
      ) : (
        <SavedEntries entries={entries} />
      )}
    </main>
  );
}
