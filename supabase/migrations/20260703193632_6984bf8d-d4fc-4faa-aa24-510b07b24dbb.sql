-- Restore EXECUTE on has_role so RLS policies that call it work for logged-in users.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;