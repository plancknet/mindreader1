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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-primary/15 px-4 py-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-20 left-6 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-40 w-40 rotate-45 rounded-3xl border border-primary/10" />
      </div>

      <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector />
        <LogoutButton />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 pt-16 pb-10">
        <div className="rounded-3xl border border-primary/20 bg-background/80 p-6 text-center shadow-2xl shadow-primary/10 backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            {t('mixDeCartas.magicTip')}
          </p>
          <h1 className="mb-3 text-4xl font-extrabold text-foreground md:text-5xl">
            {t('mixDeCartas.chooseTitle')}
          </h1>
          <p className="text-base text-muted-foreground">
            {t('mixDeCartas.chooseSubtitle')}
          </p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-card/70 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            <span>🎴</span>
            <span>{t('mixDeCartas.chooseTitle')}</span>
            <span>🎴</span>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 sm:gap-3 md:grid-cols-8 lg:grid-cols-13">
            {suits.map((suit) =>
              ranks.map((rank) => (
                <Card
                  key={`${rank}${suit.symbol}`}
                  className="group relative mx-auto flex aspect-[7/10] w-full max-w-[62px] flex-col items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card/80 to-card/60 p-2 text-center shadow-lg shadow-primary/10 transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:border-primary/70 hover:shadow-primary/40 sm:max-w-[78px]"
                  onClick={() => handleCardSelect(suit.name, rank)}
                  aria-label={`${rank} ${suit.name}`}
                >
                  <div className="flex w-full items-center justify-between text-[0.65rem] text-muted-foreground">
                    <span>★</span>
                    <span>☆</span>
                  </div>
                  <div
                    className={`text-2xl font-bold sm:text-3xl ${
                      suit.color === 'red' ? 'text-red-500' : 'text-foreground'
                    }`}
                  >
                    {rank}
                  </div>
                  <div
                    className={`text-3xl sm:text-4xl ${
                      suit.color === 'red' ? 'text-red-500' : 'text-foreground'
                    }`}
                  >
                    {suit.symbol}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
