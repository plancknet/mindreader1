
ALTER TABLE public.coupon_redemptions
  ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT;

CREATE INDEX IF NOT EXISTS coupon_redemptions_promo_code_idx
  ON public.coupon_redemptions (stripe_promotion_code_id);
