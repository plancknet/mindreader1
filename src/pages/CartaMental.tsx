import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { GameLayout } from '@/components/GameLayout';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

type SuitId = 'spades' | 'hearts' | 'diamonds' | 'clubs';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'];
const deckRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const suits: Array<{ id: SuitId; symbol: string; tone: 'red' | 'black' }> = [
  { id: 'spades', symbol: '♠', tone: 'black' },
  { id: 'hearts', symbol: '♥', tone: 'red' },
  { id: 'diamonds', symbol: '♦', tone: 'red' },
  { id: 'clubs', symbol: '♣', tone: 'black' },
];

const getCardImageIndex = (rank: string, suit: SuitId | null): number | null => {
  if (!suit) {
    return null;
  }

  const suitIndex = suits.findIndex((s) => s.id === suit);
  if (suitIndex === -1) {
    return null;
  }

  const rankIndex = deckRanks.indexOf(rank.toUpperCase());
  if (rankIndex === -1) {
    return null;
  }

  return suitIndex * deckRanks.length + rankIndex + 1;
};

const CartaMental = () => {
  const { t } = useTranslation();
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.CARTA_MENTAL);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<SuitId | null>(null);
  const [stage, setStage] = useState<'setup' | 'revealed'>('setup');

  const suitLabels = useMemo(
    () => ({
      spades: t('cartaMental.suits.spades'),
      hearts: t('cartaMental.suits.hearts'),
      diamonds: t('cartaMental.suits.diamonds'),
      clubs: t('cartaMental.suits.clubs'),
    }),
    [t],
  );

  const effectiveRank = selectedRank ?? 'K';
  const revealedCard = useMemo(() => {
    if (!selectedSuit) {
      return null;
    }

    const index = getCardImageIndex(effectiveRank, selectedSuit);
    if (!index) {
      return null;
    }

    return {
      index,
      src: `/baralho/${index}.webp`,
      alt: `${effectiveRank} ${suitLabels[selectedSuit]}`,
    };
  }, [effectiveRank, selectedSuit, suitLabels]);

  const handleRankTouch = (rank: string) => {
    setSelectedRank(rank);
    if (stage !== 'setup') {
      setStage('setup');
    }
  };

  const handleReveal = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const quadrant = Math.min(3, Math.max(0, Math.floor(relativeX * 4)));
    const suitId = suits[quadrant]?.id ?? 'spades';
    setSelectedSuit(suitId);
    setStage('revealed');
    trackUsage();
  };

  const resetSelection = () => {
    setSelectedRank(null);
    setSelectedSuit(null);
    setStage('setup');
    resetUsageTracking();
  };

  return (
    <GameLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8">
        <div className="rounded-3xl border border-[#7f13ec]/30 bg-[#1e1b4b]/50 p-6 text-center shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]">
            MindReader
          </p>
        </div>

        {stage === 'setup' && (
          <div className="space-y-8 rounded-3xl border border-white/10 bg-[#1e1b4b]/30 p-8 shadow-2xl">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-[32px] border-[6px] border-[#7f13ec]/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <img
                  src="/icons/icon-144x144.png"
                  alt="MindReader"
                  className="h-24 w-24 rotate-6 select-none opacity-60"
                  draggable={false}
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_50%)]" />
              <div className="absolute inset-4 grid grid-cols-3 grid-rows-4 gap-3">
                {ranks.map((rank) => (
                  <button
                    key={rank}
                    className="rounded-xl bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f13ec]/70"
                    aria-label={t('cartaMental.rankButtonAria', { rank })}
                    onClick={() => handleRankTouch(rank)}
                    style={{ opacity: 0 }}
                  />
                ))}
              </div>
            </div>

            <Button
              className="relative mx-auto flex w-full max-w-md items-center justify-center rounded-full border border-[#7f13ec]/30 bg-gradient-to-r from-[#7f13ec]/30 via-[#7f13ec]/20 to-blue-500/30 py-6 text-lg font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-[#7f13ec]/20"
              onClick={handleReveal}
            >
              {t('cartaMental.revealButton')}
            </Button>
          </div>
        )}

        {stage === 'revealed' && revealedCard && (
          <div className="space-y-8 text-center">
            <div className="flex justify-center">
              <div 
                key={revealedCard.index} 
                className="animate-magical-reveal flex justify-center"
                style={{ perspective: "1000px" }}
              >
                <img
                  src={revealedCard.src}
                  alt={revealedCard.alt}
                  className="h-auto w-full max-w-[14.6rem] select-none drop-shadow-2xl animate-glow-pulse rounded-lg"
                  draggable={false}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={resetSelection}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                {t('cartaMental.reset')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default CartaMental;
