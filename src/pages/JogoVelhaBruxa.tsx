import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameLayout } from '@/components/GameLayout';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';
import { useTranslation } from '@/hooks/useTranslation';

type CellValue = 'user' | 'ai' | null;

const CLOCKWISE_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const ANTICLOCKWISE_ORDER = [0, 3, 6, 7, 8, 5, 2, 1];

const createInitialBoard = (): CellValue[] => {
  const board: CellValue[] = Array(9).fill(null);
  board[4] = 'ai';
  return board;
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const getColumnFromIndex = (index: number) => (index % 3) + 1;

const isBoardFull = (board: CellValue[]) => board.every((cell) => cell !== null);

const getWinner = (board: CellValue[]): CellValue => {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const isLosingMove = (board: CellValue[]): boolean => {
  return winningLines.some((line) => {
    let aiCount = 0;
    let emptyCount = 0;
    line.forEach((index) => {
      if (board[index] === 'ai') aiCount += 1;
      if (board[index] === null) emptyCount += 1;
    });
    return aiCount === 2 && emptyCount === 1;
  });
};

const createsUserAdvantage = (board: CellValue[]): boolean => {
  return winningLines.some((line) => {
    let userCount = 0;
    let emptyCount = 0;
    line.forEach((index) => {
      if (board[index] === 'user') userCount += 1;
      if (board[index] === null) emptyCount += 1;
    });
    return userCount === 2 && emptyCount === 1;
  });
};

const findNextAvailable = (order: number[], fromIndex: number, board: CellValue[]): number | null => {
  const start = order.indexOf(fromIndex);
  if (start === -1) {
    return null;
  }
  for (let offset = 1; offset <= order.length; offset += 1) {
    const idx = order[(start + offset) % order.length];
    if (board[idx] === null) {
      return idx;
    }
  }
  return null;
};

const findSafeMove = (order: number[], fromIndex: number, board: CellValue[]): number | null => {
  const start = order.indexOf(fromIndex);
  if (start === -1) return null;

  for (let offset = 1; offset <= order.length; offset += 1) {
    const idx = order[(start + offset) % order.length];
    if (board[idx] !== null) continue;
    const simulated = [...board];
    simulated[idx] = 'ai';
    if (!createsUserAdvantage(simulated)) {
      return idx;
    }
  }

  return findNextAvailable(order, fromIndex, board);
};

const JogoVelhaBruxa = () => {
  const { t } = useTranslation();
  const [board, setBoard] = useState<CellValue[]>(createInitialBoard);
  const [winner, setWinner] = useState<CellValue>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.JOGO_VELHA_BRUXA);

  const handleCellClick = (index: number) => {
    if (board[index] || isFinished) {
      setStatusMessage(t('jogoVelhaBruxa.positionUsed'));
      return;
    }

    const tentativeBoard = [...board];
    tentativeBoard[index] = 'user';

    if (isLosingMove(tentativeBoard)) {
      setStatusMessage(t('jogoVelhaBruxa.losingMove'));
      return;
    }

    setStatusMessage(null);
    trackUsage();
    let updatedBoard = tentativeBoard;
    let currentWinner = getWinner(updatedBoard);
    if (currentWinner || isBoardFull(updatedBoard)) {
      setBoard(updatedBoard);
      setWinner(currentWinner);
      setIsFinished(true);
      return;
    }

    const column = getColumnFromIndex(index);
    const nextIndex =
      column === 2
        ? findSafeMove(ANTICLOCKWISE_ORDER, index, updatedBoard)
        : findSafeMove(CLOCKWISE_ORDER, index, updatedBoard);

    if (nextIndex !== null) {
      updatedBoard[nextIndex] = 'ai';
    }

    currentWinner = getWinner(updatedBoard);
    if (currentWinner || isBoardFull(updatedBoard)) {
      setWinner(currentWinner);
      setIsFinished(true);
    }
    setBoard(updatedBoard);
  };

  const handleReset = () => {
    setBoard(createInitialBoard());
    setWinner(null);
    setStatusMessage(null);
    setIsFinished(false);
    resetUsageTracking();
  };

  const resultMessage = useMemo(() => {
    if (!isFinished) return null;
    if (winner === 'user') return t('jogoVelhaBruxa.youWin');
    if (winner === 'ai') return t('jogoVelhaBruxa.witchWins');
    return t('jogoVelhaBruxa.draw');
  }, [isFinished, winner, t]);

  const renderCellContent = (value: CellValue) => {
    if (value === 'ai') return 'X';
    if (value === 'user') return 'O';
    return '';
  };

  return (
    <GameLayout>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-white/70 uppercase tracking-[0.3em]">{t('jogoVelhaBruxa.subtitle')}</p>
          <h1 className="text-3xl font-bold text-white">{t('jogoVelhaBruxa.title')}</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="aspect-square rounded-2xl border border-white/20 bg-[#1e1b4b]/50 text-white text-4xl font-bold flex items-center justify-center transition hover:bg-[#1e1b4b]/70 active:scale-95"
            >
              {renderCellContent(value)}
            </button>
          ))}
        </div>

        <div className="space-y-2 text-center">
          {statusMessage && <p className="text-amber-300 text-sm">{statusMessage}</p>}
          {resultMessage && <p className="text-lg font-semibold text-white">{resultMessage}</p>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            className="flex-1 bg-[#7f13ec] hover:bg-[#7f13ec]/80" 
            onClick={handleReset}
          >
            {t('jogoVelhaBruxa.resetButton')}
          </Button>
        </div>

        {isFinished && (
          <p className="text-center text-lg font-semibold text-white">
            {t('jogoVelhaBruxa.prediction')}
          </p>
        )}
      </div>
    </GameLayout>
  );
};

export default JogoVelhaBruxa;
