-- Configurar timezone para America/Sao_Paulo
-- Isso afeta todas as sessões de conexão para as roles principais

-- Define timezone para a role authenticator (usada pelo PostgREST/API)
ALTER ROLE authenticator SET timezone = 'America/Sao_Paulo';

-- Define timezone para a role postgres (admin)
ALTER ROLE postgres SET timezone = 'America/Sao_Paulo';

-- Define timezone para a role anon (usuários anônimos)
ALTER ROLE anon SET timezone = 'America/Sao_Paulo';

-- Define timezone para a role authenticated (usuários autenticados)
ALTER ROLE authenticated SET timezone = 'America/Sao_Paulo';

-- Define timezone para a role service_role
ALTER ROLE service_role SET timezone = 'America/Sao_Paulo';

-- Função helper para garantir que timestamps sejam retornados em timezone de São Paulo
CREATE OR REPLACE FUNCTION public.now_sao_paulo()
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  SELECT now() AT TIME ZONE 'America/Sao_Paulo';
$$;