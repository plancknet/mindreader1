import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, MessageSquare, Type, Sparkles, Volume2 } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

const MentalConversationInstructions = () => {
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
            {t('mentalConversationInstructions.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('mentalConversationInstructions.subtitle')}
          </p>
        </div>

        <Card className="mb-12 border-primary/30 bg-background/80 backdrop-blur">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm">
                {t('mentalConversationInstructions.videoTitle')}
              </p>
              <p className="text-muted-foreground text-base">
                {t('mentalConversationInstructions.videoDescription')}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-primary/20 bg-black">
              <div className="relative w-full aspect-[9/16]">
                <video
                  key="conversa-demo"
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-contain"
                >
                  <source src="/videos/Conversa.mp4" type="video/mp4" />
                  {t('mentalConversationInstructions.videoTitle')}
                </video>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions Steps */}
        <div className="space-y-6 mb-12">
          {[
            { icon: MessageSquare, title: t('mentalConversationInstructions.step1Title'), text: t('mentalConversationInstructions.step1Text') },
            { icon: Type, title: t('mentalConversationInstructions.step2Title'), text: t('mentalConversationInstructions.step2Text') },
            { icon: Sparkles, title: t('mentalConversationInstructions.step3Title'), text: t('mentalConversationInstructions.step3Text') },
            { icon: Volume2, title: t('mentalConversationInstructions.step4Title'), text: t('mentalConversationInstructions.step4Text') },
          ].map(({ icon: Icon, title, text }) => (
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
            onClick={() => navigate('/mental-conversation')}
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

export default MentalConversationInstructions;
