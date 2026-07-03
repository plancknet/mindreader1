CREATE TABLE public.app_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null unique default true,
  design_variant text not null default 'classic' check (design_variant in ('classic','noir')),
  theme_mode text not null default 'light' check (theme_mode in ('light','dark')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update app settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.app_settings (singleton) VALUES (true) ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;