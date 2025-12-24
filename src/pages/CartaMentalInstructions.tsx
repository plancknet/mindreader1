import { Brain } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';

const gridRows = [
  ['A', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['10', 'J', 'Q'],
];

const suits = [
  { id: 'spades', label: 'Espadas', tone: 'text-slate-100' },
  { id: 'hearts', label: 'Copas', tone: 'text-rose-300' },
  { id: 'diamonds', label: 'Ouros', tone: 'text-amber-200' },
  { id: 'clubs', label: 'Paus', tone: 'text-emerald-200' },
];

const steps = [
  'Nesta mágica, existe um teclado invisível de 3 colunas por 4 linhas, exatamente como o modelo abaixo.',
  'Logo abaixo está o botão "Revelar a Carta", dividido em quatro partes correspondentes aos naipes.',
  'Como o teclado não pode ser visto pelo seu amigo, você deverá imaginar a divisão do grid de botões no verso da carta (3 colunas x 4 linhas) e clicar discretamente para que ele não perceba que você selecionou a carta escolhida por ele.',
  'Com o clique em um dos lados do botão "Revelar a Carta" você estará escolhendo um dos naipes e a carta escolhida por ele será revelada num passe de mágica.',
  'Ah... mas e o Rei (K) ??? Se a carta escolhida for um K, não clique no verso da carta; apenas toque na área do naipe no botão "Revelar a Carta" e o Rei será revelado.',
  'Agora é só treinar e aplicar com seus amigos.',
];

const CartaMentalInstructions = () => {
  return (
    <InstructionsLayout
      icon={Brain}
      label="Carta Mental"
      title="Domine o teclado invisível"
      subtitle="Visualize o verso da carta e o botão revelador."
      backPath="/carta-mental"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title="Passo a passo">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={step} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title="Verso da carta - teclado exposto">
            <div className="flex justify-center">
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(127,19,236,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-[#1e1b4b]/70 via-[#1e1b4b] to-[#0f111a]" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {gridRows.map((row) =>
                    row.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-[#7f13ec]/30 bg-white/10 text-center text-sm font-semibold text-white shadow-lg shadow-[#7f13ec]/10"
                        disabled
                      >
                        {label}
                      </button>
                    )),
                  )}
                </div>
              </div>
            </div>
          </InstructionsSection>

          <InstructionsSection title='Botão "Revelar a Carta" - áreas dos naipes'>
            <div className="w-full max-w-md mx-auto rounded-full border border-white/20 bg-gradient-to-r from-[#1e1b4b] via-[#0f111a] to-[#1e1b4b] p-1 shadow-[0_20px_40px_rgba(15,23,42,0.5)]">
              <div className="grid grid-cols-4 gap-1">
                {suits.map((suit) => (
                  <div
                    key={suit.id}
                    className="rounded-full border border-[#7f13ec]/30 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    <span className={suit.tone}>{suit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default CartaMentalInstructions;
