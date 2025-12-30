import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Moon, Sun, Languages as LanguagesIcon, LogOut, Ticket, TrendingUp, Calendar, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';

interface Redemption {
  redeemed_at: string;
  amount: number;
}

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const InfluencerDashboard = () => {
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
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
    const loadData = async () => {
      if (adminLoading) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('coupon_generated, coupon_code')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          // User might be new without profile yet - redirect to coupon setup
          navigate('/influencer/coupon');
          return;
        }

        if (!profile.coupon_code) {
          // No coupon yet - redirect to coupon setup
          navigate('/influencer/coupon');
          return;
        }

        setIsInfluencer(true);
        setCouponCode(profile.coupon_code);
        setRedemptions([]);
      } catch (error) {
        console.error('Error loading influencer data', error);
        toast.error(t('toasts.couldNotLoadDashboard'));
        navigate('/game-selector');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, isAdmin, adminLoading, t]);

  const revenueSummary = useMemo(() => {
    const daily: Record<string, number> = {};
    const monthly: Record<string, number> = {};

    redemptions.forEach((redemption) => {
      const date = new Date(redemption.redeemed_at);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      daily[dayKey] = (daily[dayKey] || 0) + 1;
      monthly[monthKey] = (monthly[monthKey] || 0) + 1;
    });

    return {
      daily,
      monthly,
      total: redemptions.length,
      totalRevenue: redemptions.length * 6,
    };
  }, [redemptions]);

  const formatDate = (dateString: string) => {
    const locale = currentLanguage === 'pt-BR' ? 'pt-BR' : currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale);
  };

  const formatTime = (dateString: string) => {
    const locale = currentLanguage === 'pt-BR' ? 'pt-BR' : currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleTimeString(locale);
  };

  if (loading || adminLoading) {
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
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Ticket className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">
                {isAdmin ? t('influencerDashboard.adminLabel') : t('influencerDashboard.influencerLabel')}
              </p>
              <h1 className="text-xl font-semibold text-foreground drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                {isAdmin ? t('influencerDashboard.adminTitle') : t('influencerDashboard.title')}
              </h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 dark:border-[#7f13ec]/30 dark:bg-[#7f13ec]/10 dark:text-[#7f13ec] dark:hover:bg-[#7f13ec]/20"
                >
                  <Info className="h-4 w-4 mr-1" />
                  {t('influencerDashboard.instructions')}
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/50 bg-card dark:border-white/10 dark:bg-[#1e1b4b]/95">
                <DialogHeader>
                  <DialogTitle className="text-foreground dark:text-white">
                    {t('influencerDashboard.instructionsTitle')}
                  </DialogTitle>
                </DialogHeader>
                <ul className="space-y-3 text-sm text-muted-foreground dark:text-white/70">
                  <li className="flex gap-2">
                    <span className="text-primary dark:text-[#7f13ec] font-bold">1.</span>
                    {t('influencerDashboard.instruction1')}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary dark:text-[#7f13ec] font-bold">2.</span>
                    {t('influencerDashboard.instruction2')}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary dark:text-[#7f13ec] font-bold">3.</span>
                    {t('influencerDashboard.instruction3')}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary dark:text-[#7f13ec] font-bold">4.</span>
                    {t('influencerDashboard.instruction4')}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary dark:text-[#7f13ec] font-bold">5.</span>
                    {t('influencerDashboard.instruction5')}
                  </li>
                </ul>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pt-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {!isAdmin && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    {t('influencerDashboard.activeCoupon')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tracking-[0.3em] text-primary dark:text-[#7f13ec]">
                    {couponCode || '---'}
                  </p>
                </CardContent>
              </Card>
            )}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    {t('influencerDashboard.totalRedemptions')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground dark:text-white">{revenueSummary.total}</p>
                <p className="text-sm text-muted-foreground">
                  ${(revenueSummary.total * 6).toFixed(2)} {t('influencerDashboard.available')}
                  {isAdmin && ` (${t('influencerDashboard.allInfluencers')})`}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    {t('influencerDashboard.lastRedemption')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {redemptions[0] ? (
                  <>
                    <p className="text-lg font-semibold text-foreground dark:text-white">
                      {formatDate(redemptions[0].redeemed_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">+ $6.00</p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('influencerDashboard.noRecordsYet')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{t('influencerDashboard.dailySummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.keys(revenueSummary.daily).length === 0 && (
                  <p className="text-muted-foreground">{t('influencerDashboard.noRedemptions')}</p>
                )}
                {Object.entries(revenueSummary.daily).map(([day, count]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted-foreground">{formatDate(day)}</span>
                    <span className="font-medium">{count} {t('influencerDashboard.coupons')}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{t('influencerDashboard.monthlySummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.keys(revenueSummary.monthly).length === 0 && (
                  <p className="text-muted-foreground">{t('influencerDashboard.noRedemptions')}</p>
                )}
                {Object.entries(revenueSummary.monthly).map(([month, count]) => (
                  <div key={month} className="flex justify-between">
                    <span className="text-muted-foreground">{month.split('-').reverse().join('/')}</span>
                    <span className="font-medium">
                      {count} {t('influencerDashboard.coupons')} • ${(count * 6).toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent redemptions table */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('influencerDashboard.recentRedemptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 dark:border-white/10">
                    <TableHead className="text-muted-foreground">{t('influencerDashboard.date')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('influencerDashboard.time')}</TableHead>
                    <TableHead className="text-right text-muted-foreground">{t('influencerDashboard.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {t('influencerDashboard.noRedemptionsYet')}
                      </TableCell>
                    </TableRow>
                  )}
                  {redemptions.map((redemption) => (
                    <TableRow key={redemption.redeemed_at + Math.random()} className="border-border/50 dark:border-white/10">
                      <TableCell>{formatDate(redemption.redeemed_at)}</TableCell>
                      <TableCell>{formatTime(redemption.redeemed_at)}</TableCell>
                      <TableCell className="text-right font-medium">${(redemption.amount || 6).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default InfluencerDashboard;
