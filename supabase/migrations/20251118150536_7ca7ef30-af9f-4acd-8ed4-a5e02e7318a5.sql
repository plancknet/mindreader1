-- Fix search_path for now_sao_paulo function
CREATE OR REPLACE FUNCTION public.now_sao_paulo()
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT now() AT TIME ZONE 'America/Sao_Paulo';
$function$;