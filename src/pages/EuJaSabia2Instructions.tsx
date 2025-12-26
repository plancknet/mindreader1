import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { supabase } from '@/integrations/supabase/client';

const videoSteps = [
  'No "Eu Já Sabia 2", grave um vídeo, preferencialmente vestido de preto, com uma folha em branco atrás de você. Com um movimento corporal rápido, revele a folha, como demonstrado no vídeo a seguir:',
  'Uma dica importante é enviar o vídeo gravado para você mesmo no WhatsApp. Assim, o vídeo ficará com tamanho menor para que você possa fazer o upload no MindReader. No WhatsApp salve seu vídeo na galeria.',
];

const maskSteps = [
  'No MindReader, utilize o botão "Personalizar Video" para fazer o upload do vídeo e utilize as configurações de "Cor da Máscara", "Tamanho da Máscara", "Momento da Máscara" e "Editar posição da máscara" para fazer com que a Revelação seja impactante para o seu amigo.',
  'Ao final, clique no botão "Salvar Máscara" para que as configurações façam o efeito desejado.',
];

const executionSteps = [
  'Peça ao seu amigo para falar ou anotar um número de 00 a 99. Diga que você gravou um vídeo hoje mais cedo no qual você já sabia o número que ele escolheria.',
  'Enquanto você fala, utilize o teclado invisível que cobre o seu vídeo para informar ao aplicativo o número escolhido pelo seu amigo. O teclado está disposto como mostrado a seguir:',
  'Após informar o número escolhido (sempre informe o número com 2 dígitos), clique em iniciar. Seu vídeo será exibido e o número aparecerá na folha em branco.',
];

const numberRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', '0', '0'],
];

const EuJaSabia2Instructions = () => {
  const [adminVideoSrc, setAdminVideoSrc] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    const loadAdminVideo = async () => {
      try {
        const { data: adminRole, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError || !adminRole?.user_id) {
          setAdminVideoSrc(null);
          return;
        }

        const { data, error: videoError } = await supabase
          .from('user_videos')
          .select('video_data')
          .eq('user_id', adminRole.user_id)
          .maybeSingle();

        if (videoError) {
          setAdminVideoSrc(null);
          return;
        }

        setAdminVideoSrc(data?.video_data ?? null);
      } catch (error) {
        console.error('Erro ao carregar vídeo do admin', error);
        setAdminVideoSrc(null);
      } finally {
        setLoadingVideo(false);
      }
    };

    void loadAdminVideo();
  }, []);

  return (
    <InstructionsLayout
      icon={Play}
      label="Eu Já Sabia 2"
      title="Como apresentar a mágica"
      subtitle="Siga as etapas para preparar o vídeo, configurar a máscara e executar."
      backPath="/eu-ja-sabia-2"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title="Vídeo">
            <div className="space-y-3">
              <InstructionStep number={1}>{videoSteps[0]}</InstructionStep>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                {loadingVideo ? (
                  <div className="flex items-center justify-center text-sm text-white/60">
                    Carregando vídeo do admin...
                  </div>
                ) : adminVideoSrc ? (
                  <video
                    src={adminVideoSrc}
                    className="w-full rounded-xl"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="flex items-center justify-center text-sm text-white/60">
                    Vídeo do admin indisponível.
                  </div>
                )}
              </div>
              <InstructionStep number={2}>{videoSteps[1]}</InstructionStep>
            </div>
          </InstructionsSection>

          <InstructionsSection title="Máscara numérica">
            <div className="space-y-3">
              {maskSteps.map((step, index) => (
                <InstructionStep key={step} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title="Execução da mágica">
            <div className="space-y-3">
              {executionSteps.map((step, index) => (
                <InstructionStep key={step} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>

            <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-3 pt-4">
              {numberRows.flat().map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-semibold text-white/80"
                >
                  {value}
                </div>
              ))}
            </div>

            <InstructionNote>
              Sempre informe o número com 2 dígitos para garantir a revelação correta.
            </InstructionNote>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default EuJaSabia2Instructions;
