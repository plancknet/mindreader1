-- Create coupon_redemptions table to track influencer coupon usage
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code text NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  amount numeric NOT NULL DEFAULT 6.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Admins can view all redemptions
CREATE POLICY "Admins can view all coupon redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Influencers can view their own redemptions
CREATE POLICY "Influencers can view their own redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (auth.uid() = influencer_id);

-- Create index for faster queries
CREATE INDEX idx_coupon_redemptions_influencer_id ON public.coupon_redemptions(influencer_id);
CREATE INDEX idx_coupon_redemptions_coupon_code ON public.coupon_redemptions(coupon_code);
CREATE INDEX idx_coupon_redemptions_redeemed_at ON public.coupon_redemptions(redeemed_at DESC);