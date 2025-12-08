import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

const steps = [
  {
    title: '1. Combine o público',
    description:
      'Peça para a pessoa selecionar qualquer carta na tela “Escolha uma Carta”. Assim que ela tocar no botão “Embaralhar”, o app reorganiza automaticamente as cartas em três pilhas.',
  },
  {
    title: '2. Observe a coluna indicada',
    description:
      'Toda vez que perguntar “Sua carta está aqui?”, basta identificar em qual das três colunas o amigo confirmou. A carta escolhida SEMPRE permanece na coluna informada e é reposicionada para o centro daquela pilha na próxima rodada.',
  },
  {
    title: '3. Revele após três ciclos',
    description:
      'Depois de três reorganizações você já sabe a carta: ela estará na posição central das cartas exibidas pelo app. Basta revelar com confiança!',
  },
];

const demoColumns = [
  { label: 'Coluna 1', delay: 0 },
  { label: 'Coluna 2', delay: 2 },
  { label: 'Coluna 3', delay: 4 },
];

const MixDeCartasInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <style>{`
        @keyframes columnPulse {
          0% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
          10% { transform: translateY(-4px) scale(1); opacity: 1; }
          30% { transform: translateY(-4px) scale(1); opacity: 1; }
          45% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.98); opacity: 0.6; }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Shuffle className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Mix de Cartas</p>
          <h1 className="text-4xl font-bold text-foreground">Como desvendar a carta escolhida</h1>
          <p className="text-muted-foreground">
            Use o padrão das pilhas para saber exatamente qual carta foi selecionada.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            {steps.map((step) => (
              <div key={step.title}>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-slate-950/70 via-slate-900/80 to-slate-950/90 p-6 shadow-inner shadow-primary/5">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Exemplo visual — a carta permanece na coluna selecionada
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {demoColumns.map((column) => (
                  <div key={column.label} className="space-y-3 text-center">
                    <div
                      className="rounded-2xl border border-primary/30 bg-white/10 p-3 shadow-lg shadow-primary/10"
                      style={{
                        animation: 'columnPulse 6s ease-in-out infinite',
                        animationDelay: `${column.delay}s`,
                      }}
                    >
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                        {column.label}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-16 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900"
                          >
                            <div className="h-full w-full rounded-xl border border-white/5 bg-[url('/baralho/1.webp')] bg-cover bg-center opacity-60" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A coluna destacada é a informada pelo amigo. O app coloca a carta escolhida no centro dela.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/mind-reader/mix-de-cartas')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MixDeCartasInstructions;
