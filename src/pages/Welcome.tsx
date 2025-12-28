import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, MessageCircle, Sparkles, ArrowRight, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();

  useEffect(() => {
    const markWelcomeSeenAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('users')
          .update({ has_seen_welcome: true })
          .eq('user_id', user.id);
        
        navigate('/game-selector');
      } catch (error) {
        console.error('Error updating welcome status:', error);
        navigate('/game-selector');
      }
    };

    markWelcomeSeenAndRedirect();
  }, [navigate]);

  const gameLinks = [
    {
      id: 'mystery-word',
      title: 'Palavra Misteriosa',
      icon: Sparkles,
      instructionsPath: '/mystery-word/instructions',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'mind-reader',
      title: 'Quadrante Mágico',
      icon: Brain,
      instructionsPath: '/mind-reader/instructions',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'mental-conversation',
      title: 'Conversa Mental',
      icon: MessageCircle,
      instructionsPath: '/mental-conversation/instructions',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const goHome = () => navigate('/');

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

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 pt-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground dark:text-white">
              Agora nos conseguiremos Ler Mentes!
            </h1>
            
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto dark:text-white/70">
              Bem-vindo! Explore cada jogo para descobrir seus poderes mentais. 
              IMPORTANTE: leia as instruções de cada modalidade e treine antes de apresentar aos seus amigos:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 w-full">
            {gameLinks.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(game.instructionsPath, { state: { from: location.pathname } })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(game.instructionsPath, { state: { from: location.pathname } });
                    }
                  }}
                  className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 dark:shadow-black/30 dark:hover:border-[#7f13ec]/50 dark:hover:shadow-[0_0_25px_rgba(127,19,236,0.15)] dark:focus-visible:ring-[#7f13ec]/60"
                >
                  <div className={`p-3 rounded-full bg-gradient-to-br ${game.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-center text-foreground group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-[#d8b4fe]">
                    {game.title}
                  </h3>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground group-hover:text-primary dark:text-white/70 dark:group-hover:text-[#d8b4fe]"
                  >
                    Ver Instruções
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            size="lg"
            className="h-14 px-12 text-lg rounded-2xl"
            onClick={() => navigate('/game-selector')}
          >
            Iniciar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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

export default Welcome;
