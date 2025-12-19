import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, RotateCcw, BookOpen, Home, Moon, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { toast } from 'sonner';
import { GAME_IDS } from '@/constants/games';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const word = searchParams.get('word') || '';
  const { incrementUsage } = useUsageLimit();

  useEffect(() => {
    const incrementCount = async () => {
      try {
        await incrementUsage(GAME_IDS.MIND_READER);
      } catch (error) {
        console.error('Error incrementing usage:', error);
        toast.error('Erro ao registrar revelacao');
      }
    };

    void incrementCount();
  }, [incrementUsage]);

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-light');
  };

  const cycleLanguage = () => {
    const codes = languages.map(lang => lang.code);
    const currentIndex = codes.indexOf(language);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    setLanguage(nextCode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/');
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0f111a]/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-[#7f13ec]/20 bg-[#7f13ec]/15 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                MindReader
              </h1>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/70">
                {t('gameSelector.cards.mindReader.title')}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
              {language.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <Brain className="h-20 w-20 text-[#d8b4fe] animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                {t('result.title')}
              </h1>
              <p className="text-base text-white/70 md:text-xl">
                {t('result.subtitle')}
              </p>
            </div>

            <Card className="w-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e1b4b]/90 to-[#0f111a]/95 p-10 text-center shadow-2xl shadow-black/30">
              <div className="space-y-6">
                <div className="text-5xl font-bold uppercase tracking-widest text-white drop-shadow-lg md:text-6xl">
                  {word}
                </div>
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full bg-white animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-4 text-center text-sm text-white/70">
              <p>Magia? Nao! Ciencia aplicada.</p>
              <p>Misterio revelado com estilo.</p>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[180px] rounded-2xl border border-[#7f13ec]/30 bg-[#7f13ec] text-white shadow-[0_12px_30px_rgba(127,19,236,0.35)] hover:bg-[#7f13ec]/90"
                onClick={() => navigate('/select-theme')}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                {t('common.playAgain')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[180px] rounded-2xl border border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:text-white"
                onClick={() => navigate('/')}
              >
                {t('common.backHome')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[180px] rounded-2xl border border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:text-white"
                onClick={() => navigate('/mind-reader/instructions', { state: { from: location.pathname } })}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                {t('connectMind.instructionsButton')}
              </Button>
            </div>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#0f111a]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-white/70">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#7f13ec]/30 bg-[#7f13ec]/15 px-3 py-2 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)] transition-colors hover:bg-[#7f13ec]/25"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <Moon className="h-5 w-5" />
            <span>Mode</span>
          </button>
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <LanguagesIcon className="h-5 w-5" />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-red-400/50 hover:text-white"
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
