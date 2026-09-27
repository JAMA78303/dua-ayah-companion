-- Supporter subscriptions (Stripe). The Stripe webhook keeps these in step using the
-- service role; is_premium is derived from subscription_status. Clients can read their
-- own row but cannot change any of these columns (012 grants UPDATE on preferences only).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancels_at TIMESTAMPTZ;
