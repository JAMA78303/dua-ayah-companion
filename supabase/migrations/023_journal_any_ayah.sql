-- Journal entries can be about any ayah, not only curated pairings (as saves can since 019).
-- content_key says what a reflection is about:
--   'pairing:<uuid>'          a curated ayah + dua pairing (pairing_id is kept for the journal page and
--                             its ON DELETE CASCADE)
--   'ayah:<surah>:<ayah>'     any ayah, e.g. from the Qur'an reader
-- Still one reflection per person per item, which the app edits in place.
-- Safe to re-run.

ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS content_key TEXT;

UPDATE public.journal_entries
SET content_key = 'pairing:' || pairing_id
WHERE content_key IS NULL AND pairing_id IS NOT NULL;

ALTER TABLE public.journal_entries ALTER COLUMN pairing_id DROP NOT NULL;

-- Keep content_key and pairing_id in step, whichever one the client sends
-- (older app versions still upsert on pairing_id only).
CREATE OR REPLACE FUNCTION public.journal_entries_fill_keys()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.content_key IS NULL AND NEW.pairing_id IS NOT NULL THEN
    NEW.content_key := 'pairing:' || NEW.pairing_id;
  END IF;
  IF NEW.content_key LIKE 'pairing:%' THEN
    NEW.pairing_id := substring(NEW.content_key FROM 9)::uuid;
  ELSE
    NEW.pairing_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS journal_entries_fill_keys ON public.journal_entries;
CREATE TRIGGER journal_entries_fill_keys
  BEFORE INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.journal_entries_fill_keys();

ALTER TABLE public.journal_entries ALTER COLUMN content_key SET NOT NULL;

ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_content_key_format;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_content_key_format CHECK (
  content_key ~ '^(pairing:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|ayah:[1-9][0-9]{0,2}:[1-9][0-9]{0,2})$'
);

CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_user_content_key ON public.journal_entries (user_id, content_key);
