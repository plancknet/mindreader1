import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { PointerEvent } from 'react';
import { GameLayout } from '@/components/GameLayout';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

type RankId = 'J' | 'Q' | 'K';

const suits: Array<{ id: SuitName; symbol: string; tone: 'red' | 'black' }> = [
  { id: 'spades', symbol: '\u2660', tone: 'black' },
  { id: 'hearts', symbol: '\u2665', tone: 'red' },
  { id: 'diamonds', symbol: '\u2666', tone: 'red' },
  { id: 'clubs', symbol: '\u2663', tone: 'black' },
];

const rankColumns: RankId[] = ['J', 'Q', 'K'];

type SelectedCard = {
  rank: RankId;
  suit: SuitName;
  imageSrc: string;
};

const RaspaCarta = () => {
  const { t } = useTranslation();
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.RASPA_CARTA);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const cardAreaRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayFilledRef = useRef(false);

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

  const fillOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const container = imageContainerRef.current;
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

    context.fillStyle = 'rgba(0, 0, 0, 1)';
    context.fillRect(0, 0, width, height);

    context.font = `600 ${Math.max(12, width * 0.05)}px 'Inter', sans-serif`;
    context.fillStyle = 'rgba(125, 211, 252, 0.8)';
    context.textAlign = 'center';
    const labelY = height - height * 0.07;
    rankColumns.forEach((rank, index) => {
      const xOffset = (index + 0.5) * (width / rankColumns.length);
      context.fillText(faceLabels[rank], xOffset, labelY);
    });

    context.globalCompositeOperation = 'destination-out';
  }, [faceLabels]);

  useEffect(() => {
    if (selectedCard && !overlayFilledRef.current) {
      fillOverlay();
      overlayFilledRef.current = true;
    } else if (!selectedCard) {
      overlayFilledRef.current = false;
      const canvas = overlayRef.current;
      const context = canvas?.getContext('2d');
      if (canvas && context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [selectedCard, fillOverlay]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = overlayRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scale = window.devicePixelRatio || 1;

    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.globalCompositeOperation = 'destination-out';
    
    context.beginPath();
    context.arc(x, y, 50, 0, Math.PI * 2);
    context.fillStyle = 'rgba(0, 0, 0, 1)';
    context.fill();
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!selectedCard) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsScratching(true);
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || !selectedCard) return;
    event.preventDefault();
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsScratching(false);
  };

  const stopScratching = () => {
    setIsScratching(false);
  };

  const handleSelectCard = (suit: SuitName, rank: RankId) => {
    if (selectedCard) return;
    const imageSrc = getCardImageSrc(rank, suit);
    if (!imageSrc) {
      return;
    }
    setSelectedCard({ rank, suit, imageSrc });
    trackUsage();
  };

  const handleReset = () => {
    setSelectedCard(null);
    overlayFilledRef.current = false;
    resetUsageTracking();
  };

  return (
    <GameLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8">
        <div className="rounded-3xl border border-[#7f13ec]/30 bg-[#1e1b4b]/50 p-6 text-center shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]">
            {t('raspaCarta.title')}
          </p>
          <p className="mt-3 text-base text-white/70">{t('raspaCarta.subtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#1e1b4b]/30 p-8 shadow-2xl">
          <p className="text-center text-sm text-white/70">{t('raspaCarta.gridInstruction')}</p>
          <div
            ref={cardAreaRef}
            className="relative mx-auto mt-6 aspect-[2/3] w-full max-w-md overflow-hidden rounded-[32px] border-[6px] border-[#7f13ec]/20 bg-black/70 shadow-2xl"
          >
            <div ref={imageContainerRef} className="absolute inset-4 overflow-hidden rounded-[24px] bg-black/70">
              {selectedCard ? (
                <img
                  src={selectedCard.imageSrc}
                  alt={`${faceLabels[selectedCard.rank]} ${suitLabels[selectedCard.suit]}`}
                  className="h-full w-full select-none object-contain"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-black/70">
                </div>
              )}
              <canvas
                ref={overlayRef}
                className={`absolute inset-0 touch-none ${selectedCard ? 'cursor-pointer' : 'pointer-events-none'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={stopScratching}
                onPointerCancel={stopScratching}
              />
            </div>

            <div
              className={`absolute inset-4 grid grid-cols-3 grid-rows-4 gap-3 transition-opacity duration-200 ${
                selectedCard ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {suits.map((suit) =>
                rankColumns.map((rank) => (
                  <button
                    key={`${rank}-${suit.id}`}
                    className="rounded-xl bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f13ec]/70"
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

            <div className="pointer-events-none absolute inset-x-8 bottom-5 grid grid-cols-3 gap-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]/80">
              {rankColumns.map((rank) => (
                <span key={rank}>{faceLabels[rank]}</span>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              {t('raspaCarta.reset')}
            </Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default RaspaCarta;
