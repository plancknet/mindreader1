import { Brain } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const gridRows = [
  ['A', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['10', 'J', 'Q'],
];

const CartaMentalInstructions = () => {
  const { t } = useTranslation();
  const steps = t('cartaMentalInstructions.steps') as string[];
  const suits = t('cartaMentalInstructions.suits') as Array<{ id: string; label: string; tone: string }>;

  return (
    <InstructionsLayout
      icon={Brain}
      label={t('cartaMentalInstructions.label')}
      title={t('cartaMentalInstructions.title')}
      subtitle={t('cartaMentalInstructions.subtitle')}
      backPath="/carta-mental"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title={t('cartaMentalInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('cartaMentalInstructions.cardBackTitle')}>
            <div className="flex justify-center">
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(127,19,236,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-[#1e1b4b]/70 via-[#1e1b4b] to-[#0f111a]" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {gridRows.map((row) =>
                    row.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-[#7f13ec]/30 bg-white/10 text-center text-sm font-semibold text-white shadow-lg shadow-[#7f13ec]/10"
                        disabled
                      >
                        {label}
                      </button>
                    )),
                  )}
                </div>
              </div>
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('cartaMentalInstructions.revealButtonTitle')}>
            <div className="w-full max-w-md mx-auto rounded-full border border-white/20 bg-gradient-to-r from-[#1e1b4b] via-[#0f111a] to-[#1e1b4b] p-1 shadow-[0_20px_40px_rgba(15,23,42,0.5)]">
              <div className="grid grid-cols-4 gap-1">
                {suits.map((suit) => (
                  <div
                    key={suit.id}
                    className="rounded-full border border-[#7f13ec]/30 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    <span className={suit.tone}>{suit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default CartaMentalInstructions;
