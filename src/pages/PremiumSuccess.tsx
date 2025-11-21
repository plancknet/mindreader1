import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { HeaderControls } from '@/components/HeaderControls';

const PremiumSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        toast.error('Sessão inválida.');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.functions.invoke('verify-payment', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { sessionId },
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Erro ao verificar pagamento', err);
        toast.error('Não foi possível confirmar o pagamento.');
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  const handleContinue = () => {
    navigate('/welcome');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="fixed top-4 right-4 z-50">
        <HeaderControls />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {status === 'success' ? 'Pagamento confirmado!' : 'Algo deu errado'}
          </CardTitle>
          <p className="text-muted-foreground">
            {status === 'success'
              ? 'Seu acesso premium foi ativado com sucesso.'
              : 'Não foi possível confirmar seu pagamento. Tente novamente.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' ? (
            <Button className="w-full" onClick={handleContinue}>
              Ir para o MindReader
            </Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => navigate('/premium')}>
              Voltar para planos
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumSuccess;
