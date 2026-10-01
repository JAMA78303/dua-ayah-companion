-- Stories of the Companions (in code, like the prophets' stories) appear only once a reviewer approves
-- each chapter. The pages need the approved keys without exposing reviewers' notes, as the feed already
-- does for hidden keys (015). Safe to re-run.

CREATE OR REPLACE FUNCTION public.approved_content_keys()
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT content_key FROM public.content_reviews WHERE status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION public.approved_content_keys() TO anon, authenticated;
