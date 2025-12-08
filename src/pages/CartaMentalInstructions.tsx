import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const instructionsText = [
  'Nesta mágica, existe um teclado invisível de 3 colunas por 4 linhas, como demonstrado a seguir:',
  'A 2 3\n4 5 6\n7 8 9\n10 J Q',
  'E um botão de "Revelar a Carta" que se divide em 4 partes',
  'Espada Copas Ouros Paus',
  'Como o teclado não pode ser visto pelo seu amigo, você deverá imaginar a divisão do grid de botões no verso da carta (3 colunas x 4 linhas) e clicar discretamente para que ele não perceba que você selecionou a carta escolhida por ele.',
  'Com o clique em um dos lados do botão "Revelar a Carta" você estará escolhendo um dos naipes e a carta escolhida por ele será revelado num passe de mágica.',
  'Ah... mas e o Rei (K) ???.. se a carta escolhida por ele for um K, não clique no verso da carta apenas clique no botão "Revelar a Carta", na posição do naipe escolhido e o K será revelado.',
  'Agora é só treinar e aplicar com seus amigos.',
];

const CartaMentalInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Carta Mental</p>
          <h1 className="text-4xl font-bold text-foreground">Domine o teclado invisível</h1>
          <p className="text-muted-foreground">Entenda o mecanismo antes de apresentar o efeito.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
            {instructionsText.map((paragraph) => (
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
