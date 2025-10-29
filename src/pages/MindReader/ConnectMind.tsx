import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Camera, Brain } from 'lucide-react';
import { useHeadPoseDetection } from '@/hooks/useHeadPoseDetection';

const ConnectMind = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-20 h-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Leitor de Mentes
          </h1>
          <p className="text-muted-foreground text-xl">
            Prepare-se para ter sua mente lida pelo seu aparelho
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isModelLoading && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <Camera className="w-16 h-16 mx-auto animate-pulse text-primary" />
              <p className="text-lg text-muted-foreground">Inicializando conexão mental...</p>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">Aguardando câmera...</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleConnect}
            disabled={!cameraActive || isModelLoading || isConnecting}
            className="text-xl px-8 py-6"
          >
            <Brain className="mr-2 h-6 w-6" />
            Conectar a mente
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✓ Posicione seu rosto no centro da câmera</p>
          <p>✓ Certifique-se de estar em um ambiente bem iluminado</p>
          <p>✓ Mantenha a cabeça visível durante todo o processo</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectMind;
