import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { themes } from '@/data/themes';
import { Brain, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { PaywallModal } from '@/components/PaywallModal';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

const SelectTheme = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { usageData, isLoading, checkUsageLimit } = useUsageLimit();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    // Check if user can use the app
    if (usageData && !usageData.canUse && !usageData.isPremium) {
      setShowPaywall(true);
      return;
    }

    navigate(`/start-prompt?theme=${themeId}`);
  };

  // Refresh usage data when component mounts
  useEffect(() => {
    checkUsageLimit();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        usageCount={usageData?.usageCount || 0}
        freeLimit={usageData?.freeLimit || 3}
      />
      
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => navigate('/select-theme')}>
            {t('common.back')}
          </Button>
          <div className="flex gap-2">
            <LanguageSelector />
            <LogoutButton />
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('selectTheme.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('selectTheme.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="p-8 hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="text-center space-y-4">
                <div className="text-7xl">{theme.emoji}</div>
                <h2 className="text-2xl font-bold">{theme.name[language] || theme.name['pt-BR']}</h2>
                <Button className="w-full" variant="outline">
                  {t('common.select')}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            {t('selectTheme.tip')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectTheme;
