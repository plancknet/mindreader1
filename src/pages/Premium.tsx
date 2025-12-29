import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Infinity, Shield, Sparkles, Home, Moon, Sun, Languages as LanguagesIcon, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

interface UserProfile {
  is_premium: boolean;
  has_seen_welcome: boolean | null;
  premium_type: string | null;
  subscription_tier: 'FREE' | 'STANDARD' | 'INFLUENCER';
  subscription_status: string;
  plan_confirmed: boolean;
}

const Premium = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [freeLoading, setFreeLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'STANDARD' | 'INFLUENCER' | null>(null);
  const { usageData, isLoading: usageLoading, checkUsageLimit } = useUsageLimit();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();

  // Get block reason from navigation state
  const blockState = location.state as { blockReason?: string; gameTitle?: string; gameDifficulty?: number } | null;

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
        .select('is_premium, has_seen_welcome, premium_type, subscription_tier, subscription_status, plan_confirmed')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile', error);
        toast.error(t('premium.toast.errorLoadingProfile'));
        return;
      }

      setProfile({
        is_premium: !!data?.is_premium,
        has_seen_welcome: data?.has_seen_welcome ?? false,
        premium_type: data?.premium_type ?? null,
        subscription_tier: (data?.subscription_tier as 'FREE' | 'STANDARD' | 'INFLUENCER') ?? 'FREE',
        subscription_status: data?.subscription_status ?? 'inactive',
        plan_confirmed: data?.plan_confirmed ?? false,
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
      if (!user) throw new Error(t('premium.toast.userNotAuthenticated'));

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
        console.error('Error details:', error);
        throw error;
      }
      
      toast.success(t('premium.toast.freeActivated'));
      await checkUsageLimit();
      navigate(firstAccess ? '/welcome' : '/game-selector');
    } catch (error: any) {
      console.error('Error saving Free plan', error);
      toast.error(error?.message || t('premium.toast.errorConfirming'));
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
      console.error('Error starting checkout', error);
      toast.error(error?.message || t('premium.toast.errorCheckout'));
    } finally {
      setCheckoutLoading(null);
    }
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

  if (loading || usageLoading) {
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

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-6">
          {/* Block reason alert */}
          {blockState?.blockReason && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 dark:border-red-500/30 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">
                {blockState.gameTitle ? t('premium.blockAlert.gameUnavailable', { gameTitle: blockState.gameTitle }) : t('premium.blockAlert.gameBlocked')}
              </AlertTitle>
              <AlertDescription>
                {blockState.blockReason.startsWith('blocked_difficulty_') ? (
                  blockState.gameDifficulty === 5 
                    ? t('premium.blockAlert.influencerOnly')
                    : blockState.gameDifficulty === 4
                      ? t('premium.blockAlert.standardRequired')
                      : t('premium.blockAlert.higherPlanRequired')
                ) : blockState.blockReason.startsWith('limit_reached_') ? (
                  t('premium.blockAlert.limitReached')
                ) : (
                  t('premium.blockAlert.specialPermissions')
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary dark:text-[#7f13ec]">{t('premium.chooseMode')}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white">{t('premium.title')}</h1>
            <p className="text-muted-foreground text-base dark:text-white/70">
              {t('premium.subtitle')}
            </p>
          </div>

          <div className={`grid gap-6 ${profile?.subscription_tier === 'STANDARD' || profile?.subscription_tier === 'INFLUENCER' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {/* Free Plan - Hidden for STANDARD and INFLUENCER users */}
            {profile?.subscription_tier !== 'STANDARD' && profile?.subscription_tier !== 'INFLUENCER' && (
              <Card className={`border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 ${profile?.subscription_tier === 'FREE' ? 'ring-2 ring-primary dark:ring-[#7f13ec]' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary dark:text-[#7f13ec] font-semibold">
                    <Shield className="w-5 h-5" />
                    {t('premium.freePlan.name')}
                    {profile?.subscription_tier === 'FREE' && (
                      <span className="ml-auto text-xs bg-primary/10 dark:bg-[#7f13ec]/10 text-primary dark:text-[#7f13ec] px-2 py-1 rounded">{t('premium.yourPlan')}</span>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground dark:text-white">{t('premium.freePlan.price')}</CardTitle>
                  <p className="text-muted-foreground text-sm dark:text-white/60">{t('premium.freePlan.description')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground dark:text-white/70">
                    {(t('premium.freePlan.features') as string[]).map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary dark:text-[#7f13ec]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={profile?.subscription_tier === 'FREE' ? 'default' : 'outline'}
                    onClick={handleFreePlan}
                    disabled={freeLoading}
                    className="w-full"
                  >
                    {freeLoading
                      ? t('premium.freePlan.confirming')
                      : profile?.subscription_tier === 'FREE'
                        ? t('premium.freePlan.continueButton')
                        : t('premium.freePlan.selectButton')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Standard Plan */}
            <Card className={`border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 shadow-lg ${profile?.subscription_tier === 'STANDARD' ? 'ring-2 ring-orange-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-2 text-orange-500 font-semibold">
                  <Infinity className="w-5 h-5" />
                  {t('premium.standardPlan.name')}
                  {profile?.subscription_tier === 'STANDARD' && (
                    <span className="ml-auto text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">{t('premium.yourPlan')}</span>
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-foreground dark:text-white">{t('premium.standardPlan.price')}</CardTitle>
                <p className="text-muted-foreground text-sm dark:text-white/60">{t('premium.standardPlan.description')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-white/70">
                  {(t('premium.standardPlan.features') as string[]).map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => profile?.subscription_tier === 'STANDARD' ? navigate('/game-selector') : startCheckout('STANDARD')}
                  disabled={checkoutLoading === 'STANDARD'}
                  className="w-full bg-orange-500 hover:bg-orange-500/90"
                >
                  {checkoutLoading === 'STANDARD'
                    ? t('premium.standardPlan.redirecting')
                    : profile?.subscription_tier === 'STANDARD'
                      ? t('premium.standardPlan.continueButton')
                      : t('premium.standardPlan.subscribeButton')}
                </Button>
              </CardContent>
            </Card>

            {/* Influencer Plan */}
            <Card className={`border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 shadow-lg ${profile?.subscription_tier === 'INFLUENCER' ? 'ring-2 ring-purple-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-2 text-purple-500 font-semibold">
                  <Sparkles className="w-5 h-5" />
                  {t('premium.influencerPlan.name')}
                  {profile?.subscription_tier === 'INFLUENCER' && (
                    <span className="ml-auto text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">{t('premium.yourPlan')}</span>
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-foreground dark:text-white">{t('premium.influencerPlan.price')}</CardTitle>
                <p className="text-muted-foreground text-sm dark:text-white/60">
                  {profile?.subscription_tier === 'INFLUENCER' && profile.subscription_status === 'past_due'
                    ? t('premium.influencerPlan.paymentPending')
                    : t('premium.influencerPlan.description')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-white/70">
                  {(t('premium.influencerPlan.features') as string[]).map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {profile?.subscription_tier === 'INFLUENCER' && profile.subscription_status === 'past_due' ? (
                  <Button
                    variant="destructive"
                    onClick={() => toast.info(t('premium.toast.updatePaymentInfo'))}
                    className="w-full"
                  >
                    {t('premium.influencerPlan.updatePaymentButton')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => profile?.subscription_tier === 'INFLUENCER' && profile.subscription_status === 'active' ? navigate('/game-selector') : startCheckout('INFLUENCER')}
                    disabled={checkoutLoading === 'INFLUENCER'}
                    className="w-full bg-purple-600 hover:bg-purple-600/90"
                  >
                    {checkoutLoading === 'INFLUENCER'
                      ? t('premium.influencerPlan.redirecting')
                      : profile?.subscription_tier === 'INFLUENCER' && profile.subscription_status === 'active'
                        ? t('premium.influencerPlan.continueButton')
                        : t('premium.influencerPlan.subscribeButton')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f111a]/95">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground dark:text-white/70">
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
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-red-400/50 dark:hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Premium;
