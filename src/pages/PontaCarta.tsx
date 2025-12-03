import { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits: Array<{ name: SuitName; symbol: string; tone: 'red' | 'black' }> = [
  { name: 'spades', symbol: '\u2660', tone: 'black' },
  { name: 'hearts', symbol: '\u2665', tone: 'red' },
  { name: 'diamonds', symbol: '\u2666', tone: 'red' },
  { name: 'clubs', symbol: '\u2663', tone: 'black' },
];

const allowedIndices = [1, 3, 5, 6, 7, 9, 4, 16, 18, 19, 20, 22, 33, 40, 42, 44, 45, 46, 48];

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
  };

  const handleShuffle = async () => {
    if (!selectedCardId) return;
    setIsShuffling(true);
    setTimeout(() => {
      setCardOrder((prev) => shuffleArray(prev));
      setHasShuffled(true);
      setIsShuffling(false);
    }, 180);

  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/15 px-4 py-6">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-16 left-6 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-4 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-40 w-40 rotate-45 rounded-3xl border border-primary/10" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 pt-16 pb-10">
        <div className="rounded-3xl border border-primary/15 bg-background/80 p-6 text-center shadow-2xl shadow-primary/10 backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            {t('pontaCarta.hint')}
          </p>
          <h1 className="mb-2 text-4xl font-extrabold text-foreground md:text-5xl">
            {t('pontaCarta.chooseTitle')}
          </h1>
          <p className="text-base text-muted-foreground">{t('pontaCarta.chooseSubtitle')}</p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-card/70 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <div className="mb-4 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
            <span>\u2665</span>
            <span>{t('pontaCarta.chooseTitle')}</span>
            <span>\u2660</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {cardOrder.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <Card
                  key={card.id}
                  className={`group relative flex aspect-[7/10] w-full items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 ${isSelected ? 'border-primary bg-primary/10' : 'border-white/10'}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectCard(card.id)}
                >
                  {card.imageSrc ? (
                    <img
                      src={card.imageSrc}
                      alt={${card.rank} }
                      className={`h-full w-full object-cover transition-transform duration-300 ${hasShuffled && isSelected ? 'rotate-180' : ''} ${isShuffling ? 'opacity-60' : 'opacity-100'}`}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-2xl font-bold">
                      <span className={card.tone === 'red' ? 'text-rose-400' : 'text-slate-100'}>{card.rank}</span>
                      <span className={card.tone === 'red' ? 'text-rose-400' : 'text-slate-100'}>{card.suitSymbol}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="gap-2"
            disabled={!selectedCardId || isShuffling}
            onClick={handleShuffle}
          >
            <Shuffle size={20} />
            {t('pontaCarta.shuffleButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PontaCarta;
