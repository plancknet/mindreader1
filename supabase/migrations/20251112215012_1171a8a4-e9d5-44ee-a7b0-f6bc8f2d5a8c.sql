-- Fix security warning: set search_path for get_total_count function
DROP FUNCTION IF EXISTS public.get_total_count(premium_users);

CREATE OR REPLACE FUNCTION public.get_total_count(user_row premium_users)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_row.jogo1_count + user_row.jogo2_count + user_row.jogo3_count + user_row.jogo4_count;
$$;