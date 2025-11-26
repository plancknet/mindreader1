import { useState, useMemo, useRef } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0];

const EuJaSabia = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [tensSelection, setTensSelection] = useState<number | null>(null);
  const [unitsSelection, setUnitsSelection] = useState<number | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [maskText, setMaskText] = useState<string | null>(null);

  const selectedNumber = useMemo(() => {
    if (tensSelection === null || unitsSelection === null) return null;
    return tensSelection * 10 + unitsSelection;
  }, [tensSelection, unitsSelection]);

  const formattedNumber = selectedNumber !== null ? selectedNumber.toString().padStart(2, '0') : '--';

  const handleGridClick = (value: number) => {
    if (videoStarted) return;
    if (tensSelection === null) {
      setTensSelection(value);
      return;
    }
    if (unitsSelection === null) {
      setUnitsSelection(value);
      return;
    }
    setTensSelection(value);
    setUnitsSelection(null);
  };

  const handleStart = () => {
    if (selectedNumber === null) {
      toast({
        title: 'Defina o número',
        description: 'Toque uma vez para a dezena e outra para a unidade antes de iniciar.',
      });
      return;
    }

    const padded = selectedNumber.toString().padStart(2, '0');
    setMaskText(padded);
    setVideoStarted(true);
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          toast({
            title: 'Não foi possível iniciar o vídeo',
            description: 'Tente tocar novamente no botão Iniciar.',
          });
        });
      }
    });
  };

  const handleReset = () => {
    setVideoStarted(false);
    setMaskText(null);
    setTensSelection(null);
    setUnitsSelection(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoEnded = () => {
    setVideoStarted(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/20 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-secondary/20 blur-[100px]" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-6 pt-12">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-card/80 p-4 shadow-2xl shadow-primary/10 sm:p-6">

          <div className="relative aspect-[9/16] w-full max-h-[80vh] rounded-2xl border border-primary/20 bg-black/80 shadow-xl">
            <video
              ref={videoRef}
              className="h-full w-full rounded-2xl object-contain bg-black"
              src="/videos/eujasabia_base.mp4"
              playsInline
              controls={false}
              onEnded={handleVideoEnded}
            />

            <div className="absolute inset-3 z-10 grid grid-cols-3 grid-rows-4 gap-3 text-white pointer-events-auto">
              {GRID_NUMBERS.map((value, index) => (
                <button
                  key={`${value}-${index}`}
                  type="button"
                  className="rounded-2xl border border-white/5 bg-transparent focus-visible:outline-none"
                  onClick={() => handleGridClick(value)}
                  aria-label={`Selecionar número ${value}`}
                  disabled={videoStarted}
                >
                  <span className="sr-only">{value}</span>
                </button>
              ))}
            </div>

            {maskText && (
              <div className="pointer-events-none absolute inset-3 z-20 grid grid-cols-3 grid-rows-4">
                <div className="col-start-2 row-start-3 flex items-center justify-center text-center relative left-[-17px] top-[24px]">
                  <div
                    className="rounded-xl bg-transparent px-3 py-2 text-black/70"
                    style={{ fontFamily: '"Indie Flower", "Brush Script MT", cursive' }}
                  >
                    <p className="h-2" aria-hidden="true" />
                    <p className="text-[0.72rem] font-semibold leading-tight">Eu já sabia:</p>
                    <p className="text-[1.2rem] font-black leading-tight tracking-widest">{maskText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={handleStart} disabled={videoStarted}>
              Iniciar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reiniciar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EuJaSabia;
