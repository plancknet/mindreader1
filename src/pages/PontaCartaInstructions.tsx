import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { useTranslation } from '@/hooks/useTranslation';

const PontaCartaInstructions = () => {
  const { t } = useTranslation();
  const steps = t('pontaCartaInstructions.steps') as string[];
  const highlightedCards = t('pontaCartaInstructions.highlightedCards') as Array<{ rank: string; suit: SuitName; label: string }>;

  const cardPreviews = highlightedCards.map((card) => ({
    ...card,
    imageSrc: getCardImageSrc(card.rank, card.suit),
  }));

  return (
    <InstructionsLayout
      icon={Sparkles}
      label={t('pontaCartaInstructions.label')}
      title={t('pontaCartaInstructions.title')}
      subtitle={t('pontaCartaInstructions.subtitle')}
      backPath="/ponta-da-carta"
    >
      <style>{`
        @keyframes cardFlip180 {
          0% { transform: rotateZ(0deg); }
          40% { transform: rotateZ(180deg); }
          50% { transform: rotateZ(180deg); }
          90% { transform: rotateZ(360deg); }
          100% { transform: rotateZ(360deg); }
        }
      `}</style>
      <InstructionsCard>
        <div className="space-y-5">
          <InstructionsSection title={t('pontaCartaInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('pontaCartaInstructions.rotationTitle')}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cardPreviews.map((card) => (
                <div key={`${card.rank}-${card.suit}`} className="text-center space-y-2">
                  <div
                    className="relative mx-auto aspect-[7/10] w-full max-w-[120px] overflow-hidden rounded-2xl border border-[#7f13ec]/30 bg-black/40 shadow-lg shadow-[#7f13ec]/20"
                    style={{
                      animation: 'cardFlip180 6s linear infinite',
                      transformOrigin: 'center',
                    }}
                  >
                    {card.imageSrc ? (
                      <img
                        src={card.imageSrc}
                        alt={card.label}
                        className="h-full w-full select-none object-cover"
                        draggable={false}
                        style={{ backfaceVisibility: 'hidden' }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
                        {card.label}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white/60">{card.label}</p>
                </div>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default PontaCartaInstructions;
