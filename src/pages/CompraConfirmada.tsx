import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const TEXT = {
  pt: {
    loading: 'Confirmando seu pagamento…',
    title: 'Pagamento confirmado!',
    body: 'Sua conta MindReader foi criada com o e-mail',
    mail: 'Enviamos para esse e-mail um link para você criar sua senha. Confira também a caixa de spam.',
    login: 'Já criei minha senha — entrar',
    pending: 'Seu pagamento ainda está sendo processado. Em alguns minutos você receberá um e-mail para criar sua senha.',
    error: 'Não conseguimos confirmar agora. Se o pagamento foi feito, você receberá um e-mail para criar sua senha em instantes.',
  },
  en: {
    loading: 'Confirming your payment…',
    title: 'Payment confirmed!',
    body: 'Your MindReader account was created with the email',
    mail: "We've sent a link to that email so you can create your password. Please check your spam folder too.",
    login: "I've set my password — sign in",
    pending: "Your payment is still processing. In a few minutes you'll get an email to create your password.",
    error: "We couldn't confirm right now. If you paid, you'll get an email to create your password shortly.",
  },
};

const CompraConfirmada = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const tx = language.startsWith('pt') ? TEXT.pt : TEXT.en;
  const [state, setState] = useState<'loading' | 'done' | 'pending' | 'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const sessionId = params.get('session_id');
    if (!sessionId) { setState('error'); return; }
    supabase.functions.invoke('claim-guest-purchase', { body: { sessionId } }).then(({ data, error }) => {
      if (error || !data) setState('error');
      else if (data.success) { setEmail(data.email); setState('done'); }
      else setState('pending');
    });
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground" style={{ fontFamily: '"Spline Sans", sans-serif' }}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-magic">
        {state === 'loading' ? (
          <><Loader2 className="mx-auto h-10 w-10 animate-spin text-magic" /><p className="mt-4">{tx.loading}</p></>
        ) : state === 'done' ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-magic" />
            <h1 className="mt-4 text-2xl font-bold">{tx.title}</h1>
            <p className="mt-3 text-muted-foreground">{tx.body} <strong className="text-foreground">{email}</strong>.</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-magic/10 p-4 text-left text-sm">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-magic" /><span>{tx.mail}</span>
            </div>
            <Button className="mt-6 w-full rounded-full bg-gradient-magic text-magic-foreground" onClick={() => navigate('/auth')}>{tx.login}</Button>
          </>
        ) : (
          <><Mail className="mx-auto h-10 w-10 text-magic" /><p className="mt-4">{state === 'pending' ? tx.pending : tx.error}</p>
          <Button variant="outline" className="mt-6 rounded-full" onClick={() => navigate('/auth')}>{tx.login}</Button></>
        )}
      </div>
    </div>
  );
};

export default CompraConfirmada;
