-- Web push reminders (morning / evening adhkar). One row per device subscription.
-- Only the server touches this table (service role): RLS is on with no policies, so the anon and
-- authenticated roles can neither read nor write it.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint TEXT PRIMARY KEY CHECK (endpoint LIKE 'https://%'),
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  -- IANA timezone of the device, so reminders arrive at local morning / evening.
  timezone TEXT NOT NULL,
  morning BOOLEAN NOT NULL DEFAULT TRUE,
  evening BOOLEAN NOT NULL DEFAULT TRUE,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  -- Local dates the last reminders went out, so each is sent at most once a day.
  last_morning DATE,
  last_evening DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
