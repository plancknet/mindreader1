import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Brain, Type, Sparkles } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

const MysteryWordInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as { from?: string };
  const backTarget = navigationState.from ?? '/game-selector';
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <LanguageSelector />
          <LogoutButton />
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(backTarget)}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t('mysteryWordInstructions.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('mysteryWordInstructions.subtitle')}
          </p>
        </div>

        <Card className="mb-12 border-primary/30 bg-background/80 backdrop-blur">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm">
                {t('mysteryWordInstructions.videoTitle')}
              </p>
              <p className="text-muted-foreground text-base">
                {t('mysteryWordInstructions.videoDescription')}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-primary/20 bg-black">
              <div className="relative w-full aspect-[9/16]">
                <video
                  key="palavra-demo"
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-contain"
                >
                  <source src="/videos/Palavra.mp4" type="video/mp4" />
                  {t('mysteryWordInstructions.videoTitle')}
                </video>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions Steps */}
        <div className="space-y-6 mb-12">
          {[
            { icon: Brain, title: t('mysteryWordInstructions.step1Title'), text: t('mysteryWordInstructions.step1Text') },
            { icon: Type, title: t('mysteryWordInstructions.step2Title'), text: t('mysteryWordInstructions.step2Text') },
            { icon: Sparkles, title: t('mysteryWordInstructions.step3Title'), text: t('mysteryWordInstructions.step3Text') },
          ].map(({ icon: Icon, title, text }, index) => (
            <Card key={title} className="p-6 hover:shadow-lg transition-shadow border-primary/20">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground">
                    {text}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/mystery-word')}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {t('common.understood')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MysteryWordInstructions;
