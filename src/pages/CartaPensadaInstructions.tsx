import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const CartaPensadaInstructions = () => {
  const { t } = useTranslation();
  const steps = t('cartaPensadaInstructions.steps') as string[];

  return (
    <InstructionsLayout
      icon={Sparkles}
      label={t('cartaPensadaInstructions.label')}
      title={t('cartaPensadaInstructions.title')}
      subtitle={t('cartaPensadaInstructions.subtitle')}
      backPath="/carta-pensada"
    >
      <InstructionsCard>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <InstructionStep key={index} number={index + 1}>
              {step}
            </InstructionStep>
          ))}
          <InstructionNote>
            {t('cartaPensadaInstructions.tip')}
          </InstructionNote>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default CartaPensadaInstructions;
