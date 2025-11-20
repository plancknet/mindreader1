import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, RotateCcw, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { toast } from 'sonner';
import { HeaderControls } from '@/components/HeaderControls';
import { GAME_IDS } from '@/constants/games';

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const word = searchParams.get('word') || '';
  const { incrementUsage } = useUsageLimit();

  // Increment usage count when result is shown
  useEffect(() => {
    const incrementCount = async () => {
      try {
        await incrementUsage(GAME_IDS.MIND_READER);
      } catch (error) {
        console.error('Error incrementing usage:', error);
        toast.error('Erro ao registrar revelação');
      }
    };

    incrementCount();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <HeaderControls />

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Brain className="w-24 h-24 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('result.title')} 🧠✨
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {t('result.subtitle')}
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
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/select-theme')}>
              <RotateCcw className="mr-2" />
              {t('common.playAgain')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              {t('common.backHome')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/mind-reader/instructions', { state: { from: location.pathname } })}
            >
              <BookOpen className="mr-2" />
              {t('connectMind.instructionsButton')}
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
