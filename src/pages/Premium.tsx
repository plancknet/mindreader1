import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Home, Moon, Sun, Languages as LanguagesIcon, LogOut, Loader2, AlertCircle, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hasMainProduct, type SubscriptionTier } from '@/lib/gameAccess';
import { priceLabel, startOfferCheckout, takePendingCheckout, type OfferItem } from '@/lib/checkout';
import { getOfferCopy } from './oferta/copy';
import { PricingCard } from './oferta/PricingCard';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

interface Ownership {
  tier: SubscriptionTier;
  hasEuJaSabia2: boolean;
}

const Premium = () => {
  const [owned, setOwned] = useState<Ownership | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const resumedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const copy = getOfferCopy(currentLanguage);

  const blockState = location.state as { blockReason?: string; gameTitle?: string } | null;

  const buy = async (items: OfferItem[]) => {
    setCheckoutLoading(true);
    try {
      const result = await startOfferCheckout(items, currentLanguage);
      if (result === 'needs_auth') navigate('/auth');
      if (result === 'already_owned') toast.info(copy.premium.alreadyOwned);
    } catch (error) {
      console.error('Error starting checkout', error);
      toast.error(copy.premium.errorCheckout);
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        const { data } = await supabase
          .from('users')
          .select('subscription_tier, has_eu_ja_sabia_2')
          .eq('user_id', user.id)
          .maybeSingle();
        const tier = (data?.subscription_tier as SubscriptionTier) ?? 'FREE';
        const ownership = {
          tier,
          hasEuJaSabia2: Boolean(data?.has_eu_ja_sabia_2) || tier === 'INFLUENCER',
        };
        setOwned(ownership);

        // Resume a purchase the visitor started on the sales page before signing in
        if (!resumedRef.current) {
          resumedRef.current = true;
          const pending = takePendingCheckout();
          if (pending?.length) {
            const toBuy = pending.filter(
              (item) => !(item === 'MAIN' && hasMainProduct(tier)) && !(item === 'EJS2' && ownership.hasEuJaSabia2),
            );
            if (toBuy.length) void buy(toBuy);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const cycleLanguage = () => {
    const codes = languages.map((lang) => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    setLanguage(codes[(currentIndex + 1) % codes.length] ?? codes[0]);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" style={{ fontFamily: loginFontFamily }}>
        <Loader2 className="h-8 w-8 animate-spin text-magic" />
      </div>
    );
  }

  const hasMain = owned ? hasMainProduct(owned.tier) : false;
  const hasEjs2 = owned?.hasEuJaSabia2 ?? false;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28 text-foreground" style={{ fontFamily: loginFontFamily }}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-magic/20 blur-[120px]" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-magic/20 bg-magic/15 text-magic shadow-magic">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-6">
          {blockState?.blockReason && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {blockState.gameTitle ? <strong>{blockState.gameTitle}: </strong> : null}
                {blockState.blockReason === 'needs_ejs2' ? copy.premium.blockedEjs2 : copy.premium.blockedMain}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-magic">{copy.premium.kicker}</p>
            <h1 className="text-3xl font-bold md:text-4xl">{copy.premium.title}</h1>
            <p className="text-muted-foreground">{copy.premium.subtitle}</p>
          </div>

          {!hasMain && (
            <PricingCard copy={copy} language={currentLanguage} loading={checkoutLoading} onBuy={buy} />
          )}

          {hasMain && (
            <div className="rounded-3xl border border-success/30 bg-success/5 p-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
              <p className="mt-2 font-semibold">{hasEjs2 ? copy.premium.allSet : copy.premium.owned}</p>
              <Button className="mt-4 w-full rounded-2xl" onClick={goHome}>
                {copy.premium.continue}
              </Button>
            </div>
          )}

          {hasMain && !hasEjs2 && (
            <div className="rounded-3xl border border-magic/30 bg-card p-6 shadow-magic">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-magic text-magic-foreground">
                  <Hash className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-bold">{copy.premium.upsellTitle}</p>
                  <p className="text-2xl font-bold text-magic">{priceLabel('EJS2', currentLanguage)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{copy.premium.upsellText}</p>
              <Button
                size="lg"
                disabled={checkoutLoading}
                onClick={() => buy(['EJS2'])}
                className="mt-5 h-12 w-full rounded-2xl bg-gradient-magic font-bold text-magic-foreground hover:opacity-95"
              >
                {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : copy.premium.upsellButton}
              </Button>
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground">
          <button type="button" onClick={goHome} className="flex flex-col items-center gap-2 rounded-2xl border border-magic/30 bg-magic/15 px-3 py-2 text-magic">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button type="button" onClick={toggleTheme} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 hover:text-foreground">
            <Moon className="hidden h-5 w-5 dark:block" />
            <Sun className="block h-5 w-5 dark:hidden" />
            <span>Mode</span>
          </button>
          <button type="button" onClick={cycleLanguage} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 hover:text-foreground">
            <LanguagesIcon className="h-5 w-5" />
            <span>{currentLanguage.toUpperCase()}</span>
          </button>
          <button type="button" onClick={handleLogout} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 hover:text-foreground">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Premium;
