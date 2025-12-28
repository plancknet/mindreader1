-- Create leads table for partner registrations
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  whatsapp text NOT NULL,
  ind_interagiu boolean NOT NULL DEFAULT false,
  ind_logou boolean NOT NULL DEFAULT false,
  ind_jogou boolean NOT NULL DEFAULT false,
  ind_criou_cupom boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_whatsapp ON public.leads(whatsapp);

-- RLS Policies
-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all leads  
CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow insert from edge function (service role)
CREATE POLICY "Service can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Users can view their own lead
CREATE POLICY "Users can view own lead"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);