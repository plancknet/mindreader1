import { Type } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
} from '@/components/InstructionsLayout';

const steps = [
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
        <div className="space-y-4">
          {steps.map((step, index) => (
            <InstructionStep key={step} number={index + 1}>
              {step}
            </InstructionStep>
          ))}
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default SuasPalavrasInstructions;
