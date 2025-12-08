import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

const suitLabels: Record<SuitName, string> = {
  spades: 'Espadas',
  hearts: 'Copas',
  diamonds: 'Ouros',
  clubs: 'Paus',
};

const suitOrder: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getCardIndex = (rank: string, suit: SuitName) => {
  const suitBase = suitOrder.indexOf(suit) * 13;
  const rankOffset = rankOrder.indexOf(rank);
  return suitBase + rankOffset + 1;
};

const decimalToBinary6 = (num: number) => num.toString(2).padStart(6, '0');

const exampleChosenCard = {
  rank: '7',
  suit: 'hearts' as SuitName,
  label: '7 de Copas',
};

const readingDirection: 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' = 'RIGHT_TO_LEFT';
const slotValues = [32, 16, 8, 4, 2, 1];

const rawSequenceData: Array<{ rank: string; suit: SuitName }> = [
  { rank: 'K', suit: 'diamonds' },
  { rank: '10', suit: 'hearts' },
  { rank: 'Q', suit: 'diamonds' },
  { rank: '9', suit: 'hearts' },
  { rank: '8', suit: 'clubs' },
  { rank: '3', suit: 'spades' }, // menor carta (âncora)
];

const MixDeCartasInstructions = () => {
  const navigate = useNavigate();
  const exampleIndex = getCardIndex(exampleChosenCard.rank, exampleChosenCard.suit);
  const binaryDigits = decimalToBinary6(exampleIndex).split('');
  const displayBits =
    readingDirection === 'LEFT_TO_RIGHT' ? binaryDigits : [...binaryDigits].reverse();
  const slotValuesDisplay = readingDirection === 'LEFT_TO_RIGHT' ? slotValues : [...slotValues].reverse();
  const anchorIndex = readingDirection === 'LEFT_TO_RIGHT' ? 0 : rawSequenceData.length - 1;
  const directionLabel = readingDirection === 'LEFT_TO_RIGHT' ? 'Esquerda → Direita' : 'Direita → Esquerda';

  const exampleSequence = useMemo(
    () =>
      rawSequenceData.map((card, index) => ({
        ...card,
        bit: displayBits[index],
        isAnchor: index === anchorIndex,
        imageSrc: getCardImageSrc(card.rank, card.suit),
        label: `${card.rank} de ${suitLabels[card.suit]}`,
      })),
    [anchorIndex, displayBits],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <style>{`
        @keyframes mixFocus {
          0% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
          10% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(59,130,246,0.35); }
          30% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(59,130,246,0.35); }
          45% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
          100% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Shuffle className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Mix de Cartas</p>
          <h1 className="text-4xl font-bold text-foreground">Como o app codifica a carta escolhida</h1>
          <p className="text-muted-foreground">
            Veja a matemática simples que transforma a carta em uma soma e como usar as cores do mix para desfazer o truque.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Passo a passo</h2>
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong>Transforme a carta em número 1-52.</strong> Some 13 para cada bloco de naipe até chegar ao desejado.
                  Espadas valem 1-13, Copas começam em 14, Ouros em 27 e Paus em 40. Exemplo: {exampleChosenCard.label} fica na posição{' '}
                  <strong>{exampleIndex}</strong> porque (Copas = 13 cartas antes) + posição do 7 dentro do naipe.
                </li>
                <li>
                  <strong>Associe cada uma das 6 posições a um valor fixo.</strong> Seguindo o sentido escolhido pelo app,
                  as cartas representam os valores {slotValuesDisplay.join(', ')} (começando em {directionLabel}). Você só precisa saber
                  que sempre haverá os valores 32, 16, 8, 4, 2 e 1 colocados em linha.
                </li>
                <li>
                  <strong>Descubra o sentido olhando a âncora.</strong> A menor carta em valor (normalmente um número baixo de Espadas)
                  aparece na extremidade de onde você deve começar a ler. Se ela estiver à direita, leia da direita para a esquerda
                  e atribua os valores nessa ordem; se estiver à esquerda, faça o contrário.
                </li>
                <li>
                  <strong>Soma das cores = número da carta.</strong> Percorra as seis cartas adicionando o valor da posição
                  toda vez que ela for <span className="font-semibold text-destructive">vermelha</span>. Se a carta for preta,
                  some zero. A soma final é exatamente o número 1-52 da carta escolhida — basta localizar na tabela do passo 1.
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Exemplo animado</h3>
              <p>
                No exemplo abaixo, a menor carta é o <strong>3 de Espadas</strong>, localizado à direita, então aplicamos os valores
                na ordem <strong>{directionLabel}</strong>. Somamos os valores exibidos nos cartões vermelhos
                e ignoramos os pretos. A soma resultante é <strong>{exampleIndex}</strong>, o que nos leva de volta ao {exampleChosenCard.label}.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {exampleSequence.map((card, index) => (
                  <div key={`${card.rank}-${card.suit}`} className="space-y-3 text-center">
                    <div
                      className="rounded-2xl border border-primary/30 bg-white/5 p-3 shadow-lg shadow-primary/10"
                      style={{
                        animation: 'mixFocus 7s ease-in-out infinite',
                        animationDelay: `${index * 0.8}s`,
                      }}
                    >
                      <div className="relative aspect-[7/10] w-full overflow-hidden rounded-xl border border-white/10">
                        {card.imageSrc ? (
                          <img
                            src={card.imageSrc}
                            alt={card.label}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-white/70">{card.label}</div>
                        )}
                        <div className="absolute top-2 left-2 rounded-full bg-background/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-primary">
                          {card.bit === '1' ? `+${slotValuesDisplay[index]}` : '+0'}
                        </div>
                        {card.isAnchor && (
                          <div className="absolute bottom-2 right-2 rounded-full bg-primary/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-background">
                            Âncora
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-muted-foreground">
              <p>
                Dica rápida: memorize algumas conversões para acelerar o processo. Saber de cabeça que Copas começa no 14
                e que cada naipe ocupa um bloco de 13 números torna a conta muito mais rápida. Depois é só praticar a leitura
                das cores até que vire reflexo.
              </p>
            </section>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/mind-reader/mix-de-cartas')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MixDeCartasInstructions;
