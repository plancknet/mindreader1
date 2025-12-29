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

type RankId = 'J' | 'Q' | 'K';

const rankColumns: RankId[] = ['J', 'Q', 'K'];

const RaspaCartaInstructions = () => {
  const { t } = useTranslation();
  const steps = t('raspaCartaInstructions.steps') as string[];
  const suits = t('raspaCartaInstructions.suits') as Array<{ id: SuitName; label: string }>;

  const cardButtons = suits.flatMap((suit) =>
    rankColumns.map((rank) => ({
      rank,
      suit: suit.id,
      label: `${rank} ${t('raspaCartaInstructions.of')} ${suit.label}`,
      imageSrc: getCardImageSrc(rank, suit.id),
    })),
  );

  return (
    <InstructionsLayout
      icon={Sparkles}
      label={t('raspaCartaInstructions.label')}
      title={t('raspaCartaInstructions.title')}
      subtitle={t('raspaCartaInstructions.subtitle')}
      backPath="/raspa-carta"
    >
      <InstructionsCard>
        <div className="space-y-5">
          <InstructionsSection title={t('raspaCartaInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('raspaCartaInstructions.cardBackTitle')}>
            <div className="flex justify-center">
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(127,19,236,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-[#1e1b4b]/80 via-[#1e1b4b] to-[#0f111a]" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {cardButtons.map((card) => (
                    <button
                      key={`${card.rank}-${card.suit}`}
                      type="button"
                      className="flex items-center justify-center rounded-2xl border border-[#7f13ec]/20 bg-white/10 text-center text-sm font-semibold text-white shadow-lg shadow-[#7f13ec]/10"
                      disabled
                    >
                      {card.imageSrc ? (
                        <img
                          src={card.imageSrc}
                          alt={card.label}
                          className="h-full w-full rounded-2xl object-cover"
                          draggable={false}
                        />
                      ) : (
                        <span>{card.label}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default RaspaCartaInstructions;
