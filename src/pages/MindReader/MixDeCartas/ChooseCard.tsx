import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { GameLayout } from '@/components/GameLayout';
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
    <GameLayout>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-8">
        <div className="rounded-3xl border border-[#7f13ec]/30 bg-[#1e1b4b]/50 p-6 text-center shadow-lg backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]">
            {t('mixDeCartas.magicTip')}
          </p>
          <h1 className="mb-2 text-4xl font-extrabold text-white md:text-5xl">
            {t('mixDeCartas.chooseTitle')}
          </h1>
          <p className="text-base text-white/70">{t('mixDeCartas.chooseSubtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#1e1b4b]/30 p-4 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.45em] text-white/70">
            <span>{t('mixDeCartas.chooseTitle')}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6 sm:gap-2.5 md:grid-cols-8 lg:grid-cols-13">
            {suits.map((suit) =>
              ranks.map((rank) => {
                const imgSrc = getCardImageSrc(rank, suit.name);
                return (
                <Card
                  key={`${rank}${suit.symbol}`}
                  className="group relative mx-auto flex aspect-[7/10] w-full max-w-[56px] items-center justify-center overflow-hidden rounded-md transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-[#7f13ec]/30 sm:max-w-[68px] cursor-pointer bg-black/50 border-white/10"
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
    </GameLayout>
  );
};
