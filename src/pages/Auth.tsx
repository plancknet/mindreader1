import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { z } from 'zod';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/connect-mind', { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event !== 'SIGNED_OUT') {
        navigate('/connect-mind', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleOAuthLogin = async (provider: 'google') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/connect-mind`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: t('auth.toast.loginErrorTitle'),
        description: error?.message === 'Popup closed'
          ? t('auth.toast.loginCancelled')
          : t('auth.toast.loginGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!isSignUp) return;

    if (!email) {
      toast({
        title: t('auth.toast.missingEmailTitle'),
        description: t('auth.toast.missingEmailDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um endereço de email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/connect-mind`,
        },
      });

      if (error) throw error;

      toast({
        title: t('auth.toast.magicLinkSentTitle'),
        description: t('auth.toast.magicLinkSentDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.toast.authErrorTitle'),
        description: t('auth.toast.loginGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t('auth.toast.missingEmailTitle'),
        description: t('auth.toast.missingEmailDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um endereço de email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/connect-mind`,
      });

      if (error) throw error;

      toast({
        title: t('auth.toast.resetLinkSentTitle'),
        description: t('auth.toast.resetLinkSentDescription'),
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: t('auth.toast.authErrorTitle'),
        description: t('auth.toast.loginGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: t('auth.toast.missingFieldsTitle'),
        description: t('auth.toast.missingFieldsDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validate email and password with zod
    const authSchema = z.object({
      email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
      password: z.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .max(128, 'Senha muito longa')
        .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter letra minúscula')
        .regex(/[0-9]/, 'Senha deve conter número'),
    });

    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: 'Erro de validação',
          description: firstError.message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/connect-mind`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        toast({
          title: t('auth.toast.signupSuccessTitle'),
          description: t('auth.toast.signupSuccessDescription'),
        });
      }

      navigate('/');
    } catch (error: any) {
      toast({
        title: t('auth.toast.authErrorTitle'),
        description: error?.message?.includes('Invalid')
          ? t('auth.toast.invalidCredentials')
          : t('auth.toast.loginGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex justify-end mb-4">
        <LanguageSelector />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isForgotPassword ? t('auth.resetPasswordTitle') : t('auth.title')}
            </CardTitle>
            <CardDescription className="text-base">
              {isForgotPassword ? t('auth.resetPasswordSubtitle') : t('auth.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isForgotPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {t('auth.sendResetLink')}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  {t('auth.backToLogin')}
                </button>
              </form>
            ) : (
              <>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-12 text-base"
                    type="button"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {t('auth.googleButton')}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.orDivider')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                    <div className={isSignUp ? 'flex gap-2' : undefined}>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isLoading}
                        required
                        className={isSignUp ? 'flex-1' : undefined}
                      />
                      {isSignUp && (
                        <Button
                          type="button"
                          onClick={handleMagicLink}
                          disabled={isLoading}
                          variant="secondary"
                          className="shrink-0"
                        >
                          {t('auth.magicLinkButton')}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={isLoading}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isSignUp ? t('auth.submitSignUp') : t('auth.submitLogin')}
                  </Button>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {isSignUp ? t('auth.toggleToLogin') : t('auth.toggleToSignUp')}
                    </button>
                    
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
