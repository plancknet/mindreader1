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

type CardData = {
  rank: RankId;
  suit: SuitName;
  imageSrc: string;
};

const RaspaCarta = () => {
  const { t } = useTranslation();
  const [scratchingCardIndex, setScratchingCardIndex] = useState<number | null>(null);
  const overlayRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scratchProgress = useRef<number[]>(new Array(12).fill(0));

  const cards = useMemo<CardData[]>(() => {
    const allCards: CardData[] = [];
    suits.forEach((suit) => {
      rankColumns.forEach((rank) => {
        const imageSrc = getCardImageSrc(rank, suit.id);
        if (imageSrc) {
          allCards.push({ rank, suit: suit.id, imageSrc });
        }
      });
    });
    return allCards;
  }, []);

  const suitLabels = useMemo(
    () => ({
      spades: t('cartaMental.suits.spades'),
      hearts: t('cartaMental.suits.hearts'),
      diamonds: t('cartaMental.suits.diamonds'),
      clubs: t('cartaMental.suits.clubs'),
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

  const initializeScratchSurface = useCallback((index: number) => {
    const canvas = overlayRefs.current[index];
    const container = cardRefs.current[index];
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
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.95)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255, 255, 255, 0.12)';
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = 'destination-out';
  }, []);

  useEffect(() => {
    cards.forEach((_, index) => {
      initializeScratchSurface(index);
    });
  }, [cards, initializeScratchSurface]);

  const scratchAt = (index: number, clientX: number, clientY: number) => {
    const canvas = overlayRefs.current[index];
    if (!canvas || scratchProgress.current[index] >= 70) {
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
    context.arc(x, y, 50, 0, Math.PI * 2);
    context.fill();

    scratchProgress.current[index] = Math.min(100, scratchProgress.current[index] + 4);
  };

  const handlePointerDown = (index: number) => (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setScratchingCardIndex(index);
    scratchAt(index, event.clientX, event.clientY);
  };

  const handlePointerMove = (index: number) => (event: PointerEvent<HTMLCanvasElement>) => {
    if (scratchingCardIndex !== index) return;
    event.preventDefault();
    scratchAt(index, event.clientX, event.clientY);
  };

  const stopScratching = () => {
    setScratchingCardIndex(null);
  };

  const handleReset = () => {
    scratchProgress.current = new Array(12).fill(0);
    cards.forEach((_, index) => {
      initializeScratchSurface(index);
    });
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

        <div className="space-y-6 rounded-3xl border border-primary/10 bg-card/80 p-8 shadow-2xl shadow-primary/10">
          <p className="text-center text-sm text-muted-foreground">{t('raspaCarta.scratchHint')}</p>
          
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {cards.map((card, index) => (
              <div
                key={`${card.rank}-${card.suit}`}
                ref={(el) => (cardRefs.current[index] = el)}
                className="relative aspect-[2/3] overflow-hidden rounded-md shadow-lg"
              >
                <img
                  src={card.imageSrc}
                  alt={`${faceLabels[card.rank]} ${suitLabels[card.suit]}`}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                />
                <canvas
                  ref={(el) => (overlayRefs.current[index] = el)}
                  className={`absolute inset-0 touch-none cursor-pointer transition-opacity duration-500 ${
                    scratchProgress.current[index] >= 70 ? 'pointer-events-none opacity-0' : ''
                  }`}
                  onPointerDown={handlePointerDown(index)}
                  onPointerMove={handlePointerMove(index)}
                  onPointerUp={stopScratching}
                  onPointerLeave={stopScratching}
                  onPointerCancel={stopScratching}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center pt-4">
            <Button variant="outline" onClick={handleReset}>
              {t('raspaCarta.reset')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaspaCarta;
