import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GameLayout } from '@/components/GameLayout';
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
  const navigate = useNavigate();
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
    <GameLayout>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={() => navigate('/oi-sumida/instrucoes')}
          >
            Instruções
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Oi Sumida</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            className="w-full bg-[#7f13ec] hover:bg-[#7f13ec]/80" 
            onClick={handlePrimaryButton}
          >
            {isOiSumidaActive ? 'Reiniciar' : 'Embaralhar'}
          </Button>
          <Button 
            variant="secondary" 
            className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20" 
            onClick={handleOiSumida}
          >
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
                className="rounded-2xl border border-white/20 bg-black/50 shadow-lg p-1 flex items-center justify-center"
                style={{ aspectRatio: '2 / 3' }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={card.label}
                    className="h-full w-full object-contain rounded-xl"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white/70">{card.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
};

export default OiSumida;
