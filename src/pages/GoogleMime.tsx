import { useState, lazy, Suspense } from 'react';
import { verifyGoogleMimeCode } from '@/lib/googleMimeCode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Shield } from 'lucide-react';

const GoogleMimeAppLazy = lazy(() => import('./GoogleMimeApp'));

const GoogleMimePublic = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 3 || !/^\d{3}$/.test(code)) {
      setError('Digite um código numérico de 3 dígitos.');
      return;
    }
    try {
      setChecking(true);
      setError(null);
      const isValid = await verifyGoogleMimeCode(code);
      if (isValid) {
        setVerified(true);
      } else {
        setError('Código incorreto ou expirado. Solicite o código atualizado.');
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível validar o código. Tente novamente.');
    } finally {
      setChecking(false);
    }
  };

  if (verified) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Carregando jogo...</div>}>
        <GoogleMimeAppLazy enforceAdmin={false} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Google Mime - Acesso Especial</h1>
          <p className="text-muted-foreground">
            Digite o código diário de 3 dígitos compartilhado nas instruções para habilitar o jogo.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="Código diário"
            className="text-center text-2xl tracking-[0.4em]"
            aria-label="Código de acesso do Google Mime"
          />
          <Button type="submit" className="w-full" disabled={checking}>
            {checking ? 'Verificando...' : 'Entrar'}
          </Button>
        </form>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive justify-center">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Dica: o código é atualizado diariamente e exibido na página de instruções do Google Mime para usuários autenticados.
        </p>
      </Card>
    </div>
  );
};

export default GoogleMimePublic;
