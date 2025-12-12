import { useEffect, useState } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { ensureTodayGoogleMimeCode, type GoogleMimeCodeRecord } from '@/lib/googleMimeCode';
import { ShieldCheck } from 'lucide-react';

const steps = [
  'Diga ao seu amigo que fará uma mágica com o celular dele. Peça a ele que acesse o app do Google.',
  'Acesse o Google Mime no SEU celular e veja qual o "Código do Dia". Você utilizará esse código no celular dele.',
  'Mostre o SEU celular, no Google Mime, e diga que você também está acessando do App do Google. Faça uma pesquisa com a palavra "Celebridade" e clique na aba imagens.',
  'Sem que ele perceba, dê um duplo clique na celebridade que você desejar.',
  'Pegue o celular dele e, sem que ele perceba, acesse o site "bit.ly/mrs5". Este site simula o App do Google. Mostre a ele que você acessou o Google e que vai repetir a mesma pesquisa.',
  'Ao invés de digitar a palavra "Celebridade", digite o código obtido no passo 2.',
  'Dê um duplo clique na mesma celebridade escolhida no passo 4 e role um pouco a tela para esconder a seleção.',
  'Peça para ele rolar a tela aleatoriamente e, quando quiser, clicar sem ver para selecionar uma celebridade.',
  'A celebridade escolhida "aleatoriamente" por ele será a mesma escolhida em sua previsão.',
];

const GoogleMimeInstructions = () => {
  const [codeRecord, setCodeRecord] = useState<GoogleMimeCodeRecord | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <ShieldCheck className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Google Mime</p>
          <h1 className="text-4xl font-bold text-foreground">Instruções & Código do Dia</h1>
          <p className="text-muted-foreground">
            Consulte o código diário e siga o roteiro para apresentar a previsão exatamente como planejado.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary mb-2">Código do Dia</p>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <div className="flex flex-col gap-4">
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
              </div>
            )}
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
