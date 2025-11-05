import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Eye, ArrowLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const Instructions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-20 h-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('instructions.title')}
          </h1>
          <p className="text-muted-foreground text-xl">
            {t('instructions.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('instructions.step1Title')}</h3>
                <p className="text-muted-foreground">
                  {t('instructions.step1Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('instructions.step2Title')}</h3>
                <p className="text-muted-foreground">
                  {t('instructions.step2Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('instructions.step3Title')}</h3>
                <p className="text-muted-foreground">
                  {t('instructions.step3Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('instructions.step4Title')}</h3>
                <p className="text-muted-foreground">
                  {t('instructions.step4Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('instructions.tipsTitle')}</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('instructions.tip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('instructions.tip2')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="text-xl px-8 py-6"
          >
            {t('common.understood')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
