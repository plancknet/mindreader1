create table if not exists public.google_mime_codes (
  id bigserial primary key,
  code text not null check (char_length(code) = 3 and code ~ '^[0-9]+$'),
  generated_at timestamptz not null default now()
);

create index if not exists idx_google_mime_codes_generated_at on public.google_mime_codes (generated_at desc);

