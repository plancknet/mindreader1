import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';

const instructions = [
  'Peça ao seu amigo para memorizar silenciosamente uma das cartas apresentadas na tela.',
  'Explique que ele pode clicar no botão "Embaralhar" quantas vezes quiser. Isso garante que ninguém sabe onde a carta ficou.',
  'Diga que o MindReader irá ler a mente dele e remover a carta memorizada do grid.',
  'Peça para ele clicar no botão "Oi Sumida" quando estiver pronto para revelar.',
  'Mostre que a carta escolhida “sumiu” misteriosamente, confirmando que a previsão estava correta.',
];

const OiSumidaInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Shuffle className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Oi Sumida</p>
          <h1 className="text-4xl font-bold text-foreground">Como apresentar o efeito</h1>
          <p className="text-muted-foreground">
            Siga o roteiro abaixo para conduzir o truque e garantir que a carta sumida impressione o público.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur text-foreground/90">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {instructions.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}
            <p className="text-sm text-muted-foreground">
              Reforce que apenas o amigo sabe qual carta foi memorizada – o resto é pura “leitura mental”.
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/oi-sumida')}>
            Voltar ao jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OiSumidaInstructions;
