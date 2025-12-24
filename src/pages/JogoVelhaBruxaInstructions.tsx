import { Wand2 } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';

const steps = [
  'Diga ao seu amigo que sua tia é uma Bruxa - daquelas que fazem magia e são apaixonadas por jogo da velha.',
  'Explique que ela costuma fazer previsões e que já deixou uma especial para essa partida.',
  'Mostre o verso de um papel quadrado, mantendo a previsão escondida enquanto o jogo acontece.',
  'Neste papel está anotada a previsão abaixo (formato jogo da velha). Lembre de não revelar até o final.',
  'Peça para ele jogar o Jogo da Velha Bruxa no app, exatamente como sua tia pediu.',
  'Assim que a partida do jogo da velha terminar, observe que o resultado foi parecido com a previsão abaixo.',
  'O truque está em girar o papel quadrado para que a previsão fique idêntica ao tabuleiro final do jogo.',
];

const predictionGrid = [
  ['X', 'O', 'O'],
  ['O', 'X', 'X'],
  ['X', 'X', 'O'],
];

const JogoVelhaBruxaInstructions = () => {
  return (
    <InstructionsLayout
      icon={Wand2}
      label="Jogo da Velha Bruxa"
      title="Como apresentar a previsão"
      subtitle="Use o roteiro abaixo para criar a experiência completa antes da partida."
      backPath="/jogo-da-velha-bruxa"
      backLabel="Voltar ao jogo"
    >
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

          <InstructionsSection title="Previsão anotada no papel">
            <div className="inline-grid grid-cols-3 gap-3 rounded-2xl border border-[#7f13ec]/30 bg-black/50 p-4 shadow-lg shadow-[#7f13ec]/20">
              {predictionGrid.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#1e1b4b]/70 text-2xl font-bold text-white"
                  >
                    {value}
                  </div>
                )),
              )}
            </div>
            <InstructionNote>
              Mantenha este papel oculto até o final para reforçar o impacto da previsão da sua tia.
            </InstructionNote>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default JogoVelhaBruxaInstructions;
