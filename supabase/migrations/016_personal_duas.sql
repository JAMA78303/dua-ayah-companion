-- "My duas": a private list of the user's own duas, which they can mark as answered.

CREATE TABLE IF NOT EXISTS public.personal_duas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 1000),
  answered_at TIMESTAMPTZ,
  answered_note TEXT CHECK (answered_note IS NULL OR char_length(answered_note) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_duas_user ON public.personal_duas (user_id, created_at DESC);

ALTER TABLE public.personal_duas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their duas" ON public.personal_duas;
CREATE POLICY "Users own their duas"
  ON public.personal_duas FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
