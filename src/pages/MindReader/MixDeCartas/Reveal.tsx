import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';
import { Shuffle, ArrowLeft } from 'lucide-react';

interface PlayingCard {
  rank: string;
  suit: string;
  suitSymbol: string;
  color: string;
}

interface DeckCard extends PlayingCard {
  value: number;
}

const suits = [
  { name: 'spades', symbol: '\u2660', color: 'black' },
  { name: 'hearts', symbol: '\u2665', color: 'red' },
  { name: 'diamonds', symbol: '\u2666', color: 'red' },
  { name: 'clubs', symbol: '\u2663', color: 'black' },
];

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const suitOrder = suits.reduce<Record<string, number>>((acc, suit, index) => {
  acc[suit.name] = index;
  return acc;
}, {});

const fullDeck: DeckCard[] = suits.flatMap((suit) =>
  ranks.map((rank, index) => ({
    rank,
    suit: suit.name,
    suitSymbol: suit.symbol,
    color: suit.color,
    value: index + 1,
  }))
);

const getCardKey = (rank: string, suit: string) => `${rank}-${suit}`;

type ReadingMode = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

// Converte carta para índice (1-52)
const getCardIndex = (suit: string, rank: string): number => {
  const suitIndex = suits.findIndex(s => s.name === suit);
  const rankIndex = ranks.indexOf(rank);
  return suitIndex * 13 + rankIndex + 1;
};

// Converte índice para binário de 6 bits
const decimalToBinary6 = (num: number): string => {
  return num.toString(2).padStart(6, '0');
};

// Escolhe o sentido aleatoriamente
const chooseModeRandomly = (): ReadingMode => {
  return Math.random() < 0.5 ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT';
};

// Gera sequência de 6 cartas
const generateSequence = (chosenSuit: string, chosenRank: string): PlayingCard[] => {
  const chosenIndex = getCardIndex(chosenSuit, chosenRank);
  const binaryBits = decimalToBinary6(chosenIndex).split('');
  const mode = chooseModeRandomly();
  const pattern = mode === 'LEFT_TO_RIGHT' ? binaryBits : [...binaryBits].reverse();
  const targetIndex = mode === 'LEFT_TO_RIGHT' ? 0 : pattern.length - 1;
  const usedCards = new Set<string>([getCardKey(chosenRank, chosenSuit)]);
  const availableCards = fullDeck.filter(card => !(card.rank === chosenRank && card.suit === chosenSuit));

  const pickCard = (color: string, minExclusive?: number): DeckCard => {
    let candidates = availableCards.filter(
      card => card.color === color && !usedCards.has(getCardKey(card.rank, card.suit))
    );

    if (typeof minExclusive === 'number') {
      const filtered = candidates.filter(card => card.value > minExclusive);
      if (filtered.length > 0) {
        candidates = filtered;
      }
    }

    candidates.sort((a, b) => {
      if (a.value !== b.value) {
        return a.value - b.value;
      }
      return suitOrder[a.suit] - suitOrder[b.suit];
    });

    const selectedCard = candidates[0];
    if (!selectedCard) {
      throw new Error('No available cards for the requested color pattern');
    }

    usedCards.add(getCardKey(selectedCard.rank, selectedCard.suit));
    return selectedCard;
  };

  const sequence: DeckCard[] = new Array(6);
  const anchorColor = pattern[targetIndex] === '1' ? 'red' : 'black';
  const anchorCard = pickCard(anchorColor);
  sequence[targetIndex] = anchorCard;
  const anchorValue = anchorCard.value;

  for (let i = 0; i < pattern.length; i++) {
    if (i === targetIndex) continue;
    const requiredColor = pattern[i] === '1' ? 'red' : 'black';
    const card = pickCard(requiredColor, anchorValue);
    sequence[i] = card;
  }

  return sequence.map(({ value, ...card }) => card);
};

export const Reveal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [revealCards, setRevealCards] = useState<PlayingCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const suit = searchParams.get('suit');
  const rank = searchParams.get('rank');

  useEffect(() => {
    if (!suit || !rank) {
      navigate('/mind-reader/mix-de-cartas');
      return;
    }
    shuffle();
  }, [suit, rank, navigate]);

  const shuffle = () => {
    if (!suit || !rank) return;
    
    setIsShuffling(true);
    setTimeout(() => {
      const newSequence = generateSequence(suit, rank);
      setRevealCards(newSequence);
      setIsShuffling(false);
    }, 300);
  };

  if (!suit || !rank) return null;

  const chosenSuitData = suits.find(s => s.name === suit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/mind-reader/mix-de-cartas')}
          className="gap-2"
        >
          <ArrowLeft size={20} />
          {t('common.back')}
        </Button>
      </div>

      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSelector />
        <LogoutButton />
      </div>

      <div className="max-w-6xl mx-auto pt-20 pb-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('mixDeCartas.revealTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t('mixDeCartas.revealSubtitle')}
          </p>
          
          <div className="inline-block mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">{t('mixDeCartas.chosenCard')}</p>
            <div className={`text-5xl font-bold ${chosenSuitData?.color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
              {rank}{chosenSuitData?.symbol}
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-3 md:grid-cols-6 gap-4 mb-8 transition-opacity duration-300 ${isShuffling ? 'opacity-0' : 'opacity-100'}`}>
          {revealCards.map((card, index) => (
            <Card
              key={index}
              className="aspect-[2/3] flex flex-col items-center justify-center bg-card border-2 shadow-lg animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`text-3xl md:text-4xl font-bold ${card.color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
                {card.rank}
              </div>
              <div className={`text-4xl md:text-5xl ${card.color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
                {card.suitSymbol}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={shuffle}
            disabled={isShuffling}
            size="lg"
            className="gap-2"
          >
            <Shuffle size={20} />
            {t('mixDeCartas.shuffleButton')}
          </Button>
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            {t('mixDeCartas.magicTip')}
          </p>
        </div>
      </div>
    </div>
  );
};
