DROP POLICY IF EXISTS "Service can insert leads" ON public.leads;

CREATE POLICY "Service role can insert leads"
ON public.leads
FOR INSERT
TO service_role
WITH CHECK (true);