import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast({
        title: t('auth.toast.authErrorTitle'),
        description: error?.message || t('auth.toast.loginGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="gap-2"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{t('common.logout')}</span>
    </Button>
  );
};
