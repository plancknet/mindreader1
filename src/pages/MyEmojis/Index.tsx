import { type ReactNode, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';

const EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
  '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
  '🐞', '🐢', '🐍', '🦎', '🦂', '🦀', '🐡', '🐠', '🐟', '🐙',
  '🦑', '🦐', '🦞', '🦪', '🌸', '🌼', '🌻', '🌺', '🌹', '🥀',
  '🍄', '🌰', '🍁', '🍂', '🍃', '🌿', '☘️', '🍀', '🌵', '🌴',
  '🌲', '🌳', '🌾', '💐', '🍇', '🍉', '🍌', '🍍', '🍑', '🍒',
  '🍓', '🍋', '🍊', '🍈', '🥝', '🥥', '🥑', '🥦', '🥬', '🥕',
  '🌽', '🥔', '🍠', '🍞', '🥐', '🥨', '🧀', '🍗', '🥩', '🍖',
  '🍤', '🍣', '🍱', '🍜', '🍝', '🍲', '🍛', '🍚', '🍙', '🍘'
] as const;

type Phase =
  | 'selectInitial'
  | 'prediction'
  | 'shuffle'
  | 'selectTwo'
  | 'firstTransfer'
  | 'selectOne'
  | 'reveal';

const generateMatrix0 = () => {
  const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, 9);
  return [shuffled.slice(0, 3), shuffled.slice(3, 6), shuffled.slice(6, 9)];
};

const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5);

const MatrixBlock = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const MyEmojis = () => {
  const navigate = useNavigate();
  const { incrementUsage } = useUsageLimit();
  const [phase, setPhase] = useState<Phase>('selectInitial');
  const [matrix0, setMatrix0] = useState<string[][]>(generateMatrix0);
  const [selectedInitial, setSelectedInitial] = useState<string[]>([]);
  const [matrixOriginal, setMatrixOriginal] = useState<string[]>([]);
  const [matrixOriginalWorking, setMatrixOriginalWorking] = useState<string[]>([]);
  const [matrixEmbaralhada, setMatrixEmbaralhada] = useState<(string | null)[]>([]);
  const [matrixFinal, setMatrixFinal] = useState<(string | null)[]>([null, null, null]);
  const [selectedTwo, setSelectedTwo] = useState<string[]>([]);
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);

  useEffect(() => {
    if (phase === 'reveal') {
      incrementUsage(GAME_IDS.MY_EMOJIS).catch(console.error);
    }
  }, [phase]);

  const resetGame = () => {
    setMatrix0(generateMatrix0());
    setSelectedInitial([]);
    setMatrixOriginal([]);
    setMatrixOriginalWorking([]);
    setMatrixEmbaralhada([]);
    setMatrixFinal([null, null, null]);
    setSelectedTwo([]);
    setSelectedSingle(null);
    setPhase('selectInitial');
  };

  const handleInitialSelect = (emoji: string) => {
    if (phase !== 'selectInitial') return;
    setSelectedInitial((prev) => {
      if (prev.includes(emoji)) {
        return prev.filter((item) => item !== emoji);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, emoji];
    });
  };

  const confirmInitialSelection = () => {
    if (selectedInitial.length !== 3) return;
    setMatrixOriginal(selectedInitial);
    setMatrixOriginalWorking(selectedInitial);
    setMatrixFinal([null, null, null]);
    setPhase('prediction');
  };

  const shuffleOriginal = () => {
    if (matrixOriginalWorking.length !== 3) return;
    setMatrixOriginalWorking((prev) => shuffleArray(prev));
  };

  const confirmShuffle = () => {
    if (matrixOriginalWorking.length !== 3) return;
    setMatrixEmbaralhada(matrixOriginalWorking);
    setSelectedTwo([]);
    setSelectedSingle(null);
    setMatrixFinal([null, null, null]);
    setPhase('selectTwo');
  };

  const toggleSelectTwo = (emoji: string) => {
    if (phase !== 'selectTwo') return;
    setSelectedTwo((prev) => {
      if (prev.includes(emoji)) {
        return prev.filter((item) => item !== emoji);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, emoji];
    });
  };

  const confirmSelectTwo = () => {
    if (selectedTwo.length !== 2 || matrixEmbaralhada.length !== 3 || matrixOriginal.length !== 3) {
      return;
    }
    const unselected = matrixEmbaralhada.find((emoji) => emoji && !selectedTwo.includes(emoji));
    if (!unselected) return;
    const includesMiddle = selectedTwo.includes(matrixOriginal[1]);
    const nextFinal: (string | null)[] = [null, null, null];
    const placementIndex = includesMiddle ? 2 : 1;
    nextFinal[placementIndex] = unselected;
    setMatrixFinal(nextFinal);
    setMatrixEmbaralhada((prev) => prev.map((emoji) => (emoji === unselected ? null : emoji)));
    setPhase('firstTransfer');
  };

  const proceedToSelectOne = () => {
    setSelectedSingle(null);
    setPhase('selectOne');
  };

  const handleSelectSingle = (emoji: string) => {
    if (phase !== 'selectOne') return;
    if (!selectedTwo.includes(emoji)) return;
    setSelectedSingle((prev) => (prev === emoji ? null : emoji));
  };

  const confirmSingleSelection = () => {
    if (!selectedSingle || matrixOriginal.length !== 3) return;
    const remaining = selectedTwo.find((emoji) => emoji !== selectedSingle);
    if (!remaining) return;
    const nextFinal = [...matrixFinal];
    if (selectedSingle === matrixOriginal[1]) {
      nextFinal[1] = selectedSingle;
    } else {
      nextFinal[0] = selectedSingle;
    }
    const emptyIndex = nextFinal.findIndex((cell) => cell === null);
    if (emptyIndex !== -1) {
      nextFinal[emptyIndex] = remaining;
    }
    setMatrixFinal(nextFinal);
    setMatrixEmbaralhada((prev) =>
      prev.map((emoji) => (emoji === selectedSingle || emoji === remaining ? null : emoji)),
    );
    setPhase('reveal');
  };

  const instructionContent = useMemo(() => {
    switch (phase) {
      case 'selectInitial':
        return {
          title: '1. Escolha três emojis',
          steps: [
            'Peça para o participante selecionar exatamente 3 emojis na matriz 3x3.',
            'Os botões ficam destacados quando o emoji é escolhido.',
            'Avance somente quando os três tiverem sido confirmados.',
          ],
        };
      case 'prediction':
        return {
          title: '3-5. Apresente a previsão',
          steps: [
            'Mostre a matriz original com os três emojis escolhidos.',
            'Diga que apenas uma pessoa poderá ver e registrar a previsão (ou tirar uma foto).',
            matrixOriginal.length === 3
              ? `Previsão: O ${matrixOriginal[0]} ficará comigo, o ${matrixOriginal[1]} ficará no meio e o ${matrixOriginal[2]} ficará com ele.`
              : 'Aguardando a seleção de três emojis para gerar a previsão.',
          ],
        };
      case 'shuffle':
        return {
          title: '6. Embaralhe antes de avançar',
          steps: [
            'Os emojis escolhidos continuam visíveis na matriz original (1x3).',
            'Use o botão "Embaralhar" quantas vezes desejar até ficar satisfeito.',
            'Ao clicar em "Avançar", você gera a matriz embaralhada para a próxima instrução.',
          ],
        };
      case 'selectTwo':
        return {
          title: '7. Selecione dois emojis',
          steps: [
            'Peça para o participante tocar em dois emojis na matriz embaralhada.',
            'Somente dois botões podem permanecer ativos ao mesmo tempo.',
            'Quando estiver pronto, avance para continuar.',
          ],
        };
      case 'firstTransfer': {
        const movedToIndex = matrixFinal[2] ? 'posição 1,3' : 'posição 1,2';
        const emojiMoved = matrixFinal[2] ?? matrixFinal[1];
        return {
          title: '8-9. Movimente o emoji restante',
          steps: [
            'A matriz final surge vazia para receber os emojis.',
            emojiMoved
              ? `O emoji ${emojiMoved} foi enviado para a ${movedToIndex} conforme a regra da etapa 9.`
              : 'O emoji não escolhido será movido para a posição indicada na regra.',
            'Clique em "Avançar" para solicitar a próxima seleção.',
          ],
        };
      }
      case 'selectOne':
        return {
          title: '10. Selecione apenas um emoji',
          steps: [
            'Somente os dois emojis escolhidos anteriormente permanecem ativos.',
            'Peça para o participante tocar em um único emoji.',
            'Ao confirmar, aplicaremos as regras das etapas 11 e 12.',
          ],
        };
      case 'reveal': {
        const correctSpot = matrixFinal[0] && matrixOriginal[0] && matrixFinal[0] === matrixOriginal[0];
        return {
          title: '13. Hora da revelação',
          steps: [
            'Todos os emojis foram posicionados na matriz final.',
            correctSpot
              ? 'O emoji da posição 1,1 continua no mesmo lugar! Leia a revelação em voz alta.'
              : 'O emoji da posição 1,1 mudou de lugar. Peça para o seu amigo ler a instrução em voz alta.',
            'Você pode reiniciar para jogar novamente.',
          ],
        };
      }
      default:
        return {
          title: 'Fluxo do jogo',
          steps: ['Siga as instruções apresentadas em cada etapa.'],
        };
    }
  }, [matrixFinal, matrixOriginal, phase]);

  const actionButtons = () => {
    switch (phase) {
      case 'selectInitial':
        return (
          <Button
            className="w-full"
            disabled={selectedInitial.length !== 3}
            onClick={confirmInitialSelection}
          >
            Confirmar seleção (3 emojis)
          </Button>
        );
      case 'prediction':
        return (
          <Button className="w-full" onClick={() => setPhase('shuffle')}>
            Avançar
          </Button>
        );
      case 'shuffle':
        return (
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={shuffleOriginal}>
              <Shuffle className="mr-2 h-4 w-4" />
              Embaralhar matriz original
            </Button>
            <Button onClick={confirmShuffle}>
              Avançar
            </Button>
          </div>
        );
      case 'selectTwo':
        return (
          <Button className="w-full" disabled={selectedTwo.length !== 2} onClick={confirmSelectTwo}>
            Avançar
          </Button>
        );
      case 'firstTransfer':
        return (
          <Button className="w-full" onClick={proceedToSelectOne}>
            Avançar
          </Button>
        );
      case 'selectOne':
        return (
          <Button className="w-full" disabled={!selectedSingle} onClick={confirmSingleSelection}>
            Avançar
          </Button>
        );
      case 'reveal':
        return (
          <Button className="w-full" onClick={resetGame}>
            Jogar novamente
          </Button>
        );
      default:
        return null;
    }
  };

  const renderShuffledMatrix = () => (
    <div className="grid grid-cols-3 gap-2">
      {matrixEmbaralhada.map((emoji, index) => {
        if (!emoji) {
          return (
            <div key={`empty-${index}`} className="h-16 rounded-md border border-dashed"></div>
          );
        }
        const isSelectTwoPhase = phase === 'selectTwo';
        const isSelectOnePhase = phase === 'selectOne';
        const isEligible = isSelectTwoPhase || (isSelectOnePhase && selectedTwo.includes(emoji));
        const isSelected =
          (isSelectTwoPhase && selectedTwo.includes(emoji)) ||
          (isSelectOnePhase && selectedSingle === emoji);
        return (
          <Button
            key={`${emoji}-${index}`}
            variant={isSelected ? 'default' : 'outline'}
            className="h-16 text-3xl"
            onClick={() => (isSelectTwoPhase ? toggleSelectTwo(emoji) : handleSelectSingle(emoji))}
            disabled={!isEligible}
          >
            {emoji}
          </Button>
        );
      })}
    </div>
  );

  const renderFinalMatrix = () => (
    <div className="grid grid-rows-3 grid-cols-1 gap-2">
      {matrixFinal.map((emoji, index) => {
        const originalEmoji = matrixOriginal[index];
        const isInOriginalPosition = emoji === originalEmoji;
        const shouldAnimate = emoji && matrixEmbaralhada.includes(emoji);
        
        return (
          <Button
            key={`final-${index}`}
            variant={emoji ? 'secondary' : 'outline'}
            disabled
            className={cn(
              'h-16 text-3xl',
              emoji ? 'bg-secondary text-foreground' : 'text-muted-foreground',
              shouldAnimate && 'transition-all duration-[2000ms] ease-in-out animate-fade-in',
            )}
          >
            {emoji ?? ' '}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/game-selector')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao menu
          </Button>
          <Button variant="outline" onClick={resetGame}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reiniciar jogo
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1.5fr_0.9fr]">
          <Card className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Instruções</p>
              <h1 className="text-2xl font-bold text-foreground">{instructionContent.title}</h1>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              {instructionContent.steps.map((step, index) => (
                <p key={index} className="leading-relaxed">
                  {step}
                </p>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            {phase === 'selectInitial' && (
              <MatrixBlock
                title="Matriz 0 (3x3)"
                subtitle="Escolha três emojis aleatórios"
              >
                <div className="space-y-2">
                  {matrix0.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="grid grid-cols-3 gap-2">
                      {row.map((emoji) => {
                        const isSelected = selectedInitial.includes(emoji);
                        return (
                          <Button
                            key={emoji}
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-16 text-3xl"
                            onClick={() => handleInitialSelect(emoji)}
                            disabled={phase !== 'selectInitial'}
                          >
                            {emoji}
                          </Button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </MatrixBlock>
            )}

            {matrixOriginal.length === 3 && (phase === 'prediction' || phase === 'shuffle') && (
              <MatrixBlock
                title="Matriz original (1x3)"
                subtitle="Referência para a previsão"
              >
                <div className="grid grid-cols-3 gap-2">
                  {(phase === 'shuffle' ? matrixOriginalWorking : matrixOriginal).map((emoji, index) => (
                    <Button
                      key={`${emoji}-${index}`}
                      variant="outline"
                      disabled
                      className={cn(
                        'h-16 text-3xl',
                        phase === 'shuffle' ? 'bg-muted/60 text-foreground' : 'bg-muted/40 text-foreground',
                      )}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </MatrixBlock>
            )}

            {matrixEmbaralhada.length === 3 && (
              <MatrixBlock
                title="Matriz embaralhada (1x3)"
                subtitle="Selecione conforme as instruções"
              >
                {renderShuffledMatrix()}
              </MatrixBlock>
            )}

            {(phase === 'firstTransfer' || phase === 'selectOne' || phase === 'reveal') && (
              <MatrixBlock
                title="Matriz final (3x1)"
                subtitle="Preencha seguindo as regras"
              >
                {renderFinalMatrix()}
              </MatrixBlock>
            )}
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Próxima ação</p>
              <h2 className="text-xl font-semibold text-foreground">
                {phase === 'reveal' ? 'Conclusão' : 'Execute o passo atual'}
              </h2>
            </div>
            {actionButtons()}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {phase !== 'selectInitial' && phase !== 'reveal' && (
                <Button variant="outline" onClick={resetGame}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reiniciar jogo
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate('/game-selector')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o menu
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyEmojis;
