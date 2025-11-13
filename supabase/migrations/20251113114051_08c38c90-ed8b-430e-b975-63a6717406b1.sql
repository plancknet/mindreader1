-- Add has_seen_welcome column to premium_users table
ALTER TABLE premium_users 
ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT false;

-- Create function to ensure user exists in premium_users
CREATE OR REPLACE FUNCTION public.ensure_premium_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.premium_users (user_id, is_premium, usage_count)
  VALUES (NEW.id, false, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create premium_user record on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_premium_user_exists();