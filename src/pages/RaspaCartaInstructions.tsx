import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionParagraph,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

type RankId = 'J' | 'Q' | 'K';

const suits: Array<{ id: SuitName; label: string }> = [
  { id: 'spades', label: 'Espadas' },
  { id: 'hearts', label: 'Copas' },
  { id: 'diamonds', label: 'Ouros' },
  { id: 'clubs', label: 'Paus' },
];

const rankColumns: RankId[] = ['J', 'Q', 'K'];

const paragraphsBeforeGrid = [
  'Assim como na magica "Carta Mental" no "Raspa Carta" a selecao da carta escolhida pelo seu amigo sera por meio de um teclado invisivel que esta no verso da carta. Desta vez com apenas um clique a carta sera selecionada.',
  'O grid de botoes (3 colunas x 4 linhas) esta disposto como a seguir:',
];

const paragraphsAfterGrid = [
  'Selecione discretamente a carta escolhida pelo seu amigo e peca a ele para "raspar" a tela do celular para que a carta seja revelada.',
  'Bora treinar... voce consegue!',
];

const RaspaCartaInstructions = () => {
  const cardButtons = suits.flatMap((suit) =>
    rankColumns.map((rank) => ({
      rank,
      suit: suit.id,
      label: `${rank} de ${suit.label}`,
      imageSrc: getCardImageSrc(rank, suit.id),
    })),
  );

  return (
    <InstructionsLayout
      icon={Sparkles}
      label="Raspa Carta"
      title="Visualize o teclado invisivel"
      subtitle="Veja exatamente como os botoes se distribuem no verso da carta."
      backPath="/raspa-carta"
    >
      <InstructionsCard>
        <div className="space-y-5">
          {paragraphsBeforeGrid.map((paragraph) => (
            <InstructionParagraph key={paragraph}>{paragraph}</InstructionParagraph>
          ))}

          <InstructionsSection title="Verso da carta com os botoes revelados">
            <div className="flex justify-center">
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(127,19,236,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-[#1e1b4b]/80 via-[#1e1b4b] to-[#0f111a]" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {cardButtons.map((card) => (
                    <button
                      key={`${card.rank}-${card.suit}`}
                      type="button"
                      className="flex items-center justify-center rounded-2xl border border-[#7f13ec]/20 bg-white/10 text-center text-sm font-semibold text-white shadow-lg shadow-[#7f13ec]/10"
                      disabled
                    >
                      {card.imageSrc ? (
                        <img
                          src={card.imageSrc}
                          alt={card.label}
                          className="h-full w-full rounded-2xl object-cover"
                          draggable={false}
                        />
                      ) : (
                        <span>{card.label}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </InstructionsSection>

          {paragraphsAfterGrid.map((paragraph) => (
            <InstructionParagraph key={paragraph}>{paragraph}</InstructionParagraph>
          ))}
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default RaspaCartaInstructions;
