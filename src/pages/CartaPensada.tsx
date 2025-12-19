import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';
import { Home, Moon, Languages as LanguagesIcon, LogOut } from 'lucide-react';

type PlayingCard = {
  rank: string;
  suit: SuitName;
  label: string;
  imageSrc: string | null;
};

const suits: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const TOTAL_ROUNDS = 3;
const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const buildFullDeck = (): PlayingCard[] => {
  const labels: Record<SuitName, string> = {
    spades: 'Espadas',
    hearts: 'Copas',
    diamonds: 'Ouros',
    clubs: 'Paus',
  };

  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      rank,
      suit,
      label: `${rank} de ${labels[suit]}`,
      imageSrc: getCardImageSrc(rank, suit),
    })),
  );
};

const fullDeck = buildFullDeck();

const getRandomDeck = () => {
  const shuffled = [...fullDeck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 21);
};

const buildColumns = (deck: PlayingCard[]) => {
  const columns: PlayingCard[][] = [[], [], []];
  deck.forEach((card, index) => {
    const columnIndex = index % 3;
    const rowIndex = Math.floor(index / 3);
    columns[columnIndex][rowIndex] = card;
  });
  return columns;
};

const performStacking = (currentDeck: PlayingCard[], selectedColumn: number) => {
  const cols = buildColumns(currentDeck);
  const stacks = cols.map((column) => [...column].reverse());
  const remainingColumns = [0, 1, 2].filter((col) => col !== selectedColumn);

  const newPile = [
    ...stacks[remainingColumns[0]],
    ...stacks[selectedColumn],
    ...stacks[remainingColumns[1]],
  ];

  const flippedPile = [...newPile].reverse();
  const redealtColumns: PlayingCard[][] = [[], [], []];

  flippedPile.forEach((card, index) => {
    const columnIndex = index % 3;
    const rowIndex = Math.floor(index / 3);
    redealtColumns[columnIndex][rowIndex] = card;
  });

  const nextDeck: PlayingCard[] = [];
  for (let row = 0; row < 7; row += 1) {
    for (let columnIndex = 0; columnIndex < 3; columnIndex += 1) {
      nextDeck.push(redealtColumns[columnIndex][row]);
    }
  }
  return nextDeck;
};

const CartaPensada = () => {
  const navigate = useNavigate();
  const { language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.CARTA_PENSADA);

  const initializeGame = useCallback(() => {
    setDeck(getRandomDeck());
    setRound(1);
    setSelectedColumn(null);
    setIsProcessing(false);
    setIsComplete(false);
    resetUsageTracking();
  }, [resetUsageTracking]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const columns = useMemo(() => buildColumns(deck), [deck]);
  const finalCard = isComplete ? deck[10] : null;

  const processSelection = (columnIndex: number) => {
    if (isProcessing || isComplete) return;
    const isLastRound = round === TOTAL_ROUNDS;
    setIsProcessing(true);
    setSelectedColumn(columnIndex);

    setTimeout(() => {
      setDeck((prev) => performStacking(prev, columnIndex));
      trackUsage();

      if (isLastRound) {
        setIsComplete(true);
      } else {
        setRound((prev) => prev + 1);
        setSelectedColumn(null);
      }
      setIsProcessing(false);
    }, 600);
  };

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-light');
  };

  const cycleLanguage = () => {
    const codes = languages.map((lang) => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    setLanguage(nextCode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/');
    }
  };

  if (isComplete && finalCard) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
        style={{ fontFamily: loginFontFamily }}
      >
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 gap-6">
          <Card className="aspect-[7/10] w-56 overflow-hidden rounded-3xl border border-[#7f13ec]/30 bg-transparent shadow-2xl shadow-[#7f13ec]/20">
            <img
              src={finalCard.imageSrc || '/placeholder.svg'}
              alt={finalCard.label}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </Card>
          <Button
            onClick={initializeGame}
            className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-white transition hover:border-[#7f13ec]/40 hover:bg-[#7f13ec]/20"
          >
            Reiniciar
          </Button>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#0f111a]/95 backdrop-blur-xl">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-white/70">
            <button
              type="button"
              onClick={goHome}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#7f13ec]/30 bg-[#7f13ec]/15 px-3 py-2 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)] transition-colors hover:bg-[#7f13ec]/25"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
            >
              <Moon className="h-5 w-5" />
              <span>Mode</span>
            </button>
            <button
              type="button"
              onClick={cycleLanguage}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
            >
              <LanguagesIcon className="h-5 w-5" />
              <span>{currentLanguage.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-red-400/50 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-8">
          <div className="grid grid-cols-3 gap-4 rounded-3xl border border-[#7f13ec]/10 bg-gradient-to-br from-[#1e1b4b]/50 to-[#0f111a]/80 p-6 shadow-xl shadow-[#7f13ec]/5 backdrop-blur">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                <div
                  role="button"
                  tabIndex={isProcessing ? -1 : 0}
                  onClick={() => !isProcessing && processSelection(columnIndex)}
                  onKeyDown={(event) => {
                    if (isProcessing) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      processSelection(columnIndex);
                    }
                  }}
                  className={`grid gap-2 rounded-2xl border border-white/10 p-3 shadow-inner transition ${
                    selectedColumn === columnIndex
                      ? 'cursor-pointer ring-2 ring-[#7f13ec]/50'
                      : isProcessing
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:border-[#7f13ec]/40'
                  }`}
                  style={{
                    gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                    gridAutoRows: '1fr',
                  }}
                >
                  {column.map((card) => (
                    <Card
                      key={`${card.rank}-${card.suit}`}
                      className="mx-auto aspect-[7/10] w-full max-w-[60px] overflow-hidden rounded-lg border border-white/5 bg-transparent shadow-sm shadow-black/20 sm:max-w-[68px]"
                    >
                      <img
                        src={card.imageSrc || '/placeholder.svg'}
                        alt={card.label}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={initializeGame}
              disabled={isProcessing}
              className="rounded-2xl border-white/20 bg-white/5 text-white hover:border-[#7f13ec]/50 hover:bg-[#7f13ec]/20"
            >
              Reiniciar apresentação
            </Button>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#0f111a]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-white/70">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#7f13ec]/30 bg-[#7f13ec]/15 px-3 py-2 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)] transition-colors hover:bg-[#7f13ec]/25"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <Moon className="h-5 w-5" />
            <span>Mode</span>
          </button>
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <LanguagesIcon className="h-5 w-5" />
            <span>{currentLanguage.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-red-400/50 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default CartaPensada;
