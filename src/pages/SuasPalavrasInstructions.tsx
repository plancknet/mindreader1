import { Type } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionParagraph,
} from '@/components/InstructionsLayout';

const instructionsText = [
  'O funcionamento desta mágica é exatamente o mesmo da mágica "Palavra Misteriosa". Se ainda não souber os truques, veja as instruções da mágica "Palavra Misteriosa".',
  'E lembre-se... treine antes de fazer com seus amigos!',
];

const SuasPalavrasInstructions = () => {
  return (
    <InstructionsLayout
      icon={Type}
      label="Suas Palavras"
      title="Como funciona"
      subtitle="Um lembrete rápido antes de encantar sua plateia."
      backPath="/suas-palavras"
    >
      <InstructionsCard>
        <div className="space-y-5">
          {instructionsText.map((paragraph) => (
            <InstructionParagraph key={paragraph}>{paragraph}</InstructionParagraph>
          ))}
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default SuasPalavrasInstructions;

