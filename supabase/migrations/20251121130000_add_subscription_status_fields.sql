-- Add subscription status tracking and Stripe event log
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS last_subscription_check timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_latest_invoice_id TEXT;

UPDATE public.users
SET subscription_status = CASE
  WHEN subscription_status IS NULL OR subscription_status = '' THEN CASE
    WHEN subscription_tier IN ('STANDARD', 'INFLUENCER') THEN 'active'
    ELSE 'inactive'
  END
  ELSE subscription_status
END;

CREATE TABLE IF NOT EXISTS public.stripe_subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users (user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS stripe_subscription_events_user_idx ON public.stripe_subscription_events (user_id);
CREATE INDEX IF NOT EXISTS stripe_subscription_events_type_idx ON public.stripe_subscription_events (event_type);
