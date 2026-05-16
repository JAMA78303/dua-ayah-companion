-- Superseded by 009_kiswah_six_themes.sql for the six-theme CHECK constraint.
-- Initial install only (if 009 not yet applied):
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'abyad';
