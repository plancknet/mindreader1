import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeaderControls } from '@/components/HeaderControls';
import { toast } from 'sonner';

const InfluencerCouponSetup = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [existingCode, setExistingCode] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        const { data, error } = await supabase
          .from('users')
          .select('subscription_tier, coupon_generated, coupon_code')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          throw error;
        }

        if (data.subscription_tier !== 'INFLUENCER') {
          navigate('/game-selector');
          return;
        }

        if (data.coupon_generated && data.coupon_code) {
          setExistingCode(data.coupon_code);
        } else {
          setEligible(true);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil', error);
        navigate('/game-selector');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      if (!/^[A-Z0-9]{3,12}$/.test(code)) {
        toast.error('Use apenas letras maiúsculas e números (3 a 12 caracteres).');
        return;
      }

      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase.functions.invoke('create-influencer-coupon', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { code },
      });

      if (error) {
        throw error;
      }

      toast.success('Cupom criado com sucesso!');
      navigate('/influencer/dashboard');
    } catch (error: any) {
      console.error('Erro ao criar cupom', error);
      toast.error(error?.message || 'Não foi possível criar o cupom.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <HeaderControls />
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Configure seu cupom de influencer</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Defina o código que você compartilhará com seus seguidores. Ele oferece 30% de desconto e garante R$ 6,00 por resgate pago.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingCode ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Seu cupom já está ativo:</p>
                <p className="text-3xl font-bold tracking-widest">{existingCode}</p>
                <Button className="mt-4" onClick={() => navigate('/influencer/dashboard')}>
                  Ver painel de cupons
                </Button>
              </div>
            ) : eligible ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código promocional</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={12}
                    placeholder="EX: MINDREADER10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Somente letras maiúsculas e números. Máximo de 12 caracteres.
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || code.length < 3}
                  className="w-full"
                >
                  {submitting ? 'Registrando...' : 'Registrar cupom'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Você não possui acesso a esta funcionalidade.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfluencerCouponSetup;
