-- Add individual game counters and last access tracking to premium_users table
ALTER TABLE public.premium_users
ADD COLUMN jogo1_count integer NOT NULL DEFAULT 0,
ADD COLUMN jogo2_count integer NOT NULL DEFAULT 0,
ADD COLUMN jogo3_count integer NOT NULL DEFAULT 0,
ADD COLUMN jogo4_count integer NOT NULL DEFAULT 0,
ADD COLUMN last_accessed_at timestamp with time zone;

-- Create a function to calculate total count
CREATE OR REPLACE FUNCTION public.get_total_count(user_row premium_users)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT user_row.jogo1_count + user_row.jogo2_count + user_row.jogo3_count + user_row.jogo4_count;
$$;

-- Update existing records to have last_accessed_at
UPDATE public.premium_users
SET last_accessed_at = updated_at
WHERE last_accessed_at IS NULL;