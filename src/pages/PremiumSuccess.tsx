import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
      toast.error('Session ID não encontrado');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { sessionId },
      });

      if (error) throw error;

      if (data?.success) {
        setIsConfirmed(true);
        toast.success(data.message);
      } else {
        toast.error(data?.message || 'Não foi possível confirmar o pagamento');
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error('Erro ao verificar pagamento');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    navigate('/select-theme');
  };

  if (isVerifying) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <LanguageSelector />
          <LogoutButton />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg">Verificando seu pagamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LanguageSelector />
        <LogoutButton />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {isConfirmed ? 'Pagamento Confirmado! 🎉' : 'Processando Pagamento'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isConfirmed
              ? 'Você agora tem acesso completo ao MindReader Premium'
              : 'Aguarde enquanto confirmamos seu pagamento'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfirmed && (
            <>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Aproveite todas as funcionalidades premium do MindReader!
                </p>
              </div>
              <Button onClick={handleContinue} className="w-full" size="lg">
                Começar a usar
              </Button>
            </>
          )}
          {!isConfirmed && (
            <Button onClick={() => navigate('/premium')} variant="outline" className="w-full">
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
