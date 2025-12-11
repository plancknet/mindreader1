import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

const instructions = [
  'Diga ao seu amigo que sua tia é uma Bruxa — daquelas que fazem magia e são apaixonadas por jogo da velha.',
  'Explique que ela costuma fazer previsões e que já deixou uma especial para essa partida.',
  'Mostre o verso de um papel quadrado, mantendo a previsão escondida enquanto o jogo acontece.',
  'Neste papel está anotada a previsão abaixo (formato jogo da velha). Lembre de não revelar até o final.',
  'Peça para ele jogar o Jogo da Velha Bruxa no app, exatamente como sua tia pediu.',
  'Assim que terminar, revele a previsão e compare com o tabuleiro para finalizar o efeito.',
];

const predictionGrid = [
  ['X', 'O', 'O'],
  ['O', 'X', 'X'],
  ['X', 'X', 'O'],
];

const JogoVelhaBruxaInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Wand2 className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Jogo da Velha Bruxa</p>
          <h1 className="text-4xl font-bold text-foreground">Como apresentar a previsão</h1>
          <p className="text-muted-foreground">Use o roteiro abaixo para criar a experiência completa antes da partida.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur text-foreground/90">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {instructions.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="pt-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Previsão anotada no papel
              </p>
              <div className="inline-grid grid-cols-3 gap-3 rounded-2xl border border-primary/30 bg-black/50 p-4 shadow-lg shadow-primary/20">
                {predictionGrid.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-slate-900/70 text-2xl font-bold text-white"
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Mantenha este papel oculto até o final para reforçar o impacto da previsão da sua tia.
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/jogo-da-velha-bruxa')}>
            Voltar ao jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JogoVelhaBruxaInstructions;
