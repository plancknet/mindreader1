import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const TEXT = {
  pt: { title: 'Crie sua senha', sub: 'Escolha a senha que você vai usar para entrar no MindReader.', pass: 'Nova senha (mín. 6 caracteres)', confirm: 'Confirme a senha', save: 'Salvar e entrar', mismatch: 'As senhas não conferem.', short: 'A senha precisa ter pelo menos 6 caracteres.', invalid: 'Link inválido ou expirado. Peça um novo em "Esqueci minha senha".', ok: 'Senha criada! Bem-vindo ao MindReader.', fail: 'Não foi possível salvar a senha.' },
  en: { title: 'Create your password', sub: "Choose the password you'll use to sign in to MindReader.", pass: 'New password (min. 6 characters)', confirm: 'Confirm password', save: 'Save and sign in', mismatch: "Passwords don't match.", short: 'Password must be at least 6 characters.', invalid: 'Invalid or expired link. Request a new one via "Forgot password".', ok: 'Password created! Welcome to MindReader.', fail: "Couldn't save the password." },
};

const DefinirSenha = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const tx = language.startsWith('pt') ? TEXT.pt : TEXT.en;
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) setReady(true); });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setTimeout(() => setReady((r) => r ?? false), 2500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error(tx.short);
    if (password !== confirm) return toast.error(tx.mismatch);
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(tx.fail);
    toast.success(tx.ok);
    navigate('/game-selector');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground" style={{ fontFamily: '"Spline Sans", sans-serif' }}>
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-magic">
        <KeyRound className="mx-auto h-10 w-10 text-magic" />
        <h1 className="text-center text-2xl font-bold">{tx.title}</h1>
        {ready === null ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : ready === false ? (
          <p className="text-center text-sm text-muted-foreground">{tx.invalid}</p>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">{tx.sub}</p>
            <Input type="password" placeholder={tx.pass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <Input type="password" placeholder={tx.confirm} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            <Button type="submit" disabled={saving} className="w-full rounded-full bg-gradient-magic text-magic-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : tx.save}
            </Button>
          </>
        )}
      </form>
    </div>
  );
};

export default DefinirSenha;
