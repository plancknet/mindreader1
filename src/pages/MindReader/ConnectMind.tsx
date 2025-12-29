import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Camera, Brain, BookOpen, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useHeadPoseDetection } from '@/hooks/useHeadPoseDetection';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const ConnectMind = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const [isConnecting, setIsConnecting] = useState(false);
  const { videoRef, isModelLoading, error, cameraActive } = useHeadPoseDetection();

  useEffect(() => {
    if (cameraActive && !isModelLoading) {
      setIsConnecting(false);
    }
  }, [cameraActive, isModelLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cameraActive && !isModelLoading) {
      sessionStorage.setItem(STORAGE_KEYS.MINDREADER_CAMERA_READY, 'true');
    }
  }, [cameraActive, isModelLoading]);

  useEffect(() => {
    if (typeof window === 'undefined' || !error) return;
    sessionStorage.removeItem(STORAGE_KEYS.MINDREADER_CAMERA_READY);
  }, [error]);

  const handleConnect = () => {
    if (cameraActive && !isModelLoading) {
      navigate('/select-theme');
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
    console.log('Available languages:', codes);
    console.log('Current language:', currentLanguage);
    const currentIndex = codes.indexOf(currentLanguage);
    console.log('Current index:', currentIndex);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    console.log('Next language:', nextCode);
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
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pt-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground dark:text-white">
              {t('connectMind.title')}
            </h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isModelLoading && (
            <Card className="p-4 md:p-8 text-center border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95">
              <div className="space-y-2 md:space-y-4">
                <Camera className="w-12 h-12 md:w-16 md:h-16 mx-auto animate-pulse text-primary dark:text-[#7f13ec]" />
                <p className="text-sm md:text-lg text-muted-foreground dark:text-white/70">{t('connectMind.initializing')}</p>
              </div>
            </Card>
          )}

          <Card className="p-3 md:p-6 border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-sm md:text-lg">{t('connectMind.waitingCamera')}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleConnect}
              disabled={!cameraActive || isModelLoading || isConnecting}
              className="text-base md:text-xl px-6 py-4 md:px-8 md:py-6 w-full md:w-auto rounded-2xl"
            >
              <Brain className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              {t('connectMind.connectButton')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => navigate('/mind-reader/instructions', { state: { from: location.pathname } })}
              className="text-primary font-semibold hover:text-primary dark:text-[#7f13ec] dark:hover:text-[#d8b4fe]"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {t('connectMind.instructionsButton')}
            </Button>
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

export default ConnectMind;
