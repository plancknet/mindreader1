import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionNote,
} from '@/components/InstructionsLayout';

const steps = [
  'Peça para a pessoa pensar em qualquer carta exibida nas três colunas e guardar somente na mente.',
  'Pergunte em qual das colunas a carta aparece.',
  'As cartas serão redistribuídas. Peça para ele selecionar a coluna novamente e novamente.',
  'A carta pensada será revelada.',
];

const CartaPensadaInstructions = () => {
  return (
    <InstructionsLayout
      icon={Sparkles}
      label="Carta Pensada"
      title="Como conduzir a demonstração"
      subtitle="Use apenas a coluna escolhida como informação e deixe o app trabalhar por você."
      backPath="/carta-pensada"
    >
      <InstructionsCard>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <InstructionStep key={step} number={index + 1}>
              {step}
            </InstructionStep>
          ))}
          <InstructionNote>
            Dica: memorize que a resposta final aparece na 11ª carta para revelar com firmeza, mesmo antes de o app mostrar.
          </InstructionNote>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default CartaPensadaInstructions;

