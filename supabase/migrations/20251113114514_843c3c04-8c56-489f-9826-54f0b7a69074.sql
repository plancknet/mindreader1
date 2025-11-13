-- Add email column to premium_users
ALTER TABLE premium_users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the trigger function to include email
DROP FUNCTION IF EXISTS public.ensure_premium_user_exists() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_premium_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.premium_users (user_id, email, is_premium, usage_count)
  VALUES (NEW.id, NEW.email, false, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_premium_user_exists();

-- Rename table from premium_users to users
ALTER TABLE premium_users RENAME TO users;