-- Add subscription tier metadata and influencer coupon tracking
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('FREE', 'STANDARD', 'INFLUENCER')) DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS coupon_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_coupon_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT;

UPDATE public.users
SET
  subscription_tier = CASE
    WHEN subscription_tier IS NULL AND is_premium THEN 'STANDARD'
    WHEN subscription_tier IS NULL THEN 'FREE'
    ELSE subscription_tier
  END,
  plan_confirmed = COALESCE(plan_confirmed, is_premium, false),
  coupon_generated = COALESCE(coupon_generated, false)
WHERE subscription_tier IS NULL
   OR plan_confirmed IS NULL
   OR coupon_generated IS NULL;

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid NOT NULL REFERENCES public.users (user_id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  amount numeric(10,2) NOT NULL DEFAULT 6.0,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS coupon_redemptions_influencer_idx ON public.coupon_redemptions (influencer_id);
CREATE INDEX IF NOT EXISTS coupon_redemptions_redeemed_idx ON public.coupon_redemptions (redeemed_at);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "influencer-select-own-redemptions" ON public.coupon_redemptions;
CREATE POLICY "influencer-select-own-redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (auth.uid() = influencer_id);
