import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Brain, MessageCircle, CheckCircle, Sparkles } from 'lucide-react';
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

        {/* Instructions Steps */}
        <div className="space-y-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('mentalConversationInstructions.step1Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('mentalConversationInstructions.step1Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('mentalConversationInstructions.step2Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('mentalConversationInstructions.step2Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('mentalConversationInstructions.step3Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('mentalConversationInstructions.step3Text')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('mentalConversationInstructions.step4Title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('mentalConversationInstructions.step4Text')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="p-6 bg-primary/5 border-primary/20 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('mentalConversationInstructions.tipsTitle')}
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              {t('mentalConversationInstructions.tip1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              {t('mentalConversationInstructions.tip2')}
            </li>
          </ul>
        </Card>

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

export default MysteryWordInstructions;
