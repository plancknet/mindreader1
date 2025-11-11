import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Eye, ArrowLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

const Instructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as { from?: string };
  const backTarget = navigationState.from ?? '/game-selector';
  const { t } = useTranslation();

  const steps = [
    {
      title: t('instructions.step4Title'),
      text: t('instructions.step4Text'),
    },
    {
      title: t('instructions.step1Title'),
      text: t('instructions.step1Text'),
    },
    {
      title: t('instructions.step2Title'),
      text: t('instructions.step2Text'),
    },
    {
      title: t('instructions.step3Title'),
      text: t('instructions.step3Text'),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-end gap-2">
          <LanguageSelector />
          <LogoutButton />
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate(backTarget)}
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
          {steps.map((step, index) => (
            <Card key={step.title} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            </Card>
          ))}

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
