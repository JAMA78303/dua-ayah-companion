-- 1) Every auth user gets a profiles row, so theme / reciter updates actually land.
-- 2) Users may only edit their own preference columns — not is_premium or QF tokens.
-- 3) The free save cap is enforced in the database, not just in the browser.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill users who signed up before this migration.
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Column-level privileges: rows are created by the trigger above, and clients
-- may only change their preferences. is_premium / qf_* stay service-role only.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (theme_preference, reciter_id, updated_at) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Free accounts are capped at 10 saved items (mirrors FREE_SAVE_CAP in lib/saves/toggleSave.ts).
CREATE OR REPLACE FUNCTION public.enforce_free_save_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  premium BOOLEAN;
  existing_count INTEGER;
BEGIN
  SELECT p.is_premium INTO premium
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF COALESCE(premium, false) THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO existing_count
  FROM public.saved_items s
  WHERE s.user_id = NEW.user_id;

  IF existing_count >= 10 THEN
    RAISE EXCEPTION 'SAVE_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS saved_items_free_cap ON public.saved_items;
CREATE TRIGGER saved_items_free_cap
  BEFORE INSERT ON public.saved_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_save_cap();
