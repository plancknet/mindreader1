import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Brain, Mail, Lock, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';

type GlassInputProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  rightSlot?: ReactNode;
  autoComplete?: string;
};

const GlassInput = ({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  disabled,
  required = false,
  rightSlot,
  autoComplete,
}: GlassInputProps) => {
  const paddingRightClass = rightSlot ? 'pr-12' : 'pr-4';

  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="ml-1 text-sm font-medium text-white/90">{label}</span>
      <div className="group relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-[#7f13ec]" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 ${paddingRightClass} text-white placeholder:text-white/35 transition-all duration-300 hover:border-white/20 focus:border-[#7f13ec] focus:outline-none focus:ring-1 focus:ring-[#7f13ec] disabled:cursor-not-allowed disabled:opacity-60`}
        />
        {rightSlot}
      </div>
    </label>
  );
};

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
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        navigate(hasSeenWelcome ? '/game-selector' : '/welcome', { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event !== 'SIGNED_OUT') {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        navigate(hasSeenWelcome ? '/game-selector' : '/welcome', { replace: true });
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
          redirectTo: `${window.location.origin}/`,
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
          emailRedirectTo: `${window.location.origin}/complete-signup?from=email`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Link enviado!',
        description: 'Verifique seu email e clique no link para completar o cadastro.',
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

  const handleResetPassword = async (e: FormEvent) => {
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

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: t('auth.toast.missingFieldsTitle'),
        description: t('auth.toast.missingFieldsDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validate email only (password validation skipped for login to allow numeric passwords from partner leads)
    const emailSchema = z.string().trim().email('Email inválido').max(255, 'Email muito longo');

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: 'Email inválido',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: t('auth.toast.signupSuccessTitle'),
          description: t('auth.toast.signupSuccessDescription'),
        });
        navigate('/game-selector');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;

        // Check if user needs to change password (partner lead first login)
        const needsPasswordChange = data.user?.user_metadata?.needs_password_change;
        
        if (needsPasswordChange) {
          // Redirect to password change page
          navigate('/complete-signup?change=true');
        } else {
          navigate('/game-selector');
        }
      }
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

  const backgroundImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBLvkwziIMYB9_2Y7zMObXsZWpVDq0QQDx4jXWWQqsoiWNxivIRYw8ys5_UileF3BHslgqTaB2WMmMIFl7BZOdG9V-8zrVgAbNQzxy_xl4iKE5Nz5hzFLbSmadD25QQsGqj7-xOkrYe3uWLFIShuXo7T3R2QxB-Uenhtc7nEP52VI8ZxO4IvBGX4rEElKWk0f7KaRVaQKBj1vsu6oilwZOl5mHJNLWjgkKWTN0uGf19Vf8E9JM66Cjn3OKZqhTj4CeZRxhGqfVvmg';
  const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#191022] text-white antialiased selection:bg-[#7f13ec] selection:text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src={backgroundImageUrl}
          alt="Textura abstrata roxa lembrando fumaça mística"
          className="h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-magic-gradient" />
      </div>

      <div className="relative z-20 flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
        <div className="mb-10 flex w-full max-w-md flex-col items-center text-center animate-login-fade-in-down">
          <div className="mb-6 rounded-full border border-[#7f13ec]/50 bg-[#7f13ec]/20 p-5 login-logo-glow">
            <Brain className="h-14 w-14 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight login-text-glow">MindReader</h1>
          <p className="mt-3 text-lg font-medium tracking-wide text-white/70">Leia Pensamentos</p>
        </div>

        <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl shadow-[0_25px_70px_rgba(127,19,236,0.25)] sm:p-8 login-glass-panel">
          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">{t('auth.resetPasswordTitle')}</h2>
                <p className="mt-2 text-sm text-white/70">{t('auth.resetPasswordSubtitle')}</p>
              </div>

              <GlassInput
                id="reset-email"
                type="email"
                label={t('auth.emailLabel')}
                placeholder={t('auth.emailPlaceholder')}
                icon={Mail}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7f13ec] py-3.5 font-bold transition-all duration-200 hover:bg-[#6d0ecb] hover:shadow-[0_6px_20px_rgba(127,19,236,0.35)] focus:outline-none focus:ring-2 focus:ring-[#d7b5ff] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                <span>{t('auth.sendResetLink')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-white/30 hover:text-white"
              >
                {t('auth.backToLogin')}
              </button>
            </form>
          ) : (
            <>
              <p className="text-center text-lg font-semibold text-white/80">
                {isSignUp ? 'Receba um link mágico direto no seu email' : 'Entre e leia a mente de amigos'}
              </p>

              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-semibold text-slate-900 shadow-lg shadow-[0_10px_40px_rgba(127,19,236,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#7f13ec]" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>{t('auth.googleButton')}</span>
              </button>

              <div className="mt-6 flex w-full items-center gap-4 px-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">{t('auth.orDivider')}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {isSignUp ? (
                <div className="mt-6 flex flex-col gap-5">
                  <GlassInput
                    id="signup-email"
                    type="email"
                    label={t('auth.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    icon={Mail}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />

                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7f13ec] py-3.5 font-bold transition-all duration-200 hover:bg-[#6d0ecb] hover:shadow-[0_6px_20px_rgba(127,19,236,0.35)] focus:outline-none focus:ring-2 focus:ring-[#d7b5ff] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span>Enviar link de acesso</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="mt-6 flex flex-col gap-5">
                  <GlassInput
                    id="login-email"
                    type="email"
                    label={t('auth.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    icon={Mail}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />

                  <GlassInput
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    label={t('auth.passwordLabel')}
                    placeholder={t('auth.passwordPlaceholder')}
                    icon={Lock}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-white/70">
                      <input
                        type="checkbox"
                        className="rounded border-white/30 bg-white/10 text-[#7f13ec] focus:ring-[#7f13ec] focus:ring-offset-0"
                      />
                      <span>Lembrar de mim</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="font-semibold text-[#c499ff] transition-colors hover:text-white"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7f13ec] py-4 font-bold shadow-[0_4px_14px_rgba(127,19,236,0.39)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6d0ecb] hover:shadow-[0_6px_20px_rgba(127,19,236,0.23)] focus:outline-none focus:ring-2 focus:ring-[#d7b5ff] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span>{t('auth.submitLogin')}</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-white/70">
                <span>{isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}</span>{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-white transition-colors hover:text-[#c499ff]"
                >
                  {isSignUp ? t('auth.toggleToLogin') : t('auth.toggleToSignUp')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

