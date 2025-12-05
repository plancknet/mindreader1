import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ThemeVariant = 'dark' | 'light';

const applyThemeClasses = (theme: ThemeVariant) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('theme-light');
  } else {
    root.classList.remove('theme-light');
    root.classList.add('dark');
  }
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeVariant>('dark');

  const setAndPersistTheme = useCallback((nextTheme: ThemeVariant) => {
    applyThemeClasses(nextTheme);
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as ThemeVariant | null) ?? 'dark';
    setAndPersistTheme(stored === 'light' ? 'light' : 'dark');
  }, [setAndPersistTheme]);

  const toggleTheme = () => {
    setAndPersistTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
