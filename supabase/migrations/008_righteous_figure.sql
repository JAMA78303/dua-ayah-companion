-- Righteous figure attribution on ayah_pairings (view-only; no new content).
ALTER TABLE public.ayah_pairings
  ADD COLUMN IF NOT EXISTS righteous_figure TEXT;

CREATE INDEX IF NOT EXISTS idx_ayah_pairings_righteous_figure
  ON public.ayah_pairings(righteous_figure)
  WHERE righteous_figure IS NOT NULL;

COMMENT ON COLUMN public.ayah_pairings.righteous_figure IS
  'Companion or righteous figure name when the pairing is attributed to them (not a Prophet).';
