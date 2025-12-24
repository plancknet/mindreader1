import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
  InstructionStep,
} from '@/components/InstructionsLayout';
import { ensureTodayGoogleMimeCode, type GoogleMimeCodeRecord } from '@/lib/googleMimeCode';

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
    <InstructionsLayout
      icon={ShieldCheck}
      label="Google Mime"
      title="Como apresentar a mágica"
      subtitle="Use o código do dia e siga o roteiro para impressionar."
      backPath="/google-mime"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title="Código do Dia">
            {loading ? (
              <p className="text-white/60">Carregando...</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-5xl font-semibold tracking-[0.2em] text-white">
                  {codeRecord?.code ?? '---'}
                </p>
                <p className="text-sm text-white/50">
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
            )}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </InstructionsSection>

          <InstructionsSection title="Passo a passo">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={step} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default GoogleMimeInstructions;
