import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeaderControls } from '@/components/HeaderControls';
import { CheckCircle2, Shuffle, Smile, Sparkles } from 'lucide-react';

const steps = [
  {
    title: '1. Escolha 3 emojis',
    description: 'Mostre a matriz 3x3 de emojis aleatórios e peça para selecionar exatamente três botões.',
    icon: Smile,
  },
  {
    title: '2. Monte a matriz original',
    description: 'Exiba a linha com os três emojis escolhidos. Eles serão usados em todas as referências futuras.',
    icon: CheckCircle2,
  },
  {
    title: '3-5. Revele a previsão',
    description: 'Informe que apenas uma pessoa pode ver/registrar a previsão e diga: “O emoji 1 ficará comigo, o emoji 2 ficará no meio e o emoji 3 ficará com ele.”',
    icon: Sparkles,
  },
  {
    title: '6. Embaralhe antes de avançar',
    description: 'Ainda na matriz original (1x3), use o botão “Embaralhar” quantas vezes quiser. Ao avançar, a matriz embaralhada é definida.',
    icon: Shuffle,
  },
  {
    title: '7. Selecione dois emojis',
    description: 'Na matriz embaralhada, peça para o participante ativar dois dos três emojis.',
    icon: CheckCircle2,
  },
  {
    title: '8-9. Mova o emoji restante',
    description: 'Mostre a matriz final vazia. Se o emoji do meio da matriz original estiver entre os selecionados, o emoji que sobrou vai para a posição 1,3; caso contrário, ele vai para a posição 1,2.',
    icon: Smile,
  },
  {
    title: '10-12. Finalize a matriz',
    description: 'Peça para o participante escolher apenas um dos dois emojis selecionados. Aplique as regras: se for o emoji do meio original, ele vai para a posição 1,2; senão, para 1,1. O emoji restante ocupa o espaço vazio.',
    icon: CheckCircle2,
  },
  {
    title: '13. Hora da revelação',
    description: 'Se o emoji da posição 1,1 original continuar em 1,1 na matriz final, leia a revelação em voz alta. Caso contrário, seu amigo faz a leitura.',
    icon: Sparkles,
  },
];

const MyEmojisInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <HeaderControls className="mb-6" />

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Smile className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Instruções — Meus Emojis
          </h1>
          <p className="text-muted-foreground text-lg">
            Estruture o efeito usando três áreas: instruções, matrizes e botões.
          </p>
        </div>

        <div className="space-y-5 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="p-6 hover:shadow-lg transition-shadow border-primary/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            onClick={() => navigate('/my-emojis')}
          >
            Começar agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyEmojisInstructions;
