import Link from "next/link";

import { SavedOnDevice } from "@/components/saved/SavedOnDevice";
import { SavedSignedIn } from "@/components/saved/SavedSignedIn";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Saved on this device</h1>
        <div className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--bg-subtle)] px-4 py-3 text-center text-sm text-[var(--text-primary)]">
          <p className="font-medium text-[var(--accent-primary)]">Sign in to save</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Saves are kept in your account, so they&apos;re on every device. Anything this device remembers is below.
          </p>
          <Link
            href="/login?next=/saved"
            className="mt-3 inline-block rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
        <SavedOnDevice />
      </main>
    );
  }

  return <SavedSignedIn userId={user.id} />;
}
