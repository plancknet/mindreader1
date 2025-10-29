import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, RotateCcw } from 'lucide-react';

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const word = searchParams.get('word') || '';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Brain className="w-24 h-24 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold">
            Sua mente foi lida com sucesso! 🧠✨
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Eu li sua mente. A palavra é:
          </p>
        </div>

        <Card className="p-12 text-center bg-gradient-alert animate-pulse">
          <div className="space-y-4">
            <div className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg animate-scale-in">
              {word}
            </div>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            ✨ Magia? Não! Ciência da computação!✨
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/select-theme')}>
              <RotateCcw className="mr-2" />
              Jogar Novamente
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              Voltar ao Início
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>🎯 Como funciona?</p>
          <p>Mistéééério!!!</p>
        </div>
      </div>
    </div>
  );
};

export default Result;
