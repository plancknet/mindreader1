-- Create table to track usage per game and user
create table if not exists public.user_game_usage (
  user_id uuid not null references public.users(user_id) on delete cascade,
  game_id smallint not null,
  usage_count integer not null default 0,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint user_game_usage_pkey primary key (user_id, game_id)
);

alter table public.user_game_usage enable row level security;

create policy "Users can view their own game usage"
  on public.user_game_usage
  for select
  using (auth.uid() = user_id);

create policy "Users can track their own game usage"
  on public.user_game_usage
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own game usage"
  on public.user_game_usage
  for update
  using (auth.uid() = user_id);

create policy "Admins can read all game usage"
  on public.user_game_usage
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

create policy "Admins can manage all game usage"
  on public.user_game_usage
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Backfill existing counters for the first four games based on legacy columns
insert into public.user_game_usage (user_id, game_id, usage_count, last_used_at, created_at)
select user_id, 1, jogo1_count, coalesce(last_accessed_at, updated_at, now()), coalesce(updated_at, now())
from public.users
where coalesce(jogo1_count, 0) > 0
on conflict (user_id, game_id) do update
set usage_count = excluded.usage_count,
    last_used_at = excluded.last_used_at;

insert into public.user_game_usage (user_id, game_id, usage_count, last_used_at, created_at)
select user_id, 2, jogo2_count, coalesce(last_accessed_at, updated_at, now()), coalesce(updated_at, now())
from public.users
where coalesce(jogo2_count, 0) > 0
on conflict (user_id, game_id) do update
set usage_count = excluded.usage_count,
    last_used_at = excluded.last_used_at;

insert into public.user_game_usage (user_id, game_id, usage_count, last_used_at, created_at)
select user_id, 3, jogo3_count, coalesce(last_accessed_at, updated_at, now()), coalesce(updated_at, now())
from public.users
where coalesce(jogo3_count, 0) > 0
on conflict (user_id, game_id) do update
set usage_count = excluded.usage_count,
    last_used_at = excluded.last_used_at;

insert into public.user_game_usage (user_id, game_id, usage_count, last_used_at, created_at)
select user_id, 4, jogo4_count, coalesce(last_accessed_at, updated_at, now()), coalesce(updated_at, now())
from public.users
where coalesce(jogo4_count, 0) > 0
on conflict (user_id, game_id) do update
set usage_count = excluded.usage_count,
    last_used_at = excluded.last_used_at;
