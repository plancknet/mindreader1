import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const steps = [
  'Peça para a pessoa pensar em qualquer carta exibida nas três colunas e guardar somente na mente.',
  'Pergunte em qual das colunas a carta aparece. Este será o único input visível.',
  'Empilhe cada coluna mantendo a ordem mostrada (a carta superior da coluna vira a base da pilha).',
  'Monte a pilha principal colocando uma pilha não escolhida em primeiro, a pilha escolhida no meio e a outra não escolhida no final.',
  'Vire a pilha inteira (como se mostrasse o verso da carta inferior) e redistribua nas três colunas, carta por carta, sempre da esquerda para a direita.',
  'Repita esse processo por três rodadas. Depois disso, a carta pensada estará automaticamente na 11ª posição (linha 4, coluna 2).',
];

const CartaPensadaInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Carta Pensada</p>
          <h1 className="text-4xl font-bold text-foreground">Como conduzir a demonstração</h1>
          <p className="text-muted-foreground">
            Use apenas a coluna escolhida como informação e deixe o app trabalhar por você.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3">
                <span className="text-sm font-semibold text-primary">{index + 1}.</span>
                <p className="text-foreground">{step}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Dica: memorize que a resposta final aparece na 11ª carta para revelar com firmeza, mesmo antes de o app mostrar.
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/carta-pensada')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartaPensadaInstructions;
