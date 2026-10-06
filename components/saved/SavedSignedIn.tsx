import Link from "next/link";

import { SAVED_EMPTY_MESSAGE, SavedEntries } from "@/components/saved/SavedEntries";
import { FREE_SAVE_CAP } from "@/lib/saves/limits";
import { resolveSavedEntries } from "@/lib/saves/resolveSaved";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader eyebrow="In your account" title="Saved" back={{ href: "/you", label: "You" }}>
        <p className="text-sm text-[var(--text-secondary)]">Duas, adhkar, ayat, Names and stories you&apos;ve kept.</p>
      </PageHeader>
      {profile?.is_premium ? null : (
        <section className="card-elevated space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="font-playfair text-lg font-semibold text-[var(--text-primary)]">{`${FREE_SAVE_CAP}-save free account limit`}</p>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--gold)]">
              {`${Math.min(keys.length, FREE_SAVE_CAP)} / ${FREE_SAVE_CAP}`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${(Math.min(keys.length, FREE_SAVE_CAP) / FREE_SAVE_CAP) * 100}%` }} />
          </div>
          <Link
            href="/supporter"
            className="inline-flex min-h-10 items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_14%,transparent)] px-4 text-xs font-bold text-[var(--text-primary)]"
          >
            Unlimited saves as a Supporter
          </Link>
        </section>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">{SAVED_EMPTY_MESSAGE}</p>
      ) : (
        <SavedEntries entries={entries} />
      )}
    </main>
  );
}
