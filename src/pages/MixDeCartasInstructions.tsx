import { useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { useTranslation } from '@/hooks/useTranslation';

const suitOrder: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getCardIndex = (rank: string, suit: SuitName) => {
  const suitBase = suitOrder.indexOf(suit) * 13;
  const rankOffset = rankOrder.indexOf(rank);
  return suitBase + rankOffset + 1;
};

const decimalToBinary6 = (num: number) => num.toString(2).padStart(6, '0');

const readingDirection: string = 'RIGHT_TO_LEFT';
const slotValues = [32, 16, 8, 4, 2, 1];
const IS_LEFT_TO_RIGHT = readingDirection === 'LEFT_TO_RIGHT';

const rawSequenceData: Array<{ rank: string; suit: SuitName }> = [
  { rank: 'K', suit: 'diamonds' },
  { rank: '10', suit: 'hearts' },
  { rank: 'Q', suit: 'diamonds' },
  { rank: '9', suit: 'hearts' },
  { rank: '8', suit: 'clubs' },
  { rank: '3', suit: 'spades' },
];

const MixDeCartasInstructions = () => {
  const { t } = useTranslation();
  
  const suitLabels = t('mixDeCartasInstructions.suitLabels') as Record<SuitName, string>;
  const exampleChosenCard = t('mixDeCartasInstructions.exampleCard') as { rank: string; suit: SuitName; label: string };
  const anchorLabel = t('mixDeCartasInstructions.anchorLabel');
  
  const exampleIndex = getCardIndex(exampleChosenCard.rank, exampleChosenCard.suit);
  const binaryDigits = decimalToBinary6(exampleIndex).split('');
  const displayBits = IS_LEFT_TO_RIGHT ? binaryDigits : [...binaryDigits].reverse();
  const slotValuesDisplay = IS_LEFT_TO_RIGHT ? slotValues : [...slotValues].reverse();
  const anchorIndex = IS_LEFT_TO_RIGHT ? 0 : rawSequenceData.length - 1;
  const directionLabel = t(IS_LEFT_TO_RIGHT ? 'mixDeCartasInstructions.leftToRight' : 'mixDeCartasInstructions.rightToLeft');

  const exampleSequence = useMemo(
    () =>
      rawSequenceData.map((card, index) => ({
        ...card,
        bit: displayBits[index],
        isAnchor: index === anchorIndex,
        imageSrc: getCardImageSrc(card.rank, card.suit),
        label: `${card.rank} ${t('mixDeCartasInstructions.of')} ${suitLabels[card.suit]}`,
      })),
    [anchorIndex, displayBits, suitLabels, t],
  );

  return (
    <InstructionsLayout
      icon={Shuffle}
      label={t('mixDeCartasInstructions.label')}
      title={t('mixDeCartasInstructions.title')}
      subtitle={t('mixDeCartasInstructions.subtitle')}
      backPath="/mind-reader/mix-de-cartas"
    >
      <style>{`
        @keyframes mixFocus {
          0% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
          10% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(127,19,236,0.35); }
          30% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(127,19,236,0.35); }
          45% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
          100% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
        }
      `}</style>
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title={t('mixDeCartasInstructions.stepByStep')}>
            <ol className="list-decimal space-y-3 pl-5 text-white/90">
              <li>
                <strong>{t('mixDeCartasInstructions.step1Title')}</strong> {t('mixDeCartasInstructions.step1Text', { cardLabel: exampleChosenCard.label, index: exampleIndex })}
              </li>
              <li>
                <strong>{t('mixDeCartasInstructions.step2Title')}</strong> {t('mixDeCartasInstructions.step2Text', { values: slotValuesDisplay.join(', '), direction: directionLabel })}
              </li>
              <li>
                <strong>{t('mixDeCartasInstructions.step3Title')}</strong> {t('mixDeCartasInstructions.step3Text')}
              </li>
              <li>
                <strong>{t('mixDeCartasInstructions.step4Title')}</strong> {t('mixDeCartasInstructions.step4Text')}
              </li>
            </ol>
          </InstructionsSection>

          <InstructionsSection title={t('mixDeCartasInstructions.animatedExample')}>
            <p className="text-white/80 mb-4">
              {t('mixDeCartasInstructions.exampleDescription', { anchorCard: t('mixDeCartasInstructions.anchorCardName'), direction: directionLabel, index: exampleIndex, cardLabel: exampleChosenCard.label })}
            </p>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {exampleSequence.map((card, index) => (
                <div key={`${card.rank}-${card.suit}`} className="space-y-1 md:space-y-3 text-center">
                  <div
                    className="rounded-xl md:rounded-2xl border border-[#7f13ec]/30 bg-white/5 p-1.5 md:p-3 shadow-lg shadow-[#7f13ec]/10"
                    style={{
                      animation: 'mixFocus 7s ease-in-out infinite',
                      animationDelay: `${index * 0.8}s`,
                    }}
                  >
                    <div className="relative aspect-[7/10] w-full overflow-hidden rounded-lg md:rounded-xl border border-white/10">
                      {card.imageSrc ? (
                        <img
                          src={card.imageSrc}
                          alt={card.label}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/70">{card.label}</div>
                      )}
                      <div className="absolute top-1 left-1 md:top-2 md:left-2 rounded-full bg-[#0f111a]/80 px-1.5 py-0.5 md:px-2 md:py-1 text-[0.5rem] md:text-[0.6rem] font-semibold uppercase tracking-[0.1em] md:tracking-[0.2em] text-[#7f13ec]">
                        {card.bit === '1' ? `+${slotValuesDisplay[index]}` : '+0'}
                      </div>
                      {card.isAnchor && (
                        <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 rounded-full bg-[#7f13ec]/80 px-1.5 py-0.5 md:px-2 md:py-1 text-[0.5rem] md:text-[0.6rem] font-semibold uppercase tracking-[0.1em] md:tracking-[0.2em] text-white">
                          {anchorLabel}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[0.6rem] md:text-xs font-semibold text-white/60 truncate">{card.label}</p>
                </div>
              ))}
            </div>
          </InstructionsSection>

          <div className="rounded-2xl border border-[#7f13ec]/15 bg-[#0f111a]/60 p-4">
            <InstructionNote>
              {t('mixDeCartasInstructions.tip')}
            </InstructionNote>
          </div>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default MixDeCartasInstructions;
