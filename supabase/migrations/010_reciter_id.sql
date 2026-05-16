-- Preferred QF audio reciter (default Mishari Al-Afasy = 7)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reciter_id INTEGER DEFAULT 7;

COMMENT ON COLUMN public.profiles.reciter_id IS
  'Preferred QF audio reciter id (default Mishari Al-Afasy = 7).';
