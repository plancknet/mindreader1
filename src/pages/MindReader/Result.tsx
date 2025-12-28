import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const word = searchParams.get('word') || '';
  const { trackUsage } = useGameUsageTracker(GAME_IDS.MIND_READER);

  const formattedWord = useMemo(() => {
    const normalized = word.trim();
    if (!normalized) return '';
    return normalized
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [word]);

  useEffect(() => {
    trackUsage();
  }, [trackUsage]);

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
    const codes = languages.map(lang => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    setLanguage(nextCode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Failed to sign out', err);
    } finally {
      navigate('/');
    }
  };

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
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold text-foreground drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                MindReader
              </h1>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">
                {t('gameSelector.cards.mindReader.title')}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              {currentLanguage.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <Brain className="h-20 w-20 text-primary dark:text-[#d8b4fe] animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white md:text-4xl">
                {t('result.title')}
              </h1>
              <p className="text-base text-muted-foreground dark:text-white/70 md:text-xl">
                {t('result.subtitle')}
              </p>
            </div>

            <Card className="w-full rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/70 via-primary/60 to-background/95 p-10 text-center shadow-glow dark:border-[#f5c2ff]/30 dark:from-[#7f13ec]/70 dark:via-[#c084fc]/60 dark:to-[#0f111a]/95 dark:shadow-[0_25px_60px_rgba(127,19,236,0.35)]">
              <div className="space-y-6">
                <div className="text-3xl font-semibold tracking-tight text-primary-foreground drop-shadow-lg dark:text-[#ffe66d] dark:drop-shadow-[0_0_25px_rgba(255,230,109,0.8)] md:text-4xl">
                  {formattedWord}
                </div>
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full bg-primary-foreground dark:bg-white animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-4 text-center text-sm text-muted-foreground dark:text-white/70">
              <p>Magia? Não! Ciência aplicada.</p>
              <p>Mistério revelado com estilo.</p>
            </div>

            <div className="h-4" />
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

export default Result;
