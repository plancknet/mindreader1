ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_eu_ja_sabia_2 boolean NOT NULL DEFAULT false;

-- Legacy influencer subscribers already had Eu Já Sabia 2
UPDATE public.users SET has_eu_ja_sabia_2 = true WHERE subscription_tier = 'INFLUENCER';

-- Prevent regular users from granting themselves paid access by editing their own row.
CREATE OR REPLACE FUNCTION public.protect_users_paid_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _role text := coalesce(auth.role(), '');
BEGIN
  -- Server functions (service role), internal triggers (no JWT) and admins may change everything
  IF _role = 'service_role' OR auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_premium := false;
    NEW.premium_type := NULL;
    NEW.subscription_tier := 'FREE';
    NEW.plan_confirmed := false;
    NEW.subscription_status := 'inactive';
    NEW.has_eu_ja_sabia_2 := false;
    NEW.stripe_customer_id := NULL;
    NEW.stripe_subscription_id := NULL;
    NEW.stripe_session_id := NULL;
    NEW.purchase_date := NULL;
    NEW.current_period_end := NULL;
    NEW.coupon_code := NULL;
    NEW.coupon_generated := false;
    RETURN NEW;
  END IF;

  NEW.is_premium := OLD.is_premium;
  NEW.premium_type := OLD.premium_type;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.plan_confirmed := OLD.plan_confirmed;
  NEW.subscription_status := OLD.subscription_status;
  NEW.has_eu_ja_sabia_2 := OLD.has_eu_ja_sabia_2;
  NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.stripe_session_id := OLD.stripe_session_id;
  NEW.purchase_date := OLD.purchase_date;
  NEW.current_period_end := OLD.current_period_end;
  NEW.coupon_code := OLD.coupon_code;
  NEW.coupon_generated := OLD.coupon_generated;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_users_paid_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_users_paid_fields ON public.users;
CREATE TRIGGER protect_users_paid_fields
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_users_paid_fields();