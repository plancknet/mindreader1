-- Trigger-only functions: revoke execute from clients
REVOKE EXECUTE ON FUNCTION public.ensure_user_exists() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_premium_users_updated_at() FROM PUBLIC, anon, authenticated;

-- get_total_count: doesn't need elevated privileges, switch to INVOKER
CREATE OR REPLACE FUNCTION public.get_total_count(user_row public.users)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT user_row.jogo1_count + user_row.jogo2_count + user_row.jogo3_count + user_row.jogo4_count;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_total_count(public.users) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_total_count(public.users) TO authenticated, service_role;