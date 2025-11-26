-- Add mask offset columns to user_videos table
alter table public.user_videos
  add column if not exists mask_offset_x numeric,
  add column if not exists mask_offset_y numeric;

-- Set default values for existing records
update public.user_videos
   set mask_offset_x = coalesce(mask_offset_x, 48),
       mask_offset_y = coalesce(mask_offset_y, 62);