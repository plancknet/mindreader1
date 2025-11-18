import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function Premium() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { language } = useTranslation();
  const normalizedLanguage = language?.toLowerCase() ?? '';
  const isPortuguese = normalizedLanguage.startsWith('pt');
  const premiumPrice = isPortuguese ? 'R$ 29,99' : 'USD 5,99';

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.is_premium) {
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/connect-mind');
  };

  if (checkingStatus) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <LanguageSelector />
          <LogoutButton />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <LanguageSelector />
          <LogoutButton />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Você já é Premium! 🎉</CardTitle>
            <CardDescription>
              Aproveite todas as funcionalidades avançadas do MindReader
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continuar para o App
            </Button>
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
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">MindReader Premium</CardTitle>
          <CardDescription className="text-lg mt-2">
            Desbloqueie o modo avançado e veja o impossível
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Pagamento único</p>
            <p className="text-4xl font-bold">{premiumPrice}</p>
            <p className="text-sm text-muted-foreground mt-2">Acesso vitalício</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm">Modo avançado de leitura de mentes</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm">Acesso a todos os temas premium</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm">Suporte prioritário</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm">Atualizações gratuitas para sempre</p>
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecionando para checkout...
              </>
            ) : (
              'Desbloquear agora'
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Pagamento seguro processado pela Stripe
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Política de Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Termos de Uso
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
