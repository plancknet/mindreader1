-- Add specific columns for "Eu já sabia 2" game mask configuration
ALTER TABLE public.user_videos
ADD COLUMN IF NOT EXISTS mask2_offset_x numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mask2_offset_y numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mask2_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mask2_size numeric DEFAULT 1.2;