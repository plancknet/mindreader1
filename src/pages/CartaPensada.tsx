import { useCallback, useEffect, useMemo, useState } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { GAME_IDS } from '@/constants/games';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';

type PlayingCard = {
  rank: string;
  suit: SuitName;
  label: string;
  imageSrc: string | null;
};

const suits: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const TOTAL_ROUNDS = 3;

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

const CartaPensada = () => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const { isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.CARTA_PENSADA);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/game-selector');
    }
  }, [isAdmin, isLoading, navigate]);

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

  if (!isAdmin && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/15 px-4 py-6">
      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pt-16 pb-10">
        <div className="rounded-3xl border border-primary/15 bg-background/80 p-6 text-center shadow-2xl shadow-primary/10 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Carta Pensada · Apenas para administradores
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-foreground">Pense em uma carta</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Escolha mentalmente qualquer carta exibida abaixo e guarde-a em segredo. Em seguida, informe em qual coluna
            ela aparece. Repetiremos isso {TOTAL_ROUNDS} vezes e a carta será encontrada automaticamente.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            {isComplete
              ? 'Processo concluído! Veja o resultado abaixo.'
              : `Rodada ${round} de ${TOTAL_ROUNDS} · Toque na coluna correta.`}
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-primary/10 bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur md:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              <button
                type="button"
                disabled={isProcessing || isComplete}
                onClick={() => processSelection(columnIndex)}
                className={`w-full rounded-2xl border px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] transition ${
                  selectedColumn === columnIndex
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 bg-background/60 text-muted-foreground hover:border-primary/40'
                }`}
              >
                Coluna {columnIndex + 1}
              </button>
              <div
                className={`grid gap-2 rounded-2xl border border-white/10 p-3 shadow-inner ${
                  selectedColumn === columnIndex ? 'ring-2 ring-primary/50' : ''
                }`}
                style={{
                  gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                  gridAutoRows: '1fr',
                }}
              >
                {column.map((card) => (
                  <Card
                    key={`${card.rank}-${card.suit}`}
                    className="mx-auto aspect-[7/10] w-full max-w-[70px] overflow-hidden rounded-lg border border-white/5 shadow-sm shadow-black/20 sm:max-w-[80px]"
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

        <div className="rounded-3xl border border-primary/10 bg-card/60 p-6 text-center text-sm text-muted-foreground">
          <p>
            Passos resumidos: escolha mentalmente uma carta → informe a coluna → agrupamos as pilhas (coluna escolhida
            sempre no meio) → giramos a pilha completa → redistribuímos nas três colunas.
          </p>
          <p className="mt-3">
            Após {TOTAL_ROUNDS} repetições, a carta pensada estará na 11ª posição do baralho virtual (linha 4, coluna 2).
          </p>
        </div>

        {isComplete && finalCard && (
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center shadow-lg shadow-emerald-500/20">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">Carta encontrada</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">{finalCard.label}</h2>
            <p className="mt-2 text-muted-foreground">
              Ela ocupou naturalmente a 11ª posição após as três reorganizações.
            </p>
            <div className="mx-auto mt-4 flex max-w-xs justify-center">
              <Card className="aspect-[7/10] w-40 overflow-hidden rounded-2xl border border-emerald-500/40 shadow-2xl">
                <img
                  src={finalCard.imageSrc || '/placeholder.svg'}
                  alt={finalCard.label}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </Card>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={initializeGame} disabled={isProcessing}>
            Reiniciar apresentação
          </Button>
        </div>
      </div>
    </div>
  );
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

export default CartaPensada;
