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

const suits = [
  { name: 'spades', symbol: '♠', color: 'black' },
  { name: 'hearts', symbol: '♥', color: 'red' },
  { name: 'diamonds', symbol: '♦', color: 'red' },
  { name: 'clubs', symbol: '♣', color: 'black' },
];

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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

// Escolhe modo aleatoriamente
const chooseModeRandomly = (): 'A' | 'B' => {
  return Math.random() < 0.5 ? 'A' : 'B';
};

// Gera sequência de 6 cartas
const generateSequence = (chosenSuit: string, chosenRank: string): PlayingCard[] => {
  const chosenIndex = getCardIndex(chosenSuit, chosenRank);
  let binary = decimalToBinary6(chosenIndex);
  const mode = chooseModeRandomly();
  
  // Se modo B, inverter o binário
  if (mode === 'B') {
    binary = binary.split('').reverse().join('');
  }

  const sequence: PlayingCard[] = [];
  const usedCards = new Set<string>();
  usedCards.add(`${chosenRank}${chosenSuit}`);

  // Gerar 6 cartas baseadas no padrão binário
  for (let i = 0; i < 6; i++) {
    const needsRed = binary[i] === '1';
    let card: PlayingCard;
    
    do {
      const availableSuits = suits.filter(s => 
        (needsRed && s.color === 'red') || (!needsRed && s.color === 'black')
      );
      const randomSuit = availableSuits[Math.floor(Math.random() * availableSuits.length)];
      const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
      
      card = {
        rank: randomRank,
        suit: randomSuit.name,
        suitSymbol: randomSuit.symbol,
        color: randomSuit.color,
      };
    } while (usedCards.has(`${card.rank}${card.suit}`));
    
    usedCards.add(`${card.rank}${card.suit}`);
    sequence.push(card);
  }

  // Encontrar a menor carta (A=1, 2=2, ..., K=13)
  const getCardValue = (card: PlayingCard): number => {
    const rankIndex = ranks.indexOf(card.rank);
    return rankIndex + 1;
  };

  let minIndex = 0;
  let minValue = getCardValue(sequence[0]);
  
  for (let i = 1; i < sequence.length; i++) {
    const value = getCardValue(sequence[i]);
    if (value < minValue) {
      minValue = value;
      minIndex = i;
    }
  }

  // Reorganizar para que a menor carta fique na posição correta
  const targetPosition = mode === 'A' ? 0 : 5;
  if (minIndex !== targetPosition) {
    const temp = sequence[minIndex];
    sequence[minIndex] = sequence[targetPosition];
    sequence[targetPosition] = temp;
  }

  return sequence;
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
