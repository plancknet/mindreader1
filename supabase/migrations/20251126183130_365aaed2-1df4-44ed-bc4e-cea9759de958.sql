-- Add mask_color column to user_videos table
alter table public.user_videos
  add column if not exists mask_color text;

-- Set default value for existing records
update public.user_videos
   set mask_color = coalesce(mask_color, '#000000');