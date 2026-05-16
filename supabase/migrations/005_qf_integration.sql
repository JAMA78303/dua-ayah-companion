-- Quran Foundation cross-reference + source labelling + optional user QF tokens
-- See: https://api-docs.quran.foundation (User API) — content CDN base configured via env in app.

ALTER TABLE ayah_pairings
  ADD COLUMN IF NOT EXISTS qf_verse_key TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'quranic',
  ADD COLUMN IF NOT EXISTS hadith_source TEXT;

COMMENT ON COLUMN ayah_pairings.qf_verse_key IS 'Optional verse key for QF/CDN alignment (e.g. same as surah:ayah).';

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  qf_auth_token TEXT,
  qf_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_qf_user_id ON public.profiles (qf_user_id) WHERE qf_user_id IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
