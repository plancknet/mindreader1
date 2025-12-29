import { Wand2 } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { useTranslation } from '@/hooks/useTranslation';

const predictionGrid = [
  ['X', 'O', 'O'],
  ['O', 'X', 'X'],
  ['X', 'X', 'O'],
];

const JogoVelhaBruxaInstructions = () => {
  const { t } = useTranslation();
  const steps = t('jogoVelhaBruxaInstructions.steps') as string[];

  return (
    <InstructionsLayout
      icon={Wand2}
      label={t('jogoVelhaBruxaInstructions.label')}
      title={t('jogoVelhaBruxaInstructions.title')}
      subtitle={t('jogoVelhaBruxaInstructions.subtitle')}
      backPath="/jogo-da-velha-bruxa"
      backLabel={t('jogoVelhaBruxaInstructions.backLabel')}
    >
      <InstructionsCard>
        <div className="space-y-5">
          <InstructionsSection title={t('jogoVelhaBruxaInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('jogoVelhaBruxaInstructions.predictionTitle')}>
            <div className="inline-grid grid-cols-3 gap-3 rounded-2xl border border-[#7f13ec]/30 bg-black/50 p-4 shadow-lg shadow-[#7f13ec]/20">
              {predictionGrid.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#1e1b4b]/70 text-2xl font-bold text-white"
                  >
                    {value}
                  </div>
                )),
              )}
            </div>
            <InstructionNote>
              {t('jogoVelhaBruxaInstructions.tip')}
            </InstructionNote>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default JogoVelhaBruxaInstructions;
