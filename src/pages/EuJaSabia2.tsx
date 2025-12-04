import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0];
const DEFAULT_MASK_POSITION = { x: 48, y: 62 };
const DEFAULT_MASK_COLOR = '#000000';
const DEFAULT_MASK_SIZE = 1.2;
const DEFAULT_MASK_DISPLAY_TIME = 0;
const MIN_MASK_SIZE = 0.8;
const MAX_MASK_SIZE = 2.5;
const MASK_SIZE_STEP = 0.05;
const MAX_VIDEO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_KB = MAX_VIDEO_SIZE_BYTES / 1024;
const ACCEPTED_VIDEO_TYPE = 'video/mp4';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const EuJaSabia2 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [tensSelection, setTensSelection] = useState<number | null>(null);
  const [unitsSelection, setUnitsSelection] = useState<number | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [maskNumber, setMaskNumber] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditingMask, setIsEditingMask] = useState(false);
  const [isSavingMask, setIsSavingMask] = useState(false);
  const [isDraggingMask, setIsDraggingMask] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isMaskTimeReached, setIsMaskTimeReached] = useState(true);
  const [videoProgress, setVideoProgress] = useState({ current: 0, duration: 0 });
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [adminVideoData, setAdminVideoData] = useState<{
    videoSrc: string | null;
    maskPosition: { x: number; y: number };
    maskColor: string;
    maskSize: number;
  } | null>(null);

  const [maskPosition, setMaskPosition] = useState(DEFAULT_MASK_POSITION);
  const [maskColor, setMaskColor] = useState(DEFAULT_MASK_COLOR);
  const [maskSize, setMaskSize] = useState(DEFAULT_MASK_SIZE);
  const [maskDisplayTime, setMaskDisplayTime] = useState(DEFAULT_MASK_DISPLAY_TIME);

  const activeVideoSrc = customVideoSrc ?? adminVideoData?.videoSrc ?? '/videos/eujasabia_base.mp4';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedMaskTime = window.localStorage.getItem('euJaSabia2_maskTime');
    if (storedMaskTime) {
      const parsed = Number(storedMaskTime);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setMaskDisplayTime(parsed);
        setIsMaskTimeReached(parsed === 0);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('euJaSabia2_maskTime', String(maskDisplayTime));
    if (!videoStarted) {
      setIsMaskTimeReached(maskDisplayTime === 0);
      return;
    }
    if (videoRef.current) {
      setIsMaskTimeReached(videoRef.current.currentTime >= maskDisplayTime);
    }
  }, [maskDisplayTime, videoStarted]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.user) {
        console.error('Erro ao buscar usuária(o) para Eu Já Sabia 2:', error);
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
      if (adminVideoData) {
        setMaskPosition(adminVideoData.maskPosition);
        setMaskColor(adminVideoData.maskColor);
        setMaskSize(adminVideoData.maskSize);
      } else {
        setMaskPosition(DEFAULT_MASK_POSITION);
        setMaskColor(DEFAULT_MASK_COLOR);
        setMaskSize(DEFAULT_MASK_SIZE);
      }
      return;
    }

    let isMounted = true;
    const loadUserVideo = async () => {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from('user_videos')
        .select('video_data, mask2_offset_x, mask2_offset_y, mask2_color, mask2_size')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMounted) return;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar vídeo personalizado:', error);
        toast({
          title: 'Não deu para carregar seu vídeo',
          description: 'Vamos continuar usando o vídeo padrão até lá.',
        });
      }

      setCustomVideoSrc(data?.video_data ?? null);

      if (data?.mask2_offset_x != null && data?.mask2_offset_y != null) {
        setMaskPosition({
          x: Number(data.mask2_offset_x),
          y: Number(data.mask2_offset_y),
        });
      } else if (adminVideoData) {
        setMaskPosition(adminVideoData.maskPosition);
      } else {
        setMaskPosition(DEFAULT_MASK_POSITION);
      }

      if (data?.mask2_color) {
        setMaskColor(data.mask2_color);
      } else if (adminVideoData) {
        setMaskColor(adminVideoData.maskColor);
      } else {
        setMaskColor(DEFAULT_MASK_COLOR);
      }

      if (typeof data?.mask2_size === 'number') {
        setMaskSize(data.mask2_size);
      } else if (adminVideoData) {
        setMaskSize(adminVideoData.maskSize);
      } else {
        setMaskSize(DEFAULT_MASK_SIZE);
      }

      setLoadingVideo(false);
    };

    loadUserVideo();
    return () => {
      isMounted = false;
    };
  }, [userId, toast, adminVideoData]);

  useEffect(() => {
    let isMounted = true;
    const loadAdminDefaults = async () => {
      try {
        const { data: adminRole, error } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .limit(1)
          .single();
        if (!isMounted) return;
        if (error || !adminRole?.user_id) {
          setAdminVideoData(null);
          return;
        }
        const { data, error: videoError } = await supabase
          .from('user_videos')
          .select('video_data, mask2_offset_x, mask2_offset_y, mask2_color, mask2_size')
          .eq('user_id', adminRole.user_id)
          .maybeSingle();
        if (!isMounted) return;
        if (videoError || !data) {
          setAdminVideoData(null);
          return;
        }
        setAdminVideoData({
          videoSrc: data.video_data ?? null,
          maskPosition: {
            x: data.mask2_offset_x ?? DEFAULT_MASK_POSITION.x,
            y: data.mask2_offset_y ?? DEFAULT_MASK_POSITION.y,
          },
          maskColor: data.mask2_color ?? DEFAULT_MASK_COLOR,
          maskSize: typeof data.mask2_size === 'number' ? data.mask2_size : DEFAULT_MASK_SIZE,
        });
      } catch (error) {
        console.error('Erro ao carregar vídeo do admin', error);
        if (isMounted) setAdminVideoData(null);
      }
    };
    loadAdminDefaults();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (customVideoSrc) return;
    setIsEditingMask(false);
    setIsDraggingMask(false);
    if (adminVideoData) {
      setMaskPosition(adminVideoData.maskPosition);
      setMaskColor(adminVideoData.maskColor);
      setMaskSize(adminVideoData.maskSize);
      return;
    }
    setMaskPosition(DEFAULT_MASK_POSITION);
    setMaskColor(DEFAULT_MASK_COLOR);
    setMaskSize(DEFAULT_MASK_SIZE);
  }, [customVideoSrc, adminVideoData]);

  const updateMaskPositionFromPointer = (clientX: number, clientY: number) => {
    const container = videoContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const xPercent = ((clientX - rect.left) / rect.width) * 100;
    const yPercent = ((clientY - rect.top) / rect.height) * 100;
    setMaskPosition({
      x: Math.min(100, Math.max(0, xPercent)),
      y: Math.min(100, Math.max(0, yPercent)),
    });
  };

  const handleMaskPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditingMask || !customVideoSrc) return;
    event.preventDefault();
    updateMaskPositionFromPointer(event.clientX, event.clientY);
    setIsDraggingMask(true);
  };

  useEffect(() => {
    if (!isDraggingMask) return;
    const handlePointerMove = (event: PointerEvent) => {
      updateMaskPositionFromPointer(event.clientX, event.clientY);
    };
    const handlePointerUp = () => {
      setIsDraggingMask(false);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingMask]);

  const handleGridClick = (value: number) => {
    if (tensSelection === null) {
      setTensSelection(value);
      setMaskNumber(null);
      return;
    }
    if (unitsSelection === null) {
      setUnitsSelection(value);
      const nextNumber = tensSelection * 10 + value;
      setMaskNumber(nextNumber.toString().padStart(2, '0'));
      return;
    }
    setTensSelection(value);
    setUnitsSelection(null);
    setMaskNumber(null);
  };

  const handleStart = () => {
    setVideoStarted(true);
    setIsVideoPaused(false);
    setVideoProgress((prev) => ({ ...prev, current: 0 }));
    setIsMaskTimeReached(maskDisplayTime === 0);
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        setVideoProgress((prev) => ({ ...prev, duration: videoRef.current?.duration || prev.duration }));
        videoRef.current.play().catch(() => {
          toast({
            title: 'Não foi possível iniciar o vídeo',
            description: 'Tente tocar novamente no botão Iniciar.',
          });
        });
      }
    });
  };

  const handlePauseToggle = () => {
    if (!videoRef.current || !videoStarted) return;

    if (isVideoPaused) {
      videoRef.current
        .play()
        .then(() => setIsVideoPaused(false))
        .catch(() => {
          toast({
            title: 'Não foi possível reproduzir o vídeo',
            description: 'Tente tocar novamente no botão Reproduzir.',
          });
        });
      return;
    }

    videoRef.current.pause();
    setIsVideoPaused(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setVideoProgress((prev) => ({ ...prev, current }));
    setIsMaskTimeReached(current >= maskDisplayTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoProgress((prev) => ({ ...prev, duration: videoRef.current.duration || prev.duration }));
  };

  const handleReset = () => {
    setVideoStarted(false);
    setIsVideoPaused(false);
    setMaskNumber(null);
    setTensSelection(null);
    setUnitsSelection(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsMaskTimeReached(maskDisplayTime === 0);
    setVideoProgress((prev) => ({ ...prev, current: 0 }));
  };

  const handleVideoEnded = () => {
    setVideoStarted(false);
    setIsVideoPaused(false);
    setIsMaskTimeReached(maskDisplayTime === 0);
    setVideoProgress((prev) => ({ ...prev, current: prev.duration }));
  };

  const scrollToUploadSection = () => {
    if (!showCustomization) {
      setShowCustomization(true);
      setTimeout(() => {
        uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleColorButtonClick = () => {
    if (!customVideoSrc) return;
    colorInputRef.current?.click();
  };

  const handleMaskColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaskColor(event.target.value);
  };

  const handleMaskDisplayTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue) || nextValue < 0) {
      setMaskDisplayTime(0);
      return;
    }
    setMaskDisplayTime(nextValue);
  };

  const handleMaskSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseFloat(event.target.value);
    setMaskSize(Number.isNaN(nextValue) ? DEFAULT_MASK_SIZE : nextValue);
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
        description: `O arquivo precisa ter no máximo ${MAX_VIDEO_SIZE_MB} MB.`,
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
          {
            user_id: userId,
            video_data: base64Video,
            mask2_offset_x: maskPosition.x,
            mask2_offset_y: maskPosition.y,
            mask2_color: maskColor,
            mask2_size: maskSize,
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setVideoStarted(false);
      setCustomVideoSrc(base64Video);
      toast({
        title: 'Vídeo atualizado',
        description: 'Seu vídeo personalizado será usado imediatamente neste jogo.',
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

  const handleSaveMaskSettings = async () => {
    if (!userId) {
      toast({
        title: 'Sessão expirada',
        description: 'Entre novamente para salvar os ajustes.',
      });
      return;
    }
    if (!customVideoSrc) {
      toast({
        title: 'Vídeo base em uso',
        description: 'Faça upload de um vídeo personalizado antes de ajustar a máscara.',
      });
      return;
    }

    setIsSavingMask(true);
    try {
      const { error } = await supabase
        .from('user_videos')
        .update({
          mask2_offset_x: maskPosition.x,
          mask2_offset_y: maskPosition.y,
          mask2_color: maskColor,
          mask2_size: maskSize,
        })
        .eq('user_id', userId);
      if (error) throw error;
      toast({
        title: 'Máscara salva',
        description: 'Os próximos vídeos usarão essa configuração no Eu Já Sabia 2.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações da máscara:', error);
      toast({
        title: 'Não foi possível salvar',
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setIsSavingMask(false);
      setIsEditingMask(false);
      setIsDraggingMask(false);
    }
  };

  const currentVideoStatus = loadingVideo
    ? 'Carregando...'
    : customVideoSrc
      ? 'Usando o seu vídeo personalizado'
      : adminVideoData?.videoSrc
        ? 'Usando o vídeo do admin'
        : 'Vídeo base padrão em uso';

  const maskAssetBase = maskNumber ? `/numeros/${maskNumber}` : null;
  const maskImageValue = maskAssetBase ? `url(${maskAssetBase}.svg), url(${maskAssetBase}.png)` : 'none';
  const hasMaskContent = Boolean(maskNumber) || (isEditingMask && Boolean(customVideoSrc));
  const isVideoReadyForMask = !videoStarted || isEditingMask || isMaskTimeReached;
  const shouldShowMask = hasMaskContent && isVideoReadyForMask;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/20 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-secondary/20 blur-[100px]" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 pt-12">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-card/80 p-4 shadow-2xl shadow-primary/10 sm:p-6">
          <div
            ref={videoContainerRef}
            className="relative aspect-[9/16] w-full max-h-[80vh] rounded-2xl border border-primary/20 bg-black/80 shadow-xl"
          >
            <video
              ref={videoRef}
              key={activeVideoSrc}
              className="h-full w-full rounded-2xl object-contain bg-black"
              src={activeVideoSrc}
              playsInline
              controls={false}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />

            {isEditingMask && customVideoSrc && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center px-6 pt-5 text-center">
                <p className="text-[0.65rem] text-white/80">Arraste o formato para reposicionar a máscara.</p>
              </div>
            )}

            <div className="absolute inset-3 z-10 grid grid-cols-3 grid-rows-4 gap-3 text-white pointer-events-auto">
              {GRID_NUMBERS.map((value, index) => (
                <button
                  key={`${value}-${index}`}
                  type="button"
                  className="rounded-2xl border border-white/5 bg-transparent focus-visible:outline-none"
                  onClick={() => handleGridClick(value)}
                  aria-label={`Selecionar número ${value}`}
                >
                  <span className="sr-only">{value}</span>
                </button>
              ))}
            </div>

            {shouldShowMask && (
              <div
                className={`absolute inset-0 z-30 ${
                  isEditingMask && customVideoSrc ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                onPointerDown={handleMaskPointerDown}
              >
                <div
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 select-none ${
                    isEditingMask && customVideoSrc ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  style={{
                    left: `${maskPosition.x}%`,
                    top: `${maskPosition.y}%`,
                  }}
                >
                  <div
                    aria-label={maskNumber ? `Número ${maskNumber}` : 'Máscara em edição'}
                    className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                    style={{
                      backgroundColor: maskColor,
                      width: `${maskSize * 4}rem`,
                      height: `${maskSize * 4}rem`,
                      maskImage: maskImageValue,
                      WebkitMaskImage: maskImageValue,
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      borderRadius: maskImageSrc ? '0' : '8px',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[0.75rem] text-muted-foreground">
              <span>{formatTime(videoProgress.current)}</span>
              <span>{formatTime(videoProgress.duration)}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${
                    videoProgress.duration > 0
                      ? Math.min(100, (videoProgress.current / videoProgress.duration) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={handleStart} disabled={videoStarted}>
              Iniciar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handlePauseToggle} disabled={!videoStarted}>
              {isVideoPaused ? 'Reproduzir' : 'Pausar'}
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reiniciar
            </Button>
          </div>

          <Button variant="secondary" className="w-full" onClick={scrollToUploadSection}>
            Personalizar vídeo
          </Button>
        </div>

        {showCustomization && (
          <div
            ref={uploadSectionRef}
            className="space-y-4 rounded-3xl border border-primary/10 bg-card/80 p-6 shadow-2xl shadow-primary/15"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">
              Área de personalização
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Você pode manter apenas 1 vídeo personalizado compartilhado entre os jogos Eu Já Sabia e Eu Já Sabia 2.
                Ao enviar um novo arquivo, o anterior será substituído. Caso ainda não tenha feito upload, continuaremos
                usando o vídeo padrão localizado em
                <code className="text-xs text-primary"> /public/videos/eujasabia_base.mp4</code>. Formato obrigatório MP4
                e tamanho máximo de {MAX_VIDEO_SIZE_MB} MB ({MAX_VIDEO_SIZE_KB} KB).
              </p>
              <p>
                Gravação recomendada: celular em posição vertical (em pé), câmera frontal alinhada ao rosto e uma folha em
                branco na mesma altura. Vista-se de preto e salve em MP4.
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status atual: {currentVideoStatus}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-full border border-primary/40 px-6 py-2 text-sm font-semibold transition hover:bg-primary/10 ${
                  isUploading || !userId ? 'cursor-not-allowed opacity-50' : ''
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

              <input
                ref={colorInputRef}
                type="color"
                className="sr-only"
                value={maskColor}
                onChange={handleMaskColorChange}
              />
              <Button type="button" variant="outline" disabled={!customVideoSrc} onClick={handleColorButtonClick}>
                Cor da máscara
                <span
                  className="ml-2 inline-block h-4 w-4 rounded-full border border-white/30"
                  style={{ backgroundColor: maskColor }}
                />
              </Button>

              <label className="flex w-full flex-col gap-2 rounded-2xl border border-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-auto">
                <span>Tamanho da máscara</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <input
                    type="range"
                    min={MIN_MASK_SIZE}
                    max={MAX_MASK_SIZE}
                    step={MASK_SIZE_STEP}
                    value={maskSize}
                    onChange={handleMaskSizeChange}
                    disabled={!customVideoSrc}
                    className="h-1.5 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-bold text-primary">{(maskSize * 4).toFixed(2)} rem</span>
                </div>
              </label>

              <label className="flex w-full flex-col gap-2 rounded-2xl border border-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-auto">
                <span>Momento da máscara (segundos)</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={maskDisplayTime}
                  onChange={handleMaskDisplayTimeChange}
                  className="rounded-xl border border-primary/20 bg-background/60 px-3 py-2 text-sm text-foreground shadow-inner focus-visible:outline-none"
                />
              </label>

              <Button
                type="button"
                variant="outline"
                disabled={!customVideoSrc}
                onClick={() => setIsEditingMask((prev) => !prev)}
              >
                {isEditingMask ? 'Encerrar edição da máscara' : 'Editar posição da máscara'}
              </Button>
              <Button type="button" onClick={handleSaveMaskSettings} disabled={!customVideoSrc || isSavingMask}>
                {isSavingMask ? 'Salvando...' : 'Salvar máscara'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EuJaSabia2;
