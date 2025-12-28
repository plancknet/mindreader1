import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Brain, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { z } from 'zod';

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const CompleteSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  
  const isPasswordChange = searchParams.get('change') === 'true';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    if (url.hash === '#') {
      url.hash = '';
      if (url.searchParams.get('from') === 'email') {
        url.searchParams.delete('from');
      }
      const searchString = url.searchParams.toString();
      const cleanedPath = `${url.pathname}${searchString ? `?${searchString}` : ''}`;
      window.history.replaceState({}, document.title, cleanedPath);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        toast({
          title: 'Sessão inválida',
          description: 'Por favor, faça login novamente.',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    });
  }, [navigate, toast]);

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas digitadas não são iguais.',
        variant: 'destructive',
      });
      return;
    }

    const passwordSchema = z.string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(128, 'Senha muito longa')
      .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter número');

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: 'Senha inválida',
          description: firstError.message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: {
          needs_password_change: false
        }
      });

      if (error) throw error;

      toast({
        title: isPasswordChange ? 'Senha alterada!' : 'Cadastro concluído!',
        description: isPasswordChange 
          ? 'Sua nova senha foi definida com sucesso.'
          : 'Sua conta foi criada com sucesso.',
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar senha',
        description: error?.message || 'Ocorreu um erro ao definir sua senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return null;
  }

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

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 pt-6">
          <Card className="w-full border-border bg-card dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">
                {isPasswordChange ? 'Altere sua senha' : 'Complete seu cadastro'}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground dark:text-white/70">
                {isPasswordChange 
                  ? 'Por segurança, defina uma nova senha para sua conta'
                  : 'Defina uma senha para sua conta'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground dark:text-white">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isLoading}
                      required
                      minLength={8}
                      className="bg-background dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground dark:text-white">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isLoading}
                      required
                      minLength={8}
                      className="bg-background dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isPasswordChange ? 'Alterar senha' : 'Concluir cadastro'}
                </Button>
              </form>
            </CardContent>
          </Card>
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

export default CompleteSignup;
