import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Camera, Brain, BookOpen } from 'lucide-react';
import { useHeadPoseDetection } from '@/hooks/useHeadPoseDetection';
import { InstallPWA } from '@/components/InstallPWA';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';

const ConnectMind = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const { videoRef, isModelLoading, error, cameraActive } = useHeadPoseDetection();

  useEffect(() => {
    if (cameraActive && !isModelLoading) {
      setIsConnecting(false);
    }
  }, [cameraActive, isModelLoading]);

  const handleConnect = () => {
    if (cameraActive && !isModelLoading) {
      navigate('/select-theme');
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-3 md:space-y-8">
        <div className="flex justify-end gap-2 mb-2">
          <LanguageSelector />
          <LogoutButton />
        </div>
        
        <div className="text-center space-y-2 md:space-y-4">
          <div className="flex justify-center items-center gap-2 md:gap-4">
            <Brain className="w-12 h-12 md:w-20 md:h-20 text-primary animate-pulse" />
            <InstallPWA />
          </div>
          <h1 className="text-3xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('connectMind.title')}
          </h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isModelLoading && (
          <Card className="p-4 md:p-8 text-center">
            <div className="space-y-2 md:space-y-4">
              <Camera className="w-12 h-12 md:w-16 md:h-16 mx-auto animate-pulse text-primary" />
              <p className="text-sm md:text-lg text-muted-foreground">{t('connectMind.initializing')}</p>
            </div>
          </Card>
        )}

        <Card className="p-3 md:p-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm md:text-lg">{t('connectMind.waitingCamera')}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleConnect}
            disabled={!cameraActive || isModelLoading || isConnecting}
            className="text-base md:text-xl px-6 py-4 md:px-8 md:py-6 w-full md:w-auto"
          >
            <Brain className="mr-2 h-5 w-5 md:h-6 md:w-6" />
            {t('connectMind.connectButton')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => navigate('/mind-reader/instructions', { state: { from: location.pathname } })}
            className="text-primary font-semibold hover:text-primary"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {t('connectMind.instructionsButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectMind;
