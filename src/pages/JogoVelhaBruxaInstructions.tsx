import { Wand2 } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionParagraph,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';

const instructions = [
  'Diga ao seu amigo que sua tia e uma Bruxa - daquelas que fazem magia e sao apaixonadas por jogo da velha.',
  'Explique que ela costuma fazer previsoes e que ja deixou uma especial para essa partida.',
  'Mostre o verso de um papel quadrado, mantendo a previsao escondida enquanto o jogo acontece.',
  'Neste papel esta anotada a previsao abaixo (formato jogo da velha). Lembre de nao revelar ate o final.',
  'Peca para ele jogar o Jogo da Velha Bruxa no app, exatamente como sua tia pediu.',
  'Assim que a partida do jogo da velha terminar, observe que o resultado foi parecido com a previsao abaixo.',
  'O truque esta em girar o papel quadrado para que previsao fique identica ao tabuleiro final do jogo.',
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
      title="Como apresentar a previsao"
      subtitle="Use o roteiro abaixo para criar a experiencia completa antes da partida."
      backPath="/jogo-da-velha-bruxa"
      backLabel="Voltar ao jogo"
    >
      <InstructionsCard>
        <div className="space-y-5">
          {instructions.map((paragraph) => (
            <InstructionParagraph key={paragraph}>{paragraph}</InstructionParagraph>
          ))}

          <InstructionsSection title="Previsao anotada no papel">
            <div className="inline-grid grid-cols-3 gap-3 rounded-2xl border border-[#7f13ec]/30 bg-black/50 p-4 shadow-lg shadow-[#7f13ec]/20">
              {predictionGrid.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#1e1b4b]/70 text-2xl font-bold text-white"
                  >
                    {value}
                  </div>
                ))
              )}
            </div>
            <InstructionNote>
              Mantenha este papel oculto ate o final para reforcar o impacto da previsao da sua tia.
            </InstructionNote>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default JogoVelhaBruxaInstructions;
