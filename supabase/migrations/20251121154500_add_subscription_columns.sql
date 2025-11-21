-- Add subscription columns for new plan logic
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS coupon_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS last_subscription_check timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_latest_invoice_id TEXT;

UPDATE public.users
SET
  subscription_tier = CASE
    WHEN is_premium THEN COALESCE(subscription_tier, 'STANDARD')
    ELSE COALESCE(subscription_tier, 'FREE')
  END,
  subscription_status = CASE
    WHEN is_premium THEN 'active'
    ELSE 'inactive'
  END,
  plan_confirmed = CASE
    WHEN is_premium THEN true
    ELSE plan_confirmed
  END;
