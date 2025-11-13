import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageCount: number;
  freeLimit: number;
}

export const PaywallModal = ({ isOpen, onClose, usageCount, freeLimit }: PaywallModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado para continuar');
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
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o checkout...');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Limite Gratuito Atingido
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Você usou suas {freeLimit} revelações gratuitas. Desbloqueie o MindReader Premium e continue usando sem limites!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 my-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Revelações usadas:</span>
            <span className="text-lg font-bold">{usageCount} / {freeLimit}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm">Revelações ilimitadas</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm">Acesso a todos os temas premium</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm">Pagamento único - R$ 14,90 ou USD 3,00</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm">Acesso vitalício</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Desbloquear Agora
              </>
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Voltar
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          💳 Pagamento seguro processado pela Stripe
        </p>
      </DialogContent>
    </Dialog>
  );
};
