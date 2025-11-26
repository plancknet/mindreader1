-- Add columns to user_videos table if they don't exist
alter table public.user_videos
  add column if not exists mask_offset_x numeric,
  add column if not exists mask_offset_y numeric,
  add column if not exists mask_color text;

-- Set default values for existing records
update public.user_videos
   set mask_offset_x = coalesce(mask_offset_x, 48),
       mask_offset_y = coalesce(mask_offset_y, 62),
       mask_color     = coalesce(mask_color, '#000000');