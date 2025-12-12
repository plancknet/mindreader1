import { useEffect, useState } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ensureTodayGoogleMimeCode, generateGoogleMimeCode, type GoogleMimeCodeRecord } from '@/lib/googleMimeCode';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const steps = [
  'Solicite o código diário de 3 dígitos nesta tela antes de iniciar a apresentação.',
  'Compartilhe o código apenas com quem for apresentar o Google Mime ao público.',
  'No modo público, peça para inserirem o código e acessarem o jogo.',
  'Após a verificação, execute o mesmo fluxo do Google Mime original.',
  'O código expira diariamente e é renovado automaticamente aqui.',
];

const GoogleMimeInstructions = () => {
  const [codeRecord, setCodeRecord] = useState<GoogleMimeCodeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCode = async () => {
    try {
      setLoading(true);
      const record = await ensureTodayGoogleMimeCode();
      setCodeRecord(record);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCode();
  }, []);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const record = await generateGoogleMimeCode();
      setCodeRecord(record);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar um novo código. Verifique se você tem permissão.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <ShieldCheck className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Google Mime</p>
          <h1 className="text-4xl font-bold text-foreground">Instruções & Código Diário</h1>
          <p className="text-muted-foreground">
            Use o roteiro abaixo para compartilhar o código diário e garantir que apenas usuários autorizados
            acessem a versão pública do Google Mime.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary mb-2">Código do Dia</p>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-5xl font-semibold tracking-[0.2em]">{codeRecord?.code ?? '---'}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Atualizado em:{' '}
                    {codeRecord
                      ? new Date(codeRecord.generated_at).toLocaleString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })
                      : '---'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => void loadCode()}
                  disabled={loading || regenerating}
                >
                  Atualizar
                </Button>
              </div>
            )}
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => void handleRegenerate()}
              disabled={regenerating}
            >
              {regenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Gerar novo código
            </Button>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Roteiro de apresentação
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
              {steps.map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GoogleMimeInstructions;
