import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeaderControls } from '@/components/HeaderControls';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';

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
  const navigate = useNavigate();
  const [board, setBoard] = useState<CellValue[]>(createInitialBoard);
  const [winner, setWinner] = useState<CellValue>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const { trackUsage, resetUsageTracking } = useGameUsageTracker(GAME_IDS.JOGO_VELHA_BRUXA);

  const handleCellClick = (index: number) => {
    if (board[index] || isFinished) {
      setStatusMessage('Essa posição já foi usada. Escolha outra.');
      return;
    }

    const tentativeBoard = [...board];
    tentativeBoard[index] = 'user';

    if (isLosingMove(tentativeBoard)) {
      setStatusMessage('Esse movimento faria você perder. Escolha outro.');
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
    if (winner === 'user') return 'Você venceu!';
    if (winner === 'ai') return 'A Velha Bruxa venceu!';
    return 'Empate místico!';
  }, [isFinished, winner]);

  const renderCellContent = (value: CellValue) => {
    if (value === 'ai') return 'X';
    if (value === 'user') return 'O';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
          <HeaderControls showExtras />
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => navigate('/jogo-da-velha-bruxa/instrucoes')}
          >
            Ver instruções
          </Button>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-300 uppercase tracking-[0.3em]">Jogo da Velha</p>
          <h1 className="text-3xl font-bold text-white">Jogo da Velha Bruxa</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="aspect-square rounded-2xl border border-white/20 bg-slate-800 text-white text-4xl font-bold flex items-center justify-center transition hover:bg-slate-700 active:scale-95"
            >
              {renderCellContent(value)}
            </button>
          ))}
        </div>

        <div className="space-y-2 text-center text-slate-200">
          {statusMessage && <p className="text-amber-300 text-sm">{statusMessage}</p>}
          {resultMessage && <p className="text-lg font-semibold">{resultMessage}</p>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={handleReset}>
            Reiniciar
          </Button>
        </div>

        {isFinished && (
          <p className="text-center text-lg font-semibold text-white">
            Veja a previsão da Velha Bruxa
          </p>
        )}
      </div>
    </div>
  );
};

export default JogoVelhaBruxa;
