import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { PointerEvent } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

type RankId = 'J' | 'Q' | 'K';

const suits: Array<{ id: SuitName; symbol: string; tone: 'red' | 'black' }> = [
  { id: 'spades', symbol: '\u2660', tone: 'black' },
  { id: 'hearts', symbol: '\u2665', tone: 'red' },
  { id: 'diamonds', symbol: '\u2666', tone: 'red' },
  { id: 'clubs', symbol: '\u2663', tone: 'black' },
];

const rankColumns: RankId[] = ['J', 'Q', 'K'];

const RaspaCarta = () => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'setup' | 'reveal'>('setup');
  const [selectedCard, setSelectedCard] = useState<{ rank: RankId; suit: SuitName } | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const scratchProgressRef = useRef(0);
  const [isOverlayCleared, setIsOverlayCleared] = useState(false);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const suitLabels = useMemo(
    () => ({
      spades: t('cartaMental.suits.spades'),
      hearts: t('cartaMental.suits.hearts'),
      diamonds: t('cartaMental.suits.diamonds'),
      clubs: t('cartaMental.suits.clubs'),
    }),
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      J: t('raspaCarta.columns.jacks'),
      Q: t('raspaCarta.columns.queens'),
      K: t('raspaCarta.columns.kings'),
    }),
    [t],
  );

  const faceLabels = useMemo(
    () => ({
      J: t('raspaCarta.faces.jack'),
      Q: t('raspaCarta.faces.queen'),
      K: t('raspaCarta.faces.king'),
    }),
    [t],
  );

  const selectedImage = useMemo(() => {
    if (!selectedCard) {
      return null;
    }
    return getCardImageSrc(selectedCard.rank, selectedCard.suit);
  }, [selectedCard]);

  const resetScratchSurface = useCallback(() => {
    const canvas = overlayRef.current;
    const container = cardRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const { width, height } = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.globalCompositeOperation = 'source-over';

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.85)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255, 255, 255, 0.18)';
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = 'destination-out';
  }, []);

  useEffect(() => {
    if (stage !== 'reveal' || !selectedCard) {
      return;
    }
    resetScratchSurface();
    scratchProgressRef.current = 0;
    setIsOverlayCleared(false);
  }, [stage, selectedCard, resetScratchSurface]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = overlayRef.current;
    if (!canvas || isOverlayCleared) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2);
    context.fill();

    const nextProgress = Math.min(100, scratchProgressRef.current + 3);
    scratchProgressRef.current = nextProgress;
    if (nextProgress >= 70) {
      setIsOverlayCleared(true);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsScratching(true);
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    event.preventDefault();
    scratchAt(event.clientX, event.clientY);
  };

  const stopScratching = () => {
    setIsScratching(false);
  };

  const handleSelectCard = (suit: SuitName, rank: RankId) => {
    setSelectedCard({ suit, rank });
    setStage('reveal');
  };

  const handleReset = () => {
    setStage('setup');
    setSelectedCard(null);
    scratchProgressRef.current = 0;
    setIsOverlayCleared(false);
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
            {t('raspaCarta.title')}
          </p>
          <p className="mt-3 text-base text-muted-foreground">{t('raspaCarta.subtitle')}</p>
        </div>

        {stage === 'setup' && (
          <div className="space-y-8 rounded-3xl border border-primary/10 bg-card/80 p-8 shadow-2xl shadow-primary/10">
            <p className="text-center text-sm text-muted-foreground">{t('raspaCarta.gridInstruction')}</p>
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
                {suits.map((suit) =>
                  rankColumns.map((rank) => (
                    <button
                      key={`${rank}-${suit.id}`}
                      className="rounded-xl bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                      aria-label={t('raspaCarta.gridButtonAria', {
                        rank: faceLabels[rank],
                        suit: suitLabels[suit.id],
                      })}
                      onClick={() => handleSelectCard(suit.id, rank)}
                      style={{ opacity: 0 }}
                    />
                  )),
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-8 bottom-5 grid grid-cols-3 gap-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                {rankColumns.map((rank) => (
                  <span key={rank}>{columnLabels[rank]}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'reveal' && selectedCard && selectedImage && (
          <div className="space-y-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isOverlayCleared ? t('raspaCarta.revealedMessage') : t('raspaCarta.scratchHint')}
            </p>
            <div className="flex justify-center">
              <div ref={cardRef} className="relative aspect-[2/3] w-full max-w-md overflow-hidden rounded-[32px] border-[6px] border-primary/30 bg-slate-900 shadow-2xl">
                <img
                  src={selectedImage}
                  alt={`${selectedCard.rank} ${suitLabels[selectedCard.suit]}`}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
                <canvas
                  ref={overlayRef}
                  className={`absolute inset-0 touch-none ${isOverlayCleared ? 'pointer-events-none opacity-0' : 'opacity-95'} transition-opacity duration-700`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopScratching}
                  onPointerLeave={stopScratching}
                  onPointerCancel={stopScratching}
                />
                {!isOverlayCleared && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={handleReset}>
                {t('raspaCarta.reset')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaspaCarta;
