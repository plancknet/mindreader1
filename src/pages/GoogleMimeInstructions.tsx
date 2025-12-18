import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { ensureTodayGoogleMimeCode, type GoogleMimeCodeRecord } from '@/lib/googleMimeCode';

const steps = [
  'Diga ao seu amigo que fara uma magica com o celular dele. Peca a ele que acesse o app do Google.',
  'Acesse o Google Mime no SEU celular e veja qual o "Codigo do Dia". Voce utilizara esse codigo no celular dele.',
  'Mostre o SEU celular, no Google Mime, e diga que voce tambem esta acessando do App do Google. Faca uma pesquisa com a palavra "Celebridade" e clique na aba imagens.',
  'Sem que ele perceba, de um duplo clique na celebridade que voce desejar.',
  'Pegue o celular dele e, sem que ele perceba, acesse o site "bit.ly/mrs5". Este site simula o App do Google. Mostre a ele que voce acessou o Google e que vai repetir a mesma pesquisa.',
  'Ao inves de digitar a palavra "Celebridade", digite o codigo obtido no passo 2.',
  'De um duplo clique na mesma celebridade escolhida no passo 4 e role um pouco a tela para esconder a selecao.',
  'Peca para ele rolar a tela aleatoriamente e, quando quiser, clicar sem ver para selecionar uma celebridade.',
  'A celebridade escolhida "aleatoriamente" por ele sera a mesma escolhida em sua previsao.',
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
      setError('Nao foi possivel carregar o codigo. Tente novamente.');
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
      title="Como apresentar a magica"
      subtitle="Use o codigo do dia e siga o roteiro para impressionar."
      backPath="/google-mime"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title="Codigo do Dia">
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

          <InstructionsSection title="Roteiro de apresentacao">
            <ol className="list-decimal pl-5 space-y-3 text-white/80">
              {steps.map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default GoogleMimeInstructions;
