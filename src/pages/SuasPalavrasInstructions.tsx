import { Type } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const SuasPalavrasInstructions = () => {
  const { t } = useTranslation();
  const steps = t('suasPalavrasInstructions.steps') as string[];

  return (
    <InstructionsLayout
      icon={Type}
      label={t('suasPalavrasInstructions.label')}
      title={t('suasPalavrasInstructions.title')}
      subtitle={t('suasPalavrasInstructions.subtitle')}
      backPath="/suas-palavras"
    >
      <InstructionsCard>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <InstructionStep key={index} number={index + 1}>
              {step}
            </InstructionStep>
          ))}
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default SuasPalavrasInstructions;
