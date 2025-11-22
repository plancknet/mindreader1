-- Allow admins to read coupon redemptions
DROP POLICY IF EXISTS "admin-select-all-redemptions" ON public.coupon_redemptions;
CREATE POLICY "admin-select-all-redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
