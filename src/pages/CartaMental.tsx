import { useMemo, useState } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

type SuitId = 'spades' | 'hearts' | 'diamonds' | 'clubs';

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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
  const [revealed, setRevealed] = useState(false);

  const effectiveRank = selectedRank ?? 'A';
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
    setRevealed(false);
  };

  const handleReveal = (suitId: SuitId) => {
    setSelectedSuit(suitId);
    setRevealed(true);
  };

  const resetSelection = () => {
    setSelectedRank(null);
    setSelectedSuit(null);
    setRevealed(false);
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            MindReader
          </p>
          <h1 className="mb-3 text-4xl font-extrabold text-foreground md:text-5xl">
            {t('cartaMental.title')}
          </h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground">
            {t('cartaMental.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-primary/15 bg-card/80 p-6 shadow-xl shadow-primary/10">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('cartaMental.gridInstruction')}</p>
              <p className="font-semibold text-primary">{t('cartaMental.aceHint')}</p>
            </div>
            <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-[32px] border-[6px] border-primary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-black tracking-widest text-primary/25 opacity-80">
                <span className="rotate-12 select-none">MindReader</span>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_50%)]" />
              <div className="absolute inset-3 grid grid-cols-3 grid-rows-4 gap-3">
                {ranks.map((rank) => (
                  <button
                    key={rank}
                    className="rounded-xl border border-dashed border-transparent bg-white/5 opacity-0 transition focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 hover:opacity-20"
                    aria-label={t('cartaMental.rankButtonAria', { rank })}
                    onClick={() => handleRankTouch(rank)}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-muted-foreground">
                {selectedRank
                  ? t('cartaMental.selectedRank', { rank: selectedRank })
                  : t('cartaMental.noRank')}
              </span>
              <Button variant="outline" size="sm" onClick={resetSelection}>
                {t('cartaMental.reset')}
              </Button>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-primary/15 bg-card/80 p-6 shadow-xl shadow-primary/10">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('cartaMental.suitsInstruction')}</p>
            </div>

            <div className="space-y-3">
              <p className="text-center font-semibold text-foreground">{t('cartaMental.revealButton')}</p>
              <div className="relative isolate overflow-hidden rounded-full border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 shadow-lg shadow-primary/20">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold uppercase tracking-[0.4em] text-primary/80">
                  {t('cartaMental.revealButton')}
                </div>
                <div className="grid grid-cols-4">
                  {suits.map((suit, index) => (
                    <button
                      key={suit.id}
                      className="h-16 w-full text-transparent transition hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
                      onClick={() => handleReveal(suit.id)}
                      aria-label={t('cartaMental.revealButtonAria', { suit: suitLabels[suit.id] })}
                      style={{ borderLeft: index === 0 ? undefined : '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <span className="sr-only">{suitLabels[suit.id]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-background/70 p-5 text-center shadow-inner shadow-primary/10">
              {revealed && selectedSuitData ? (
                <>
                  <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                    {t('cartaMental.revealedTitle')}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {t('cartaMental.revealedDescription', {
                      rank: effectiveRank,
                      suit: suitLabels[selectedSuitData.id],
                    })}
                  </p>
                  <div
                    className={`mx-auto mt-4 flex aspect-[7/10] w-40 flex-col justify-between rounded-2xl border-2 p-3 shadow-lg sm:w-52 ${
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
                      className={`text-center text-4xl font-bold ${
                        selectedSuitData.tone === 'red'
                          ? 'text-rose-600 drop-shadow-[0_0_4px_rgba(225,29,72,0.3)]'
                          : 'text-slate-900 drop-shadow-[0_0_4px_rgba(15,23,42,0.4)]'
                      }`}
                    >
                      {effectiveRank}
                    </div>
                    <div
                      className={`text-center text-5xl ${
                        selectedSuitData.tone === 'red'
                          ? 'text-rose-500 drop-shadow-[0_0_6px_rgba(225,29,72,0.3)]'
                          : 'text-slate-800 drop-shadow-[0_0_6px_rgba(15,23,42,0.35)]'
                      }`}
                    >
                      {selectedSuitData.symbol}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('cartaMental.noSuitSelected')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartaMental;
