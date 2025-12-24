import { Shuffle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionParagraph,
  InstructionNote,
} from '@/components/InstructionsLayout';

const steps = [
  'Peça ao seu amigo para memorizar silenciosamente uma das cartas apresentadas na tela.',
  'Explique que ele pode clicar no botão "Embaralhar" quantas vezes quiser. Isso garante que ninguém sabe onde a carta ficou.',
  'Diga que o MindReader irá ler a mente dele e remover a carta memorizada do grid.',
  'Peça para ele clicar no botão "Oi Sumida" quando estiver pronto para revelar.',
  'Mostre que a carta escolhida "sumiu" misteriosamente, confirmando que a previsão estava correta.',
];

const OiSumidaInstructions = () => {
  return (
    <InstructionsLayout
      icon={Shuffle}
      label="Oi Sumida"
      title="Como apresentar o efeito"
      subtitle="Siga o roteiro abaixo para conduzir o truque e garantir que a carta sumida impressione o público."
      backPath="/oi-sumida"
      backLabel="Voltar ao jogo"
    >
      <InstructionsCard>
        <div className="space-y-5">
          {instructions.map((paragraph) => (
            <InstructionParagraph key={paragraph}>{paragraph}</InstructionParagraph>
          ))}
          <InstructionNote>
            Reforce que apenas o amigo sabe qual carta foi memorizada - o resto é pura "leitura mental".
          </InstructionNote>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default OiSumidaInstructions;

