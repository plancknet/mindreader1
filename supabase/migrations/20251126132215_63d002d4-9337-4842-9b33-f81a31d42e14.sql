-- Create table for user custom videos
create table public.user_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_data text not null,
  created_at timestamptz not null default now()
);

-- Create unique index to ensure one video per user
create unique index user_videos_user_id_key on public.user_videos (user_id);

-- Enable RLS
alter table public.user_videos enable row level security;

-- RLS Policies
create policy "Users can view their own videos"
  on public.user_videos
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own videos"
  on public.user_videos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own videos"
  on public.user_videos
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own videos"
  on public.user_videos
  for delete
  using (auth.uid() = user_id);