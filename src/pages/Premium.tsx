import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Infinity, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { HeaderControls } from '@/components/HeaderControls';
import { useUsageLimit } from '@/hooks/useUsageLimit';

interface UserProfile {
  is_premium: boolean;
  has_seen_welcome: boolean | null;
  premium_type: string | null;
}

const PLAN_FEATURES = {
  FREE: [
    'Uso limitado a 3 vezes',
    'Palavra Misteriosa - Modos 1, 2 e 3',
    'Quadrante Mágico - Modos 1 e 2',
  ],
  STANDARD: [
    'Uso vitalício ilimitado',
    'Todos os modos da Palavra Misteriosa',
    'Quadrante Mágico (Modos 1 e 2)',
    'Conversa Mental (Nível 2)',
    'Mix de Cartas (Nível 3)',
    'Todas as atualizações futuras',
    'Suporte Premium',
  ],
  INFLUENCER: [
    'Todos os recursos do Vitalício',
    'Cupons com 30% de desconto para seguidores',
    'R$ 6,00 por cupom pago',
    'Desenvolvimento de novas ideias',
    'Recursos disponíveis enquanto for assinante',
    'Grupo de WhatsApp dos iMindReaders',
  ],
};

const Premium = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [freeLoading, setFreeLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'STANDARD' | 'INFLUENCER' | null>(null);
  const { usageData, isLoading: usageLoading, checkUsageLimit } = useUsageLimit();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('is_premium, has_seen_welcome, premium_type')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil', error);
        toast.error('Não foi possível carregar suas informações.');
        return;
      }

      setProfile({
        is_premium: !!data?.is_premium,
        has_seen_welcome: data?.has_seen_welcome ?? false,
        premium_type: data?.premium_type ?? null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFreePlan = async () => {
    try {
      setFreeLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const firstAccess = !profile?.has_seen_welcome;

      const { error } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          email: user.email,
          is_premium: false,
          premium_type: null,
          has_seen_welcome: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }
      
      toast.success('Modo Free ativado.');
      await checkUsageLimit();
      navigate(firstAccess ? '/welcome' : '/game-selector');
    } catch (error: any) {
      console.error('Erro ao salvar plano Free', error);
      toast.error(error?.message || 'Não foi possível confirmar sua escolha.');
    } finally {
      setFreeLoading(false);
    }
  };

  const startCheckout = async (planType: 'STANDARD' | 'INFLUENCER') => {
    try {
      setCheckoutLoading(planType);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { planType },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Erro ao iniciar checkout', error);
      toast.error(error?.message || 'Não foi possível iniciar o pagamento.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading || usageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-8">
        <HeaderControls />

        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Escolha seu modo</p>
          <h1 className="text-4xl md:text-5xl font-bold">Como você quer jogar hoje?</h1>
          <p className="text-muted-foreground text-lg">
            Selecione um dos planos abaixo para continuar usando o MindReader.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary/20 bg-background/70">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Shield className="w-5 h-5" />
                Plano Free
              </div>
              <CardTitle className="text-3xl font-bold">R$ 0</CardTitle>
              <p className="text-muted-foreground text-sm">Uso limitado a três execuções</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLAN_FEATURES.FREE.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={handleFreePlan}
                disabled={freeLoading || (usageData ? usageData.usageCount >= usageData.freeLimit : false)}
                className="w-full"
              >
                {usageData && usageData.usageCount >= usageData.freeLimit
                  ? 'Limite atingido'
                  : freeLoading
                    ? 'Confirmando...'
                    : 'Continuar no Free'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-background/70 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 text-orange-500 font-semibold">
                <Infinity className="w-5 h-5" />
                Vitalício
              </div>
              <CardTitle className="text-3xl font-bold">R$ 29,90</CardTitle>
              <p className="text-muted-foreground text-sm">Pagamento único</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLAN_FEATURES.STANDARD.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => startCheckout('STANDARD')}
                disabled={checkoutLoading === 'STANDARD'}
                className="w-full bg-orange-500 hover:bg-orange-500/90"
              >
                {checkoutLoading === 'STANDARD' ? 'Redirecionando...' : 'Assinar Vitalício'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-background/70 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 text-purple-500 font-semibold">
                <Sparkles className="w-5 h-5" />
                Influencer
              </div>
              <CardTitle className="text-3xl font-bold">R$ 29,90/mês</CardTitle>
              <p className="text-muted-foreground text-sm">Tudo do Vitalício + monetização</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLAN_FEATURES.INFLUENCER.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => startCheckout('INFLUENCER')}
                disabled={checkoutLoading === 'INFLUENCER'}
                className="w-full bg-purple-600 hover:bg-purple-600/90"
              >
                {checkoutLoading === 'INFLUENCER' ? 'Redirecionando...' : 'Assinar Influencer'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;
