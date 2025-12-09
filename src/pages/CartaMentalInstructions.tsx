import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

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

const paragraphsBeforeGrid = [
  'Nesta mágica, existe um teclado invisível de 3 colunas por 4 linhas, exatamente como o modelo abaixo.',
];

const paragraphsBetweenGridAndReveal = [
  'Logo abaixo está o botão "Revelar a Carta", dividido em quatro partes correspondentes aos naipes.',
];

const paragraphsAfterReveal = [
  'Como o teclado não pode ser visto pelo seu amigo, você deverá imaginar a divisão do grid de botões no verso da carta (3 colunas x 4 linhas) e clicar discretamente para que ele não perceba que você selecionou a carta escolhida por ele.',
  'Com o clique em um dos lados do botão "Revelar a Carta" você estará escolhendo um dos naipes e a carta escolhida por ele será revelado num passe de mágica.',
  'Ah... mas e o Rei (K) ??? Se a carta escolhida for um K, não clique no verso da carta; apenas toque na área do naipe no botão "Revelar a Carta" e o Rei será revelado.',
  'Agora é só treinar e aplicar com seus amigos.',
];

const CartaMentalInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls showExtras />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Carta Mental</p>
          <h1 className="text-4xl font-bold text-foreground">Domine o teclado invisível</h1>
          <p className="text-muted-foreground">Visualize o verso da carta e o botão revelador.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            {paragraphsBeforeGrid.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Verso da carta - teclado exposto
              </p>
              <div className="relative aspect-[2/3] w-full max-w-xs rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_rgba(17,24,39,0.95))] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
                <div className="absolute inset-1 rounded-[28px] border border-white/20 bg-gradient-to-b from-slate-900/70 via-slate-900 to-slate-950" />
                <div className="relative z-10 grid h-full grid-cols-3 grid-rows-4 gap-3 p-3">
                  {gridRows.map((row) =>
                    row.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-primary/30 bg-white/10 text-center text-sm font-semibold text-white shadow-lg shadow-primary/10"
                        disabled
                      >
                        {label}
                      </button>
                    )),
                  )}
                </div>
              </div>
            </div>

            {paragraphsBetweenGridAndReveal.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Botão "Revelar a Carta" – áreas dos naipes
              </p>
              <div className="w-full max-w-md rounded-full border border-white/20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-1 shadow-[0_20px_40px_rgba(15,23,42,0.5)]">
                <div className="grid grid-cols-4 gap-1">
                  {suits.map((suit) => (
                    <div
                      key={suit.id}
                      className="rounded-full border border-primary/30 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      <span className={suit.tone}>{suit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {paragraphsAfterReveal.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/carta-mental')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartaMentalInstructions;
