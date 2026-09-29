-- Saves can point at any content, not only curated ayah + dua pairings.
-- content_key matches the feed / review ids:
--   'pairing:<uuid>'          a curated ayah + dua pairing (pairing_id is kept for its ON DELETE CASCADE)
--   'ayah:<surah>:<ayah>'     any ayah
--   'adhkar:<id>'             a morning / evening dhikr (lib/content/adhkar.ts)
--   'name:<number>'           one of the 99 Names, with its dua
--   'story:<slug>:<index>'    a chapter of a prophet's story
-- Every kind counts towards the free cap (012's trigger counts all rows).

ALTER TABLE public.saved_items ADD COLUMN IF NOT EXISTS content_key TEXT;

UPDATE public.saved_items
SET content_key = 'pairing:' || pairing_id
WHERE content_key IS NULL AND pairing_id IS NOT NULL;

ALTER TABLE public.saved_items ALTER COLUMN pairing_id DROP NOT NULL;

-- Keep content_key and pairing_id in step, whichever one the client sends
-- (older app versions still insert pairing_id only).
CREATE OR REPLACE FUNCTION public.saved_items_fill_keys()
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

DROP TRIGGER IF EXISTS saved_items_fill_keys ON public.saved_items;
CREATE TRIGGER saved_items_fill_keys
  BEFORE INSERT OR UPDATE ON public.saved_items
  FOR EACH ROW EXECUTE FUNCTION public.saved_items_fill_keys();

ALTER TABLE public.saved_items ALTER COLUMN content_key SET NOT NULL;

ALTER TABLE public.saved_items DROP CONSTRAINT IF EXISTS saved_items_content_key_format;
ALTER TABLE public.saved_items ADD CONSTRAINT saved_items_content_key_format CHECK (
  content_key ~ '^(pairing:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|ayah:[1-9][0-9]{0,2}:[1-9][0-9]{0,2}|adhkar:[a-z0-9-]{1,40}|name:[1-9][0-9]?|story:[a-z0-9-]{1,60}:[0-9]{1,2})$'
);

CREATE UNIQUE INDEX IF NOT EXISTS saved_items_user_content_key ON public.saved_items (user_id, content_key);
