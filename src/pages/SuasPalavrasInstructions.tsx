import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';

const instructionsText = [
  'O funcionamento desta mágica é exatamente o mesmo da mágica "Palavra Misteriosa". Se ainda não souber os truques, veja as instruções da mágica "Palavra Misteriosa".',
  'E lembre-se... treine antes de fazer com seus amigos!',
];

const SuasPalavrasInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Type className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Suas Palavras</p>
          <h1 className="text-4xl font-bold text-foreground">Como funciona</h1>
          <p className="text-muted-foreground">Um lembrete rápido antes de encantar sua plateia.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {instructionsText.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/suas-palavras')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuasPalavrasInstructions;
