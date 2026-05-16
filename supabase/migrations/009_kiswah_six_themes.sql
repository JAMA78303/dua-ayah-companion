-- Six historical Kiswah themes (replaces fajr/kiswah/abbasid/mamluk/layl).

UPDATE public.profiles
SET theme_preference = CASE theme_preference
  WHEN 'fajr' THEN 'abyad'
  WHEN 'kiswah' THEN 'aswad'
  WHEN 'abbasid' THEN 'akhdar'
  WHEN 'mamluk' THEN 'ahmar'
  WHEN 'layl' THEN 'aswad'
  ELSE theme_preference
END
WHERE theme_preference IN ('fajr', 'kiswah', 'abbasid', 'mamluk', 'layl');

ALTER TABLE public.profiles
  ALTER COLUMN theme_preference SET DEFAULT 'abyad';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_theme_preference_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_theme_preference_check
  CHECK (
    theme_preference IN (
      'abyad',
      'aswad',
      'ahmar',
      'akhdar',
      'dhahabi',
      'mukhattam'
    )
  );

COMMENT ON COLUMN public.profiles.theme_preference IS
  'Kiswah theme id: abyad, aswad, ahmar, akhdar, dhahabi, mukhattam.';
