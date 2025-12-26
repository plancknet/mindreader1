import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ThemeVariant = 'dark' | 'light';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeVariant>('dark');

  const setAndPersistTheme = useCallback((nextTheme: ThemeVariant) => {
    const root = document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as ThemeVariant | null) ?? 'dark';
    setAndPersistTheme(stored);
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
