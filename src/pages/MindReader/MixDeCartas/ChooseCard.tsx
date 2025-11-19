import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';

// Naipes e valores para as 52 cartas
const suits = [
  { symbol: '♠', name: 'spades', color: 'black' },
  { symbol: '♥', name: 'hearts', color: 'red' },
  { symbol: '♦', name: 'diamonds', color: 'red' },
  { symbol: '♣', name: 'clubs', color: 'black' },
];

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const ChooseCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCardSelect = (suit: string, rank: string) => {
    navigate(`/mind-reader/mix-de-cartas/reveal?suit=${suit}&rank=${rank}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSelector />
        <LogoutButton />
      </div>

      <div className="max-w-6xl mx-auto pt-20 pb-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('mixDeCartas.chooseTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('mixDeCartas.chooseSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-13 gap-2 md:gap-3">
          {suits.map((suit) =>
            ranks.map((rank) => (
              <Card
                key={`${rank}${suit.symbol}`}
                className="aspect-[2/3] flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 bg-card border-2 hover:border-primary"
                onClick={() => handleCardSelect(suit.name, rank)}
              >
                <div className={`text-3xl md:text-4xl font-bold ${suit.color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
                  {rank}
                </div>
                <div className={`text-4xl md:text-5xl ${suit.color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
                  {suit.symbol}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
