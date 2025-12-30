import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Moon, Sun, Languages as LanguagesIcon, LogOut, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const InfluencerCouponSetup = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [existingCode, setExistingCode] = useState<string | null>(null);
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();

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
          .select('coupon_generated, coupon_code')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          // User might be new, allow them to create coupon
          setEligible(true);
          setLoading(false);
          return;
        }

        if (data.coupon_generated && data.coupon_code) {
          setExistingCode(data.coupon_code);
          setEligible(false);
        } else {
          setEligible(true);
        }
      } catch (error) {
        console.error('Error loading profile', error);
        // Allow access even on error for new users
        setEligible(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, t]);

  const handleSubmit = async () => {
    try {
      if (!/^[A-Z0-9]{3,12}$/.test(code)) {
        toast.error(t('toasts.invalidCouponFormat'));
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

      toast.success(t('toasts.couponCreated'));
      navigate('/influencer/dashboard');
    } catch (error: any) {
      console.error('Error creating coupon', error);
      toast.error(error?.message || t('toasts.couldNotCreateCoupon'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-background text-foreground flex items-center justify-center"
        style={{ fontFamily: loginFontFamily }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-[#7f13ec]"></div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background pb-24 text-foreground"
      style={{ fontFamily: loginFontFamily }}
    >
      {/* Dark mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 dark:block hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>
      {/* Light mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 dark:hidden block">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Ticket className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-xl font-semibold text-foreground drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                {t('influencerCoupon.title')}
              </h1>
            </div>
            <div className="w-12" />
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 pt-6">
          <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">
                {t('influencerCoupon.heading')}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2 text-center">
                {t('influencerCoupon.description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingCode ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('influencerCoupon.alreadyActive')}</p>
                  <p className="text-3xl font-bold tracking-[0.3em] text-primary dark:text-[#7f13ec]">
                    {existingCode}
                  </p>
                  <Button
                    className="mt-4 bg-primary hover:bg-primary/90 dark:bg-[#7f13ec] dark:hover:bg-[#7f13ec]/90"
                    onClick={() => navigate('/influencer/dashboard')}
                  >
                    {t('influencerCoupon.viewDashboard')}
                  </Button>
                </div>
              ) : eligible ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('influencerCoupon.promoCode')}</label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={12}
                      placeholder={t('influencerCoupon.placeholder')}
                      className="border-border/50 bg-background/50 dark:border-white/10 dark:bg-white/5"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('influencerCoupon.hint')}
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || code.length < 3}
                    className="w-full bg-primary hover:bg-primary/90 dark:bg-[#7f13ec] dark:hover:bg-[#7f13ec]/90"
                  >
                    {submitting ? t('influencerCoupon.registering') : t('influencerCoupon.registerButton')}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  {t('influencerCoupon.noAccess')}
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/15 px-3 py-2 text-primary shadow-glow transition-colors hover:bg-primary/25 dark:border-[#7f13ec]/30 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)] dark:hover:bg-[#7f13ec]/25"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#7f13ec]/40 dark:hover:text-white"
          >
            <Moon className="hidden h-5 w-5 dark:block" />
            <Sun className="block h-5 w-5 dark:hidden" />
            <span>Mode</span>
          </button>
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#7f13ec]/40 dark:hover:text-white"
          >
            <LanguagesIcon className="h-5 w-5" />
            <span>{currentLanguage.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-red-400/50 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default InfluencerCouponSetup;
