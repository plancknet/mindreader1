import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type RankId = 'J' | 'Q' | 'K';

const suits = [
  { id: 'spades', label: 'Espadas', tone: 'text-slate-100' },
  { id: 'hearts', label: 'Copas', tone: 'text-rose-300' },
  { id: 'diamonds', label: 'Ouros', tone: 'text-amber-200' },
  { id: 'clubs', label: 'Paus', tone: 'text-emerald-200' },
];

const rankColumns: RankId[] = ['J', 'Q', 'K'];

const paragraphsBeforeGrid = [
  'Assim como na mágica "Carta Mental" no "Raspa Carta" a seleção da carta escolhida pelo seu amigo será por meio de um teclado invisível que está no verso da carta. Desta vez com apenas um clique a carta será selecionada.',
  'O grid de botões (3 colunas x 4 linhas) está disposto como a seguir:',
];

const paragraphsAfterGrid = [
  'Selecione discretamente a carta escolhida pelo seu amigo e peça a ele para "raspar" a tela do celular para que a carta seja revelada.',
  'Bora treinar... você consegue!',
];

const RaspaCartaInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Raspa Carta</p>
          <h1 className="text-4xl font-bold text-foreground">Visualize o teclado invisível</h1>
          <p className="text-muted-foreground">Veja exatamente como os botões se distribuem no verso da carta.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {paragraphsBeforeGrid.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Verso da carta com os botões revelados
              </p>
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-slate-900/80 via-slate-900 to-slate-950" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {suits.map((suit) =>
                    rankColumns.map((rank) => (
                      <button
                        key={`${rank}-${suit.id}`}
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-primary/20 bg-white/10 px-2 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/10"
                        disabled
                      >
                        <span className={`${suit.tone}`}>
                          {`${rank} de ${suit.label}`}
                        </span>
                      </button>
                    )),
                  )}
                </div>
              </div>
            </div>

            {paragraphsAfterGrid.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/raspa-carta')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RaspaCartaInstructions;
