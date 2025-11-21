-- Remove old constraint that only allows 'one_time'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS premium_users_premium_type_check;

-- Add new constraint that allows 'one_time', 'standard', 'influencer', or NULL
ALTER TABLE public.users ADD CONSTRAINT users_premium_type_check 
  CHECK (premium_type IS NULL OR premium_type IN ('one_time', 'standard', 'influencer'));

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

-- Update existing data based on current premium status
UPDATE public.users
SET
  subscription_tier = CASE
    WHEN is_premium THEN 'STANDARD'
    ELSE 'FREE'
  END,
  subscription_status = CASE
    WHEN is_premium THEN 'active'
    ELSE 'inactive'
  END,
  plan_confirmed = is_premium;

-- Specifically set the influencer plan for wbawba@gmail.com
UPDATE public.users
SET
  subscription_tier = 'INFLUENCER',
  subscription_status = 'active',
  is_premium = true,
  plan_confirmed = true,
  premium_type = 'influencer',
  updated_at = now()
WHERE email = 'wbawba@gmail.com';