-- Criar tabela para controle de status premium
CREATE TABLE public.premium_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_type TEXT CHECK (premium_type IN ('one_time')),
  purchase_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.premium_users ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seu próprio status premium
CREATE POLICY "Users can view their own premium status"
ON public.premium_users
FOR SELECT
USING (auth.uid() = user_id);

-- Política: permitir inserção apenas através de funções autenticadas
CREATE POLICY "Service can insert premium users"
ON public.premium_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: permitir atualização apenas através de funções autenticadas
CREATE POLICY "Service can update premium users"
ON public.premium_users
FOR UPDATE
USING (auth.uid() = user_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_premium_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_premium_users_updated_at
BEFORE UPDATE ON public.premium_users
FOR EACH ROW
EXECUTE FUNCTION public.update_premium_users_updated_at();