import { MessageCircle } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
} from '@/components/InstructionsLayout';

const steps = [
  'No "Papo Reto" a lógica é a mesma do "Conversa Mental".',
  'Na primeira interação passe 1 palavra para indicar que trata-se de um ANIMAL, 2 palavras para indicar que trata-se de uma FRUTA e 3 palavras para indicar que trata-se de um PAÍS.',
  'Em cada uma das próximas interações passe uma letra da palavra escolhida utilizando o teclado invisível.',
  'Se o app tiver mais de uma possibilidade com a categoria e as três letras indicadas, ele mostrará as opções disponíveis.',
  'A escolha final será determinada pela quantidade de palavras da interação. Se você interagir com 3 palavras, por exemplo, você estará indicando que a palavra escolhida foi a 3a opção da lista apresentada. Se interagir com 4 palavras, será a 4a opção da lista apresentada e assim por diante.',
];

const letterRows = [
  ['A', 'B', 'C', 'D'],
  ['E', 'F', 'G', 'H'],
  ['I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T'],
];

const PapoRetoInstructions = () => {
  return (
    <InstructionsLayout
      icon={MessageCircle}
      label="Papo Reto"
      title="Como apresentar a dinâmica"
      subtitle="Siga o passo a passo e use o teclado invisível."
      backPath="/papo-reto"
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

          <InstructionsSection title="Teclado invisível">
            <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-3">
              {letterRows.flat().map((letter) => (
                <div
                  key={letter}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/80"
                >
                  {letter}
                </div>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default PapoRetoInstructions;
