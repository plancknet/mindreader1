-- Create table for Google Mime codes
CREATE TABLE IF NOT EXISTS public.google_mime_codes (
  id bigserial PRIMARY KEY,
  code text NOT NULL CHECK (char_length(code) = 3 AND code ~ '^[0-9]+$'),
  generated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster queries by generated_at
CREATE INDEX IF NOT EXISTS idx_google_mime_codes_generated_at ON public.google_mime_codes (generated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.google_mime_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read codes (needed to verify codes)
CREATE POLICY "Anyone can read google mime codes"
ON public.google_mime_codes
FOR SELECT
USING (true);

-- Allow authenticated users to insert codes
CREATE POLICY "Authenticated users can insert codes"
ON public.google_mime_codes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);