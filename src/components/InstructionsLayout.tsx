import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';

interface InstructionsLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  backPath: string;
  backLabel?: string;
}

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

export const InstructionsLayout = ({
  children,
  title,
  subtitle,
  label,
  icon: Icon,
  backPath,
  backLabel = 'Voltar para o jogo',
}: InstructionsLayoutProps) => {
  const navigate = useNavigate();
  const { language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();

  const homeLabel = backLabel ?? 'Home';

  const goHome = () => navigate(backPath || '/');

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
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pt-6">
          {/* Title section */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary dark:text-[#7f13ec]">
              {label}
            </p>
            <h1 className="text-3xl font-bold text-foreground drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}

        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/15 px-3 py-2 text-primary shadow-glow transition-colors hover:bg-primary/25 dark:border-[#7f13ec]/30 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)] dark:hover:bg-[#7f13ec]/25"
          >
            <Home className="h-5 w-5" />
            <span>{homeLabel}</span>
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
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export const InstructionsCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-border bg-card p-6 shadow-lg dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 dark:shadow-black/30 ${className}`}
  >
    {children}
  </div>
);

export const InstructionsSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="space-y-4">
    {title && (
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary dark:text-[#7f13ec]">
        {title}
      </p>
    )}
    {children}
  </div>
);

export const InstructionStep = ({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) => (
  <div className="flex gap-3">
    <span className="text-sm font-semibold text-primary dark:text-[#7f13ec]">{number}.</span>
    <p className="text-foreground/90">{children}</p>
  </div>
);

export const InstructionParagraph = ({ children }: { children: ReactNode }) => (
  <p className="text-foreground/90">{children}</p>
);

export const InstructionNote = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);
