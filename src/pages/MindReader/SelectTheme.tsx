import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@/data/themes';
import { Brain, Loader2, Home, Moon, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { PaywallModal } from '@/components/PaywallModal';
import { Card } from '@/components/ui/card';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const SelectTheme = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const { usageData, isLoading, checkUsageLimit } = useUsageLimit();
  const [showPaywall, setShowPaywall] = useState(false);

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-light');
  };

  const cycleLanguage = () => {
    const codes = languages.map((lang) => lang.code);
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

  const handleThemeSelect = (themeId: string) => {
    if (usageData && !usageData.canUse && !usageData.isPremium) {
      setShowPaywall(true);
      return;
    }

    navigate(`/start-prompt?theme=${themeId}`);
  };

  useEffect(() => {
    checkUsageLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f111a]" style={{ fontFamily: loginFontFamily }}>
        <Loader2 className="h-10 w-10 animate-spin text-[#7f13ec]" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        usageCount={usageData?.usageCount || 0}
        freeLimit={usageData?.freeLimit || 3}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0f111a]/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-[#7f13ec]/20 bg-[#7f13ec]/15 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                MindReader
              </h1>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
              {language.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pt-6">
          <div className="text-center text-white/80">{t('selectTheme.subtitle')}</div>

          <div className="grid gap-4 sm:grid-cols-2">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1b4b]/85 to-[#0f111a]/95 p-5 text-center shadow-lg shadow-black/30 transition-all hover:border-[#7f13ec]/40 hover:shadow-[0_0_25px_rgba(127,19,236,0.15)]"
              >
                <div className="text-6xl drop-shadow">{theme.emoji}</div>
                <h2 className="text-xl font-semibold text-white group-hover:text-[#d8b4fe]">
                  {theme.name[language] || theme.name['pt-BR']}
                </h2>
                <p className="text-sm text-white/60">{t('selectTheme.tip')}</p>
              </Card>
            ))}
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

export default SelectTheme;
