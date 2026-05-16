import Link from "next/link";

import { FavouritesPageClient } from "@/components/favourites/FavouritesPageClient";
import { SavedSignedIn } from "@/components/saved/SavedSignedIn";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--bg-subtle)] px-4 py-3 text-center text-sm text-[var(--text-primary)]">
          <p className="font-medium text-[var(--accent-primary)]">Sign in to sync your saves</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Below is what you&apos;ve saved on this device only. Sign in to keep them in your account.
          </p>
          <Link
            href="/login?next=/saved"
            className="mt-3 inline-block rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
        <FavouritesPageClient
          title="Saved on this device"
          description="These favourites are stored locally until you sign in."
        />
      </div>
    );
  }

  return <SavedSignedIn userId={user.id} />;
}
