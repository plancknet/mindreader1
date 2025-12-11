import { HeaderControls } from '@/components/HeaderControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const instructions = [
  'Diga ao seu amigo que sua tia é uma Bruxa. Bruxa daquelas que faz magia e gosta muito de jogo da velha.',
  'Explique que ela costuma fazer previsões e que já deixou uma preparada para essa partida.',
  'Mostre o verso de um papel quadrado, mas não revele a previsão enquanto o jogo acontece.',
  'Neste papel está anotada a seguinte previsão, no formato de jogo da velha:',
  'Agora peça para ele jogar o Jogo da Velha Bruxa no aplicativo.',
  'Ao final, revele a previsão feita pela sua Tia Bruxa e compare com o tabuleiro.',
];

const predictionGrid = [
  ['X', 'O', 'O'],
  ['O', 'X', 'X'],
  ['X', 'X', 'O'],
];

const JogoVelhaBruxaInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6 text-white">
        <div className="flex justify-end">
          <HeaderControls />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-slate-300">Instruções</p>
          <h1 className="text-4xl font-bold">Jogo da Velha Bruxa</h1>
          <p className="text-slate-300">
            Use este roteiro para apresentar a previsão mágica da sua tia bruxa antes de desafiar seu amigo.
          </p>
        </div>

        <Card className="bg-slate-900/70 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Passo a passo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-200">
            <ol className="list-decimal space-y-3 pl-4">
              {instructions.map((step, index) => (
                <li key={index} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>

            <div className="space-y-3">
              <p className="font-semibold">Previsão anotada no papel:</p>
              <div className="inline-grid grid-cols-3 gap-1 rounded-xl border border-white/20 bg-slate-800/60 p-4">
                {predictionGrid.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg bg-slate-900/80 border border-white/10"
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-slate-400">
                Mantenha essa previsão oculta até que o jogo termine para reforçar o efeito mágico.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => navigate('/jogo-da-velha-bruxa')}>
            Voltar ao jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JogoVelhaBruxaInstructions;
