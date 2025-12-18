import { useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';
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

const readingDirection: string = 'RIGHT_TO_LEFT';
const slotValues = [32, 16, 8, 4, 2, 1];
const IS_LEFT_TO_RIGHT = readingDirection === 'LEFT_TO_RIGHT';

const rawSequenceData: Array<{ rank: string; suit: SuitName }> = [
  { rank: 'K', suit: 'diamonds' },
  { rank: '10', suit: 'hearts' },
  { rank: 'Q', suit: 'diamonds' },
  { rank: '9', suit: 'hearts' },
  { rank: '8', suit: 'clubs' },
  { rank: '3', suit: 'spades' },
];

const MixDeCartasInstructions = () => {
  const exampleIndex = getCardIndex(exampleChosenCard.rank, exampleChosenCard.suit);
  const binaryDigits = decimalToBinary6(exampleIndex).split('');
  const displayBits = IS_LEFT_TO_RIGHT ? binaryDigits : [...binaryDigits].reverse();
  const slotValuesDisplay = IS_LEFT_TO_RIGHT ? slotValues : [...slotValues].reverse();
  const anchorIndex = IS_LEFT_TO_RIGHT ? 0 : rawSequenceData.length - 1;
  const directionLabel = IS_LEFT_TO_RIGHT ? 'Esquerda - Direita' : 'Direita - Esquerda';

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
    <InstructionsLayout
      icon={Shuffle}
      label="Mix de Cartas"
      title="Como o app codifica a carta escolhida"
      subtitle="Veja a matematica simples que transforma a carta em uma soma e como usar as cores do mix para desfazer o truque."
      backPath="/mind-reader/mix-de-cartas"
    >
      <style>{`
        @keyframes mixFocus {
          0% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
          10% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(127,19,236,0.35); }
          30% { transform: translateY(-6px) scale(1.02); opacity: 1; box-shadow: 0 20px 35px rgba(127,19,236,0.35); }
          45% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
          100% { transform: translateY(0px) scale(0.98); opacity: 0.6; box-shadow: none; }
        }
      `}</style>
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title="Passo a passo">
            <ol className="list-decimal space-y-3 pl-5 text-white/90">
              <li>
                <strong>Transforme a carta em numero 1-52.</strong> Some 13 para cada bloco de naipe ate chegar ao desejado.
                Espadas valem 1-13, Copas comecam em 14, Ouros em 27 e Paus em 40. Exemplo: {exampleChosenCard.label} fica na posicao{' '}
                <strong>{exampleIndex}</strong> porque (Copas = 13 cartas antes) + posicao do 7 dentro do naipe.
              </li>
              <li>
                <strong>Associe cada uma das 6 posicoes a um valor fixo.</strong> Seguindo o sentido escolhido pelo app,
                as cartas representam os valores {slotValuesDisplay.join(', ')} (comecando em {directionLabel}). Voce so precisa saber
                que sempre havera os valores 32, 16, 8, 4, 2 e 1 colocados em linha.
              </li>
              <li>
                <strong>Descubra o sentido olhando a ancora.</strong> A menor carta em valor (normalmente um numero baixo de Espadas)
                aparece na extremidade de onde voce deve comecar a ler. Se ela estiver a direita, leia da direita para a esquerda
                e atribua os valores nessa ordem; se estiver a esquerda, faca o contrario.
              </li>
              <li>
                <strong>Soma das cores = numero da carta.</strong> Percorra as seis cartas adicionando o valor da posicao
                toda vez que ela for <span className="font-semibold text-red-400">vermelha</span>. Se a carta for preta,
                some zero. A soma final e exatamente o numero 1-52 da carta escolhida - basta localizar na tabela do passo 1.
              </li>
            </ol>
          </InstructionsSection>

          <InstructionsSection title="Exemplo animado">
            <p className="text-white/80 mb-4">
              No exemplo abaixo, a menor carta e o <strong>3 de Espadas</strong>, localizado a direita, entao aplicamos os valores
              na ordem <strong>{directionLabel}</strong>. Somamos os valores exibidos nos cartoes vermelhos
              e ignoramos os pretos. A soma resultante e <strong>{exampleIndex}</strong>, o que nos leva de volta ao {exampleChosenCard.label}.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {exampleSequence.map((card, index) => (
                <div key={`${card.rank}-${card.suit}`} className="space-y-3 text-center">
                  <div
                    className="rounded-2xl border border-[#7f13ec]/30 bg-white/5 p-3 shadow-lg shadow-[#7f13ec]/10"
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
                      <div className="absolute top-2 left-2 rounded-full bg-[#0f111a]/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#7f13ec]">
                        {card.bit === '1' ? `+${slotValuesDisplay[index]}` : '+0'}
                      </div>
                      {card.isAnchor && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-[#7f13ec]/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white">
                          Ancora
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-white/60">{card.label}</p>
                </div>
              ))}
            </div>
          </InstructionsSection>

          <div className="rounded-2xl border border-[#7f13ec]/15 bg-[#0f111a]/60 p-4">
            <InstructionNote>
              Dica rapida: memorize algumas conversoes para acelerar o processo. Saber de cabeca que Copas comeca no 14
              e que cada naipe ocupa um bloco de 13 numeros torna a conta muito mais rapida. Depois e so praticar a leitura
              das cores ate que vire reflexo.
            </InstructionNote>
          </div>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default MixDeCartasInstructions;
