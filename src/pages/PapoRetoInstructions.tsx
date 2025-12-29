import { MessageCircle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const letterRows = [
  ['A', 'B', 'C', 'D'],
  ['E', 'F', 'G', 'H'],
  ['I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T'],
];

const PapoRetoInstructions = () => {
  const { t } = useTranslation();
  const steps = t('papoRetoInstructions.steps') as string[];

  return (
    <InstructionsLayout
      icon={MessageCircle}
      label={t('papoRetoInstructions.label')}
      title={t('papoRetoInstructions.title')}
      subtitle={t('papoRetoInstructions.subtitle')}
      backPath="/papo-reto"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title={t('papoRetoInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('papoRetoInstructions.keyboardTitle')}>
            <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-3">
              {letterRows.flat().map((letter) => (
                <div
                  key={letter}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/80"
                >
                  {letter}
                </div>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default PapoRetoInstructions;
