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
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const scratchProgress = useRef(0);

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

  const initializeScratchSurface = useCallback(() => {
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
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.95)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255, 255, 255, 0.12)';
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = 'destination-out';
  }, []);

  useEffect(() => {
    if (selectedCard) {
      initializeScratchSurface();
    }
  }, [selectedCard, initializeScratchSurface]);

  const handleCardSelection = (index: number) => {
    if (selectedCard) return;
    setSelectedCard(cards[index]);
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = overlayRef.current;
    if (!canvas || scratchProgress.current >= 70) {
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

    scratchProgress.current = Math.min(100, scratchProgress.current + 4);
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!selectedCard) return;
    event.preventDefault();
    setIsScratching(true);
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || !selectedCard) return;
    event.preventDefault();
    scratchAt(event.clientX, event.clientY);
  };

  const stopScratching = () => {
    setIsScratching(false);
  };

  const handleReset = () => {
    setSelectedCard(null);
    setIsScratching(false);
    scratchProgress.current = 0;
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
          <p className="text-center text-sm text-muted-foreground">
            {!selectedCard ? t('raspaCarta.selectHint') : t('raspaCarta.scratchHint')}
          </p>
          
          <div className="mx-auto max-w-md">
            <div
              ref={cardRef}
              className="relative aspect-[2/3] overflow-hidden rounded-md shadow-2xl"
            >
              {selectedCard ? (
                <>
                  <img
                    src={selectedCard.imageSrc}
                    alt={`${faceLabels[selectedCard.rank]} ${suitLabels[selectedCard.suit]}`}
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                  />
                  <canvas
                    ref={overlayRef}
                    className={`absolute inset-0 touch-none cursor-pointer transition-opacity duration-500 ${
                      scratchProgress.current >= 70 ? 'pointer-events-none opacity-0' : ''
                    }`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopScratching}
                    onPointerLeave={stopScratching}
                    onPointerCancel={stopScratching}
                  />
                </>
              ) : (
                <>
                  <div className="h-full w-full bg-gradient-to-br from-primary/90 to-secondary/90" />
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
                    {cards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleCardSelection(index)}
                        className="hover:bg-primary/10 transition-colors"
                        aria-label={`Selecionar carta ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
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
