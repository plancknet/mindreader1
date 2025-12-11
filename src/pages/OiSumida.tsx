import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeaderControls } from '@/components/HeaderControls';
import { getCardImageSrc, type SuitName } from '@/lib/cardImages';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

type CardDefinition = {
  rank: string;
  label: string;
  suit: SuitName;
};

const BASE_DECK: CardDefinition[] = [
  { rank: 'A', label: 'A de paus', suit: 'clubs' },
  { rank: 'Q', label: 'Q de copas', suit: 'hearts' },
  { rank: 'J', label: 'J de espada', suit: 'spades' },
  { rank: 'K', label: 'K de ouros', suit: 'diamonds' },
  { rank: '5', label: '5 de espada', suit: 'spades' },
  { rank: 'A', label: 'A de copas', suit: 'hearts' },
  { rank: 'Q', label: 'Q de paus', suit: 'clubs' },
  { rank: 'J', label: 'J de copas', suit: 'hearts' },
  { rank: 'K', label: 'K de espada', suit: 'spades' },
];

const OI_SUMIDA_DECK: CardDefinition[] = [
  { rank: 'A', label: 'A de espada', suit: 'spades' },
  { rank: 'Q', label: 'Q de ouros', suit: 'diamonds' },
  { rank: 'J', label: 'J de paus', suit: 'clubs' },
  { rank: 'K', label: 'K de copas', suit: 'hearts' },
  { rank: 'A', label: 'A de ouros', suit: 'diamonds' },
  { rank: 'Q', label: 'Q de espadas', suit: 'spades' },
  { rank: 'J', label: 'J de ouros', suit: 'diamonds' },
  { rank: 'K', label: 'K de paus', suit: 'clubs' },
];

const shuffleCards = (cards: CardDefinition[]) => {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const OiSumida = () => {
  const [cards, setCards] = useState<CardDefinition[]>([...BASE_DECK]);
  const [isOiSumidaActive, setIsOiSumidaActive] = useState(false);
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.OI_SUMIDA);

  const handlePrimaryButton = () => {
    if (isOiSumidaActive) {
      setCards([...BASE_DECK]);
      setIsOiSumidaActive(false);
      resetUsageTracking();
      return;
    }
    trackUsage();
    setCards((prev) => shuffleCards(prev));
  };

  const handleOiSumida = () => {
    trackUsage();
    setCards([...OI_SUMIDA_DECK]);
    setIsOiSumidaActive(true);
  };

  const displayCards: (CardDefinition | null)[] =
    cards.length === 9
      ? cards
      : [...cards, ...Array.from({ length: 9 - cards.length }, () => null)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
          <HeaderControls showExtras />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Oi Sumida</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full" onClick={handlePrimaryButton}>
            {isOiSumidaActive ? 'Reiniciar' : 'Embaralhar'}
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleOiSumida}>
            Oi Sumida
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {displayCards.map((card, index) => {
            if (!card) {
              return (
                <div
                  key={`placeholder-${index}`}
                  className="rounded-2xl border border-transparent"
                  style={{ aspectRatio: '2 / 3' }}
                  aria-hidden="true"
                />
              );
            }
            const imageSrc = getCardImageSrc(card.rank, card.suit);
            return (
              <div
                key={`${card.rank}-${card.suit}-${index}`}
                className="rounded-2xl border border-border bg-black shadow-[0_12px_35px_rgba(15,23,42,0.25)] p-1 flex items-center justify-center"
                style={{ aspectRatio: '2 / 3' }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={card.label}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">{card.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OiSumida;
