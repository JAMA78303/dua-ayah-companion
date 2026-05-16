-- Journal upsert (one row per user + pairing) + Supporter flag on profiles.
--
-- MVP decision: migrating historical localStorage favourites / journal into
-- Supabase for existing anonymous users is NOT in scope for MVP — users who
-- sign in start with cloud state only; device-local lists remain separate.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_premium IS 'Supporter subscription flag (Stripe to be wired in V1).';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'journal_entries_user_pairing_uniq'
  ) THEN
    ALTER TABLE journal_entries
      ADD CONSTRAINT journal_entries_user_pairing_uniq UNIQUE (user_id, pairing_id);
  END IF;
END;
$$;
