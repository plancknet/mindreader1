-- Add font size configuration for the Eu Ja Sabia mask
alter table public.user_videos
  add column if not exists mask_font_size numeric default 1.2;

-- Backfill existing records with the default font size
update public.user_videos
   set mask_font_size = coalesce(mask_font_size, 1.2);
