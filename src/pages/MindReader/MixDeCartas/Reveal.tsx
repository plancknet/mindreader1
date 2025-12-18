import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameLayout } from '@/components/GameLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Shuffle } from 'lucide-react';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

interface PlayingCard {
  rank: string;
  suit: SuitName;
  suitSymbol: string;
  color: 'red' | 'black';
}

interface DeckCard extends PlayingCard {
  value: number;
}

const suits: Array<{ name: SuitName; symbol: string; color: 'red' | 'black' }> = [
  { name: 'spades', symbol: '\u2660', color: 'black' },
  { name: 'hearts', symbol: '\u2665', color: 'red' },
  { name: 'diamonds', symbol: '\u2666', color: 'red' },
  { name: 'clubs', symbol: '\u2663', color: 'black' },
];

const isValidSuit = (value: string | null): value is SuitName => {
  if (!value) return false;
  return suits.some((suit) => suit.name === value);
};

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const fullDeck: DeckCard[] = suits.flatMap((suit) =>
  ranks.map((rank, index) => ({
    rank,
    suit: suit.name,
    suitSymbol: suit.symbol,
    color: suit.color,
    value: index + 1,
  }))
);

type ReadingMode = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

const getCardIndex = (suit: SuitName, rank: string): number => {
  const suitIndex = suits.findIndex(s => s.name === suit);
  const rankIndex = ranks.indexOf(rank);
  return suitIndex * 13 + rankIndex + 1;
};

const decimalToBinary6 = (num: number): string => {
  return num.toString(2).padStart(6, '0');
};

const pickRandomItem = <T,>(items: T[]): T => {
  if (!items.length) {
    throw new Error('No items available for random selection');
  }
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

const bitToColor = (bit: string): 'red' | 'black' => (bit === '1' ? 'red' : 'black');

const chooseModeRandomly = (): ReadingMode => {
  return Math.random() < 0.5 ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT';
};

const generateSequence = (chosenSuit: SuitName, chosenRank: string): PlayingCard[] => {
  const chosenIndex = getCardIndex(chosenSuit, chosenRank);
  const binaryBits = decimalToBinary6(chosenIndex).split('');
  const mode = chooseModeRandomly();
  const pattern = mode === 'LEFT_TO_RIGHT' ? binaryBits : [...binaryBits].reverse();
  const targetIndex = mode === 'LEFT_TO_RIGHT' ? 0 : pattern.length - 1;
  const patternColors = pattern.map(bitToColor);
  const anchorColor = patternColors[targetIndex];

  const otherColorNeeds: Record<'red' | 'black', number> = { red: 0, black: 0 };
  patternColors.forEach((color, index) => {
    if (index === targetIndex) return;
    otherColorNeeds[color] += 1;
  });

  const availableCards = fullDeck.filter(card => !(card.rank === chosenRank && card.suit === chosenSuit));
  const cardsByColor: Record<'red' | 'black', DeckCard[]> = {
    red: availableCards.filter(card => card.color === 'red'),
    black: availableCards.filter(card => card.color === 'black'),
  };

  const validAnchorCandidates = cardsByColor[anchorColor].filter(card => {
    const higherRed = cardsByColor.red.filter(c => c.value > card.value).length;
    const higherBlack = cardsByColor.black.filter(c => c.value > card.value).length;
    return higherRed >= otherColorNeeds.red && higherBlack >= otherColorNeeds.black;
  });

  if (!validAnchorCandidates.length) {
    throw new Error('Unable to find a valid anchor card for the requested pattern');
  }

  const anchorCard = pickRandomItem(validAnchorCandidates);
  const pools: Record<'red' | 'black', DeckCard[]> = {
    red: cardsByColor.red.filter(card => card.value > anchorCard.value),
    black: cardsByColor.black.filter(card => card.value > anchorCard.value),
  };

  const sequence: DeckCard[] = new Array(pattern.length);
  sequence[targetIndex] = anchorCard;

  for (let i = 0; i < pattern.length; i++) {
    if (i === targetIndex) continue;
    const color = patternColors[i];
    const pool = pools[color];
    if (!pool.length) {
      throw new Error('Unable to complete the sequence with random cards');
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const [selected] = pool.splice(randomIndex, 1);
    sequence[i] = selected;
  }

  return sequence.map(({ value, ...card }) => card);
};

export const Reveal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [revealCards, setRevealCards] = useState<PlayingCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const { trackUsage } = useGameUsageTracker(GAME_IDS.MIX_DE_CARTAS);

  const suitParam = searchParams.get('suit');
  const rank = searchParams.get('rank');
  const suit = isValidSuit(suitParam) ? suitParam : null;

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
      trackUsage();
    }, 300);
  };

  if (!suit || !rank) return null;

  return (
    <GameLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('mixDeCartas.revealTitle')}
          </h1>
          <p className="text-lg text-white/70 mb-6">
            {t('mixDeCartas.revealSubtitle')}
          </p>
        </div>

        <div className={`grid grid-cols-3 md:grid-cols-6 gap-4 mb-8 transition-opacity duration-300 ${isShuffling ? 'opacity-0' : 'opacity-100'}`}>
          {revealCards.map((card, index) => {
            const imageSrc = getCardImageSrc(card.rank, card.suit);
            return (
            <Card
              key={`${card.rank}${card.suit}${index}`}
              className="aspect-[2/3] flex items-center justify-center overflow-hidden shadow-lg animate-scale-in rounded-md bg-black/50 border-white/10"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={imageSrc || '/placeholder.svg'}
                alt={`${card.rank} ${card.suit}`}
                className="h-full w-full rounded-md object-cover"
                draggable={false}
              />
            </Card>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button 
            onClick={shuffle} 
            disabled={isShuffling} 
            size="lg" 
            className="gap-2 bg-[#7f13ec] hover:bg-[#7f13ec]/80"
          >
            <Shuffle size={20} />
            {t('mixDeCartas.shuffleButton')}
          </Button>
          <Button
            onClick={() => navigate('/mind-reader/mix-de-cartas')}
            variant="outline"
            size="lg"
            disabled={isShuffling}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            {t('mixDeCartas.resetButton')}
          </Button>
        </div>

        <div className="mt-12 p-6 bg-[#1e1b4b]/30 rounded-lg text-center border border-white/10">
          <p className="text-sm text-white/70">
            {t('mixDeCartas.magicTip')}
          </p>
        </div>
      </div>
    </GameLayout>
  );
};
