-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.ensure_premium_user_exists();

-- Recreate the function with the correct table name
CREATE OR REPLACE FUNCTION public.ensure_user_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, is_premium, usage_count)
  VALUES (NEW.id, NEW.email, false, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Recreate the trigger with the new function name
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_exists();