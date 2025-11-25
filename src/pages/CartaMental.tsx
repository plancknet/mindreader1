import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

type SuitId = 'spades' | 'hearts' | 'diamonds' | 'clubs';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'];

const suits: Array<{ id: SuitId; symbol: string; tone: 'red' | 'black' }> = [
  { id: 'spades', symbol: '♠', tone: 'black' },
  { id: 'hearts', symbol: '♥', tone: 'red' },
  { id: 'diamonds', symbol: '♦', tone: 'red' },
  { id: 'clubs', symbol: '♣', tone: 'black' },
];

const CartaMental = () => {
  const { t } = useTranslation();
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<SuitId | null>(null);
  const [stage, setStage] = useState<'setup' | 'revealed'>('setup');

  const effectiveRank = selectedRank ?? 'K';
  const selectedSuitData = suits.find((suit) => suit.id === selectedSuit);

  const suitLabels = useMemo(
    () => ({
      spades: t('cartaMental.suits.spades'),
      hearts: t('cartaMental.suits.hearts'),
      diamonds: t('cartaMental.suits.diamonds'),
      clubs: t('cartaMental.suits.clubs'),
    }),
    [t],
  );

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
  };

  const resetSelection = () => {
    setSelectedRank(null);
    setSelectedSuit(null);
    setStage('setup');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/20 px-4 py-6">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 pt-16 pb-10">
        <div className="rounded-3xl border border-primary/20 bg-background/80 p-6 text-center shadow-2xl shadow-primary/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            MindReader
          </p>
        </div>

        {stage === 'setup' && (
          <div className="space-y-8 rounded-3xl border border-primary/10 bg-card/80 p-8 shadow-2xl shadow-primary/10">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-[32px] border-[6px] border-primary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
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
                    className="rounded-xl bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                    aria-label={t('cartaMental.rankButtonAria', { rank })}
                    onClick={() => handleRankTouch(rank)}
                    style={{ opacity: 0 }}
                  />
                ))}
              </div>
            </div>

            <Button
              className="relative mx-auto flex w-full max-w-md items-center justify-center rounded-full border border-primary/30 bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30 py-6 text-lg font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-primary/20"
              onClick={handleReveal}
            >
              {t('cartaMental.revealButton')}
            </Button>
          </div>
        )}

        {stage === 'revealed' && selectedSuitData && (
          <div className="space-y-8 rounded-3xl border border-primary/10 bg-card/80 p-8 text-center shadow-2xl shadow-primary/10">
            <div
              className={`mx-auto flex aspect-[7/10] w-48 flex-col justify-between rounded-3xl border-4 p-4 shadow-2xl sm:w-60 ${
                selectedSuitData.tone === 'red'
                  ? 'border-rose-200 bg-gradient-to-br from-white to-rose-50'
                  : 'border-slate-300 bg-gradient-to-br from-slate-50 via-slate-200 to-slate-300'
              }`}
            >
              <div
                className={`flex items-center justify-between text-sm ${
                  selectedSuitData.tone === 'red' ? 'text-rose-500' : 'text-slate-700'
                }`}
              >
                <span>{selectedSuitData.symbol}</span>
                <span>{selectedSuitData.symbol}</span>
              </div>
              <div
                className={`text-center text-5xl font-black ${
                  selectedSuitData.tone === 'red'
                    ? 'text-rose-600 drop-shadow-[0_0_6px_rgba(225,29,72,0.4)]'
                    : 'text-slate-900 drop-shadow-[0_0_6px_rgba(15,23,42,0.45)]'
                }`}
              >
                {effectiveRank}
              </div>
              <div
                className={`text-center text-6xl ${
                  selectedSuitData.tone === 'red'
                    ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]'
                    : 'text-slate-800 drop-shadow-[0_0_8px_rgba(15,23,42,0.35)]'
                }`}
              >
                {selectedSuitData.symbol}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={resetSelection}>
                {t('cartaMental.reset')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartaMental;
