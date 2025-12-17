-- Add mask display time column to user_videos table
ALTER TABLE public.user_videos
ADD COLUMN IF NOT EXISTS mask2_display_time numeric DEFAULT 0;

COMMENT ON COLUMN public.user_videos.mask2_display_time IS 'Time in seconds when the mask should appear in Eu Já Sabia 2';