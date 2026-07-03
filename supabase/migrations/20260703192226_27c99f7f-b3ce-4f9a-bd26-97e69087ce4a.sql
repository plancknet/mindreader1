-- Restrict google_mime_codes inserts to admins only
DROP POLICY IF EXISTS "Authenticated users can insert codes" ON public.google_mime_codes;

CREATE POLICY "Admins can insert google mime codes"
ON public.google_mime_codes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Revoke EXECUTE on SECURITY DEFINER functions from public roles.
-- has_role is called from RLS policies (runs with definer privileges regardless of caller EXECUTE);
-- the others are trigger functions and shouldn't be callable via the Data API.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_user_exists() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_premium_users_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_total_count(public.users) FROM PUBLIC, anon, authenticated;