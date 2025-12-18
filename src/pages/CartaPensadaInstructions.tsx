import { Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionNote,
} from '@/components/InstructionsLayout';

const steps = [
  'Peca para a pessoa pensar em qualquer carta exibida nas tres colunas e guardar somente na mente.',
  'Pergunte em qual das colunas a carta aparece.',
  'As cartas serao redistribuidas. Peca para ele selecionar a coluna novamente e novamente.',
  'A carta pensada sera revelada.',
];

const CartaPensadaInstructions = () => {
  return (
    <InstructionsLayout
      icon={Sparkles}
      label="Carta Pensada"
      title="Como conduzir a demonstracao"
      subtitle="Use apenas a coluna escolhida como informacao e deixe o app trabalhar por voce."
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
            Dica: memorize que a resposta final aparece na 11a carta para revelar com firmeza, mesmo antes de o app mostrar.
          </InstructionNote>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default CartaPensadaInstructions;
