import { useState, useMemo, useRef, useEffect, type ChangeEvent } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0];
const MAX_VIDEO_SIZE_BYTES = 2048 * 1024; // 2048 KB
const ACCEPTED_VIDEO_TYPE = 'video/mp4';

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const EuJaSabia = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [tensSelection, setTensSelection] = useState<number | null>(null);
  const [unitsSelection, setUnitsSelection] = useState<number | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [maskText, setMaskText] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);

  const selectedNumber = useMemo(() => {
    if (tensSelection === null || unitsSelection === null) return null;
    return tensSelection * 10 + unitsSelection;
  }, [tensSelection, unitsSelection]);

  const formattedNumber = selectedNumber !== null ? selectedNumber.toString().padStart(2, '0') : '--';
  const activeVideoSrc = customVideoSrc ?? '/videos/eujasabia_base.mp4';

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.user) {
        console.error('Erro ao buscar usuário para Eu Já Sabia:', error);
        return;
      }
      setUserId(data.user.id);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setCustomVideoSrc(null);
      setLoadingVideo(false);
      return;
    }

    let isMounted = true;
    const loadVideo = async () => {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from('user_videos')
        .select('video_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMounted) return;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar vídeo personalizado:', error);
        toast({
          title: 'Não deu para carregar seu vídeo',
          description: 'Vamos continuar usando o vídeo base padrão.',
        });
      }

      setCustomVideoSrc(data?.video_data ?? null);
      setLoadingVideo(false);
    };

    loadVideo();
    return () => {
      isMounted = false;
    };
  }, [userId, toast]);

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

  const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;

    if (file.type !== ACCEPTED_VIDEO_TYPE) {
      toast({
        title: 'Formato inválido',
        description: 'Envie um vídeo MP4.',
      });
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast({
        title: 'Vídeo muito grande',
        description: 'O arquivo precisa ter no máximo 2 MB.',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Não encontramos seu usuário',
        description: 'Entre novamente para enviar um vídeo personalizado.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const base64Video = await fileToDataUrl(file);
      const { error } = await supabase
        .from('user_videos')
        .upsert(
          { user_id: userId, video_data: base64Video },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw error;
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setVideoStarted(false);
      setCustomVideoSrc(base64Video);
      toast({
        title: 'Vídeo atualizado',
        description: 'Seu vídeo personalizado será usado imediatamente.',
      });
    } catch (error) {
      console.error('Erro ao enviar vídeo personalizado:', error);
      toast({
        title: 'Não foi possível enviar o vídeo',
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentVideoStatus = loadingVideo
    ? 'Carregando...'
    : customVideoSrc
      ? 'Vídeo personalizado carregado'
      : 'Usando vídeo base do app';

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
          <div className="space-y-2 rounded-2xl border border-primary/15 bg-background/70 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-primary uppercase tracking-[0.35em] text-xs">
              Instruções para gravar o vídeo
            </p>
            <p>
              Coloque o celular na posição vertical (em pé), utilizando a câmera frontal, a uma altura de XX cm. A folha em branco deverá estar na mesma altura (XX cm) a uma distância de YY cm. Vista-se de preto. O formato deverá ser MP4.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/70 p-4">
            <div>
              <p className="font-semibold text-primary">Envie o seu vídeo personalizado</p>
              <p className="text-sm text-muted-foreground">
                Formato obrigatório MP4 e tamanho máximo de 2 MB (2048 KB). Caso não envie, utilizaremos o vídeo base
                padrão localizado em <code className="text-xs text-primary">/public/videos/eujasabia_base.mp4</code>.
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Status: {currentVideoStatus}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-full border border-primary/40 px-6 py-2 text-sm font-semibold transition hover:bg-primary/10 ${
                  isUploading || !userId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="file"
                  accept="video/mp4"
                  className="sr-only"
                  onChange={handleVideoUpload}
                  disabled={isUploading || !userId}
                />
                {isUploading ? 'Enviando...' : 'Selecionar vídeo MP4'}
              </label>
            </div>
          </div>

          <div className="relative aspect-[9/16] w-full max-h-[80vh] rounded-2xl border border-primary/20 bg-black/80 shadow-xl">
            <video
              ref={videoRef}
              key={activeVideoSrc}
              className="h-full w-full rounded-2xl object-contain bg-black"
              src={activeVideoSrc}
              playsInline
              controls={false}
              onEnded={handleVideoEnded}
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Toque 2 vezes nas posições invisíveis para registrar o número (dezena + unidade)
              </p>
            </div>

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

          <div className="rounded-2xl border border-primary/15 bg-background/80 p-4 text-center text-sm">
            <p className="font-semibold text-primary">Número selecionado</p>
            <p className="mt-2 text-3xl font-black tracking-widest text-white">{formattedNumber}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Dezena: {tensSelection ?? '–'} • Unidade: {unitsSelection ?? '–'}
            </p>
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
