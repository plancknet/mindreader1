import { Shuffle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const OiSumidaInstructions = () => {
  const { t } = useTranslation();
  const steps = t('oiSumidaInstructions.steps') as string[];

  return (
    <InstructionsLayout
      icon={Shuffle}
      label={t('oiSumidaInstructions.label')}
      title={t('oiSumidaInstructions.title')}
      subtitle={t('oiSumidaInstructions.subtitle')}
      backPath="/oi-sumida"
      backLabel={t('oiSumidaInstructions.backLabel')}
    >
      <InstructionsCard>
        <div className="space-y-5">
          {steps.map((step, index) => (
            <InstructionStep key={index} number={index + 1}>
              {step}
            </InstructionStep>
          ))}
          <InstructionNote>
            {t('oiSumidaInstructions.tip')}
          </InstructionNote>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default OiSumidaInstructions;
