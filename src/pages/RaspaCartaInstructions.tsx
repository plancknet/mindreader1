import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const instructionsText = [
  'Assim como na mágica "Carta Mental" no "Raspa Carta" a seleção da carta escolhida pelo seu amigo será por meio de um teclado invisível que está no verso da carta. Desta vez com apenas um clique a carta será selecionada.',
  'O grid de botões (3 colunas x 4 linhas) está disposto como a seguir:',
  'J de Espada     Q de Espada    K de Espada\nJ de Copas      Q de Copas      K de Copas\nJ de Ouro        Q de Ouro        K de Ouro\nJ de Paus         Q de Paus         K de Paus',
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
          <h1 className="text-4xl font-bold text-foreground">Treine o teclado invisível</h1>
          <p className="text-muted-foreground">Saiba como selecionar a carta antes de revelar.</p>
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
          <Button size="lg" onClick={() => navigate('/raspa-carta')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RaspaCartaInstructions;
