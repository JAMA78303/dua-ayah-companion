-- Review workflow for admins (e.g. the imam reviewing content).
--
-- After running this, make someone an admin (they must have signed up first):
--   INSERT INTO public.admin_users (id)
--   SELECT id FROM auth.users WHERE email = 'reviewer@example.com'
--   ON CONFLICT (id) DO NOTHING;

-- True when the signed-in user is in admin_users. SECURITY DEFINER so policies can call it without
-- needing read access to admin_users (and without policy recursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()));
$$;

-- Duas: admins see every pairing (pending / rejected too) and can review or edit them.
DROP POLICY IF EXISTS "Admins read all pairings" ON public.ayah_pairings;
CREATE POLICY "Admins read all pairings"
  ON public.ayah_pairings FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins update pairings" ON public.ayah_pairings;
CREATE POLICY "Admins update pairings"
  ON public.ayah_pairings FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Stories and Names live in code; this records a reviewer's verdict on each item.
-- content_key matches the feed ids: 'story:<slug>:<chapterIndex>' or 'name:<number>'.
CREATE TABLE IF NOT EXISTS public.content_reviews (
  content_key TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('approved', 'hidden')),
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage content reviews" ON public.content_reviews;
CREATE POLICY "Admins manage content reviews"
  ON public.content_reviews FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- The feed needs to skip hidden items for everyone, without exposing reviewer notes.
CREATE OR REPLACE FUNCTION public.hidden_content_keys()
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT content_key FROM public.content_reviews WHERE status = 'hidden';
$$;

GRANT EXECUTE ON FUNCTION public.hidden_content_keys() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
