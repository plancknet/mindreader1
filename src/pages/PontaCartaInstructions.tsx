import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

const steps = [
  'Nesta mágica, perceba que todas as cartas têm os naipes centrais apontando para cima. Por exemplo, veja no As de Espadas como o naipe parece uma seta apontando para cima. O mesmo ocorre para todas as outras cartas desta mágica.',
  'Assim que o usuário escolher uma das cartas e clicar em "Embaralhar", a carta escolhida será a única com o naipe apontando para baixo e você facilmente conseguirá identificar a carta escolhida pelo seu amigo.',
  'A única exceção é a carta 7 de Ouros. Caso o 7 de Ouros seja selecionado, o naipe central, ao invés de estar na parte superior da carta, estará na parte inferior da carta.',
  'Pronto! Agora que o truque foi revelado, ensaie bastante antes de fazer com seus amigos.',
];

const highlightedCards: Array<{ rank: string; suit: SuitName; label: string }> = [
  { rank: 'A', suit: 'spades', label: 'As de Espadas' },
  { rank: 'A', suit: 'hearts', label: 'As de Copas' },
  { rank: '7', suit: 'clubs', label: '7 de Paus' },
  { rank: '7', suit: 'diamonds', label: '7 de Ouros' },
];

const PontaCartaInstructions = () => {
  const cardPreviews = highlightedCards.map((card) => ({
    ...card,
    imageSrc: getCardImageSrc(card.rank, card.suit),
  }));

  return (
    <InstructionsLayout
      icon={Sparkles}
      label="Ponta da Carta"
      title="Revelando o Segredo"
      subtitle="Entenda o mecanismo antes de apresentar."
      backPath="/ponta-da-carta"
    >
      <style>{`
        @keyframes cardFlip180 {
          0% { transform: rotateZ(0deg); }
          40% { transform: rotateZ(180deg); }
          50% { transform: rotateZ(180deg); }
          90% { transform: rotateZ(360deg); }
          100% { transform: rotateZ(360deg); }
        }
      `}</style>
      <InstructionsCard>
        <div className="space-y-5">
          <InstructionsSection title="Passo a passo">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={step} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title="Observe a rotação dos naipes importantes">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cardPreviews.map((card) => (
                <div key={`${card.rank}-${card.suit}`} className="text-center space-y-2">
                  <div
                    className="relative mx-auto aspect-[7/10] w-full max-w-[120px] overflow-hidden rounded-2xl border border-[#7f13ec]/30 bg-black/40 shadow-lg shadow-[#7f13ec]/20"
                    style={{
                      animation: 'cardFlip180 6s linear infinite',
                      transformOrigin: 'center',
                    }}
                  >
                    {card.imageSrc ? (
                      <img
                        src={card.imageSrc}
                        alt={card.label}
                        className="h-full w-full select-none object-cover"
                        draggable={false}
                        style={{ backfaceVisibility: 'hidden' }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
                        {card.label}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white/60">{card.label}</p>
                </div>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default PontaCartaInstructions;
