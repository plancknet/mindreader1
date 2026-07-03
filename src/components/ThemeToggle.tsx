import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalDesign } from '@/hooks/useGlobalDesign';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export const ThemeToggle = () => {
  const { themeMode, setThemeMode } = useGlobalDesign();
  const { isAdmin } = useIsAdmin();

  if (!isAdmin) return null;

  const toggle = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={themeMode === 'dark' ? 'Ativar modo claro (global)' : 'Ativar modo escuro (global)'}
      title="Alternar modo claro/escuro global (Admin)"
    >
      {themeMode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
