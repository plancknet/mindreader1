import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { HeaderControls } from '@/components/HeaderControls';
import { useTranslation } from '@/hooks/useTranslation';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

const suits: Array<{ symbol: string; name: SuitName; color: 'red' | 'black' }> = [
  { symbol: '\u2660', name: 'spades', color: 'black' },
  { symbol: '\u2665', name: 'hearts', color: 'red' },
  { symbol: '\u2666', name: 'diamonds', color: 'red' },
  { symbol: '\u2663', name: 'clubs', color: 'black' },
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
            {t('mixDeCartas.magicTip')}
          </p>
          <h1 className="mb-2 text-4xl font-extrabold text-foreground md:text-5xl">
            {t('mixDeCartas.chooseTitle')}
          </h1>
          <p className="text-base text-muted-foreground">{t('mixDeCartas.chooseSubtitle')}</p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-card/70 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <div className="mb-4 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground">
            <span>{t('mixDeCartas.chooseTitle')}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6 sm:gap-2.5 md:grid-cols-8 lg:grid-cols-13">
            {suits.map((suit) =>
              ranks.map((rank) => {
                const imgSrc = getCardImageSrc(rank, suit.name);
                return (
                <Card
                  key={`${rank}${suit.symbol}`}
                  className="group relative mx-auto flex aspect-[7/10] w-full max-w-[56px] items-center justify-center overflow-hidden rounded-md transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 sm:max-w-[68px] cursor-pointer"
                  onClick={() => handleCardSelect(suit.name, rank)}
                  aria-label={`${rank} ${suit.name}`}
                >
                  <img
                    src={imgSrc || '/placeholder.svg'}
                    alt={`${rank} ${suit.name}`}
                    className="h-full w-full rounded-md object-cover"
                    draggable={false}
                  />
                </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
