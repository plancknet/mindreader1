-- Add usage_count column to premium_users table
ALTER TABLE public.premium_users 
ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN public.premium_users.usage_count IS 'Number of revelations used by the user';