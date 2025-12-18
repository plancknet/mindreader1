import { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { GameLayout } from '@/components/GameLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits: Array<{ name: SuitName; symbol: string; tone: 'red' | 'black' }> = [
  { name: 'spades', symbol: '\u2660', tone: 'black' },
  { name: 'hearts', symbol: '\u2665', tone: 'red' },
  { name: 'diamonds', symbol: '\u2666', tone: 'red' },
  { name: 'clubs', symbol: '\u2663', tone: 'black' },
];

const allowedIndices = [1, 3, 5, 6, 7, 9, 14, 16, 18, 19, 20, 22, 33, 40, 42, 44, 45, 46, 48];

type PontaCard = {
  id: string;
  rank: string;
  suit: SuitName;
  suitSymbol: string;
  tone: 'red' | 'black';
  imageSrc: string | null;
};

const getCardFromIndex = (index: number): Omit<PontaCard, 'id' | 'imageSrc'> => {
  const normalized = index - 1;
  const suitIndex = Math.floor(normalized / 13);
  const rankIndex = normalized % 13;
  const suit = suits[suitIndex];
  return {
    rank: ranks[rankIndex],
    suit: suit.name,
    suitSymbol: suit.symbol,
    tone: suit.tone,
  };
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const PontaCarta = () => {
  const { t } = useTranslation();
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.PONTA_DA_CARTA);

  const cards = useMemo<PontaCard[]>(
    () =>
      allowedIndices.map((index) => {
        const base = getCardFromIndex(index);
        return {
          ...base,
          id: `${base.rank}-${base.suit}-${index}`,
          imageSrc: getCardImageSrc(base.rank, base.suit),
        };
      }),
    [],
  );

  const [cardOrder, setCardOrder] = useState<PontaCard[]>(cards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setHasShuffled(false);
    resetUsageTracking();
  };

  const handleShuffle = async () => {
    if (!selectedCardId) return;
    setIsShuffling(true);
    setTimeout(() => {
      setCardOrder((prev) => shuffleArray(prev));
      setHasShuffled(true);
      setIsShuffling(false);
      trackUsage();
    }, 180);
  };

  const handleReset = () => {
    setSelectedCardId(null);
    setHasShuffled(false);
    setCardOrder(cards);
    resetUsageTracking();
  };

  return (
    <GameLayout>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-8">
        <div className="rounded-3xl border border-[#7f13ec]/30 bg-[#1e1b4b]/50 p-6 text-center shadow-lg backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]">
            {t('pontaCarta.hint')}
          </p>
          <h1 className="mb-2 text-4xl font-extrabold text-white md:text-5xl">
            {t('pontaCarta.chooseTitle')}
          </h1>
          <p className="text-base text-white/70">{t('pontaCarta.chooseSubtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#1e1b4b]/30 p-4 shadow-xl backdrop-blur">
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {cardOrder.map((card) => {
              const isSelected = selectedCardId === card.id;
              const showSelection = isSelected && !hasShuffled;
              return (
                <Card
                  key={card.id}
                  className={`group relative flex aspect-[7/10] w-full items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7f13ec]/30 bg-black/50 ${
                    showSelection ? 'border-[#7f13ec] ring-2 ring-[#7f13ec]/50' : 'border-white/10'
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectCard(card.id)}
                >
                  {card.imageSrc ? (
                    <img
                      src={card.imageSrc}
                      alt={`${card.rank}`}
                      className={`h-full w-full object-cover ${
                        hasShuffled && isSelected ? 'rotate-180' : ''
                      } ${isShuffling ? 'opacity-60' : 'opacity-100'}`}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-2xl font-bold">
                      <span className={card.tone === 'red' ? 'text-rose-400' : 'text-white'}>{card.rank}</span>
                      <span className={card.tone === 'red' ? 'text-rose-400' : 'text-white'}>{card.suitSymbol}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="gap-2 bg-[#7f13ec] hover:bg-[#7f13ec]/80"
            disabled={!selectedCardId || isShuffling}
            onClick={handleShuffle}
          >
            <Shuffle size={20} />
            {t('pontaCarta.shuffleButton')}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleReset} 
            disabled={isShuffling && Boolean(selectedCardId)}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            {t('pontaCarta.resetButton')}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default PontaCarta;
