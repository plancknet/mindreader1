import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Suit = 'espada' | 'ouros' | 'paus' | 'copas';

type CardDefinition = {
  rank: string;
  label: string;
  suit: Suit;
};

const initialDeck: CardDefinition[] = [
  { rank: 'A', label: 'A de espada', suit: 'espada' },
  { rank: '5', label: '5 de ouros', suit: 'ouros' },
  { rank: '7', label: '7 de paus', suit: 'paus' },
  { rank: '9', label: '9 de copas', suit: 'copas' },
  { rank: 'Q', label: 'Q de espada', suit: 'espada' },
  { rank: '2', label: '2 de ouros', suit: 'ouros' },
  { rank: '8', label: '8 de paus', suit: 'paus' },
  { rank: 'J', label: 'J de copas', suit: 'copas' },
  { rank: 'K', label: 'K de espada', suit: 'espada' },
];

const oiSumidaDeck: CardDefinition[] = [
  { rank: 'A', label: 'A de paus', suit: 'paus' },
  { rank: '5', label: '5 de copas', suit: 'copas' },
  { rank: '7', label: '7 de espadas', suit: 'espada' },
  { rank: '9', label: '9 de ouros', suit: 'ouros' },
  { rank: 'Q', label: 'Q de paus', suit: 'paus' },
  { rank: '2', label: '2 de copas', suit: 'copas' },
  { rank: '8', label: '8 de espadas', suit: 'espada' },
  { rank: 'J', label: 'J de ouros', suit: 'ouros' },
  { rank: 'K', label: 'K de paus', suit: 'paus' },
];

const suitStyles: Record<Suit, string> = {
  espada: 'text-slate-800',
  paus: 'text-emerald-700',
  ouros: 'text-amber-600',
  copas: 'text-rose-600',
};

const suitLabels: Record<Suit, string> = {
  espada: 'Espada',
  paus: 'Paus',
  ouros: 'Ouros',
  copas: 'Copas',
};

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
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-white/80 shadow-[0_12px_35px_rgba(15,23,42,0.08)] p-2 flex flex-col items-center justify-between"
              style={{ aspectRatio: '2 / 3' }}
            >
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <span className={`text-4xl font-bold ${suitStyles[card.suit]}`}>{card.rank}</span>
              <span className={`text-sm font-semibold ${suitStyles[card.suit]}`}>{suitLabels[card.suit]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OiSumida;
