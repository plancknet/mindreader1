import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCardImageSrc, type SuitName } from '@/lib/cardImages';

type CardDefinition = {
  rank: string;
  label: string;
  suit: SuitName;
};

const initialDeck: CardDefinition[] = [
  { rank: 'A', label: 'A de espada', suit: 'spades' },
  { rank: 'Q', label: 'Q de ouros', suit: 'diamonds' },
  { rank: 'J', label: 'J de paus', suit: 'clubs' },
  { rank: 'K', label: 'K de copas', suit: 'hearts' },
  { rank: '5', label: '5 de espada', suit: 'spades' },
  { rank: 'J', label: 'J de espada', suit: 'spades' },
  { rank: 'K', label: 'K de ouros', suit: 'diamonds' },
  { rank: 'A', label: 'A de paus', suit: 'clubs' },
  { rank: 'Q', label: 'Q de copas', suit: 'hearts' },
];

const oiSumidaDeck: CardDefinition[] = [
  { rank: 'A', label: 'A de paus', suit: 'clubs' },
  { rank: 'Q', label: 'Q de copas', suit: 'hearts' },
  { rank: 'J', label: 'J de espadas', suit: 'spades' },
  { rank: 'K', label: 'K de ouros', suit: 'diamonds' },
  { rank: '5', label: '5 de paus', suit: 'clubs' },
  { rank: 'J', label: 'J de paus', suit: 'clubs' },
  { rank: 'K', label: 'K de copas', suit: 'hearts' },
  { rank: 'A', label: 'A de espadas', suit: 'spades' },
  { rank: 'Q', label: 'Q de ouros', suit: 'diamonds' },
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
  const [cards, setCards] = useState<CardDefinition[]>(initialDeck);

  const handleShuffle = () => {
    setCards((prev) => shuffleCards(prev));
  };

  const handleOiSumida = () => {
    setCards([...oiSumidaDeck]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Oi Sumida</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full" onClick={handleShuffle}>
            Embaralhar
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleOiSumida}>
            Oi Sumida
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {cards.map((card) => {
            const imageSrc = getCardImageSrc(card.rank, card.suit);
            return (
              <div
                key={`${card.label}-${card.rank}-${card.suit}`}
                className="rounded-2xl border border-border bg-white/90 shadow-[0_12px_35px_rgba(15,23,42,0.1)] p-1 flex items-center justify-center"
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
