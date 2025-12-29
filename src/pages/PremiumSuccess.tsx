import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, Sparkles, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const PremiumSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        toast.error(t('premiumSuccess.toast.invalidSession'));
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
        console.error('Error verifying payment', err);
        toast.error(t('premiumSuccess.toast.verificationError'));
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, navigate, t]);

  const handleContinue = () => {
    navigate('/welcome');
  };

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const cycleLanguage = () => {
    const codes = languages.map((lang) => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    setLanguage(nextCode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/game-selector');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ fontFamily: loginFontFamily }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-[#7f13ec]" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background pb-24 text-foreground"
      style={{ fontFamily: loginFontFamily }}
    >
      {/* Dark mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>
      {/* Light mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 block dark:hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 pt-6">
          <Card className="w-full border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-foreground dark:text-white">
                {status === 'success' ? t('premiumSuccess.successTitle') : t('premiumSuccess.errorTitle')}
              </CardTitle>
              <p className="text-muted-foreground dark:text-white/70">
                {status === 'success'
                  ? t('premiumSuccess.successDescription')
                  : t('premiumSuccess.errorDescription')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'success' ? (
                <Button className="w-full" onClick={handleContinue}>
                  {t('premiumSuccess.goToMindReader')}
                </Button>
              ) : (
                <Button className="w-full" variant="outline" onClick={() => navigate('/premium')}>
                  {t('premiumSuccess.backToPlans')}
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f111a]/95">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground dark:text-white/70">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-1 transition-colors hover:text-primary dark:hover:text-[#7f13ec]"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 transition-colors hover:text-primary dark:hover:text-[#7f13ec]"
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:block" />
            <span>{t('common.back').length > 0 ? 'Theme' : 'Tema'}</span>
          </button>
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex flex-col items-center gap-1 transition-colors hover:text-primary dark:hover:text-[#7f13ec]"
          >
            <LanguagesIcon className="h-5 w-5" />
            <span>{currentLanguage.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 transition-colors hover:text-primary dark:hover:text-[#7f13ec]"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default PremiumSuccess;
