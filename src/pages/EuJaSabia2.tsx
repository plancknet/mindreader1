import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0];
const MAX_VIDEO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_KB = MAX_VIDEO_SIZE_BYTES / 1024;
const ACCEPTED_VIDEO_TYPE = 'video/mp4';
const DEFAULT_MASK_POSITION = { x: 48, y: 62 };
const DEFAULT_MASK_COLOR = '#000000';
const DEFAULT_MASK_FONT_SIZE = 1.2;
const DEFAULT_MASK_DISPLAY_TIME = 0;
const MIN_MASK_FONT_SIZE = 0.8;
const MAX_MASK_FONT_SIZE = 2;
const MASK_FONT_SIZE_STEP = 0.05;

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
  const [maskText, setMaskText] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [maskPosition, setMaskPosition] = useState(DEFAULT_MASK_POSITION);
  const [maskColor, setMaskColor] = useState(DEFAULT_MASK_COLOR);
  const [maskFontSize, setMaskFontSize] = useState(DEFAULT_MASK_FONT_SIZE);
  const [maskDisplayTime, setMaskDisplayTime] = useState(DEFAULT_MASK_DISPLAY_TIME);
  const [isEditingMask, setIsEditingMask] = useState(false);
  const [isSavingMask, setIsSavingMask] = useState(false);
  const [isDraggingMask, setIsDraggingMask] = useState(false);
  const [adminVideoData, setAdminVideoData] = useState<{
    videoSrc: string | null;
    maskPosition: { x: number; y: number };
    maskColor: string;
    maskFontSize: number;
  } | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  const activeVideoSrc = customVideoSrc ?? adminVideoData?.videoSrc ?? '/videos/eujasabia_base.mp4';

  useEffect(() => {
    const storedMaskTime = localStorage.getItem('euJaSabia2_maskTime');
    if (storedMaskTime) {
      const parsed = Number(storedMaskTime);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setMaskDisplayTime(parsed);
        setIsMaskTimeReached(parsed === 0);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('euJaSabia2_maskTime', String(maskDisplayTime));
    if (!videoStarted) {
      setIsMaskTimeReached(maskDisplayTime === 0);
    } else if (videoRef.current) {
      setIsMaskTimeReached(videoRef.current.currentTime >= maskDisplayTime);
    }
  }, [maskDisplayTime, videoStarted]);

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
      setMaskPosition(DEFAULT_MASK_POSITION);
      setMaskColor(DEFAULT_MASK_COLOR);
      setMaskFontSize(DEFAULT_MASK_FONT_SIZE);
      setMaskDisplayTime(DEFAULT_MASK_DISPLAY_TIME);
      return;
    }

    let isMounted = true;
    const loadVideo = async () => {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from('user_videos')
        .select('video_data, mask_offset_x, mask_offset_y, mask_color, mask_font_size')
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

      if (data?.mask_offset_x != null && data?.mask_offset_y != null) {
        setMaskPosition({
          x: data.mask_offset_x,
          y: data.mask_offset_y,
        });
      } else {
        setMaskPosition(DEFAULT_MASK_POSITION);
      }

      if (data?.mask_color) {
        setMaskColor(data.mask_color);
      } else {
        setMaskColor(DEFAULT_MASK_COLOR);
      }

      if (typeof data?.mask_font_size === 'number') {
        setMaskFontSize(data.mask_font_size);
      } else {
        setMaskFontSize(DEFAULT_MASK_FONT_SIZE);
      }

      setCustomVideoSrc(data?.video_data ?? null);
      setLoadingVideo(false);
    };

    loadVideo();
    return () => {
      isMounted = false;
    };
  }, [userId, toast]);

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
          .select('video_data, mask_offset_x, mask_offset_y, mask_color, mask_font_size')
          .eq('user_id', adminRole.user_id)
          .maybeSingle();
        if (!isMounted) return;
        if (videoError || !data?.video_data) {
          setAdminVideoData(null);
          return;
        }
        setAdminVideoData({
          videoSrc: data.video_data,
          maskPosition: {
            x: data.mask_offset_x ?? DEFAULT_MASK_POSITION.x,
            y: data.mask_offset_y ?? DEFAULT_MASK_POSITION.y,
          },
          maskColor: data.mask_color ?? DEFAULT_MASK_COLOR,
          maskFontSize: typeof data.mask_font_size === 'number' ? data.mask_font_size : DEFAULT_MASK_FONT_SIZE,
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
    if (!isEditingMask) return;
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
      setMaskText(null);
      return;
    }
    if (unitsSelection === null) {
      setUnitsSelection(value);
      const nextNumber = tensSelection * 10 + value;
      setMaskText(nextNumber.toString().padStart(2, '0'));
      return;
    }
    setTensSelection(value);
    setUnitsSelection(null);
    setMaskText(null);
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
        .then(() => {
          setIsVideoPaused(false);
        })
        .catch(() => {
          toast({
            title: 'N�o foi poss�vel reproduzir o v�deo',
            description: 'Tente tocar novamente no bot�o Reproduzir.',
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
    setMaskText(null);
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
        description: 'O arquivo precisa ter no máximo 20 MB.',
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
            mask_offset_x: maskPosition.x,
            mask_offset_y: maskPosition.y,
            mask_color: maskColor,
            mask_font_size: maskFontSize,
          },
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

  useEffect(() => {
    if (!customVideoSrc) {
      if (adminVideoData) {
        setMaskPosition(adminVideoData.maskPosition);
        setMaskColor(adminVideoData.maskColor);
        setMaskFontSize(adminVideoData.maskFontSize);
      } else {
        setMaskPosition(DEFAULT_MASK_POSITION);
        setMaskColor(DEFAULT_MASK_COLOR);
        setMaskFontSize(DEFAULT_MASK_FONT_SIZE);
      }
    }
  }, [customVideoSrc, adminVideoData]);

  const currentVideoStatus = loadingVideo
    ? 'Carregando...'
    : customVideoSrc
      ? 'Usando o seu vídeo personalizado'
      : adminVideoData?.videoSrc
        ? 'Usando o vídeo e máscara do admin'
        : 'Vídeo base padrão em uso';
  const [isMaskTimeReached, setIsMaskTimeReached] = useState(maskDisplayTime === 0);
  const [videoProgress, setVideoProgress] = useState({ current: 0, duration: 0 });
  const maskDisplayText = maskText ?? '--';
  const maskImageSrc = maskText ? `/numeros/${maskText}.svg` : null;
  const hasMaskContent = Boolean(maskText) || (isEditingMask && Boolean(customVideoSrc));
  const isVideoReadyForMask = !videoStarted || isEditingMask || isMaskTimeReached;
  const shouldShowMask = hasMaskContent && isVideoReadyForMask;

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

  const handleMaskFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseFloat(event.target.value);
    setMaskFontSize(Number.isNaN(nextValue) ? DEFAULT_MASK_FONT_SIZE : nextValue);
  };

  const handleSaveMaskPosition = async () => {
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
          mask_offset_x: maskPosition.x,
          mask_offset_y: maskPosition.y,
          mask_color: maskColor,
          mask_font_size: maskFontSize,
        })
        .eq('user_id', userId);
      if (error) throw error;
      toast({
        title: 'Posição salva',
        description: 'Os próximos vídeos usarão essa posição da máscara.',
      });
    } catch (error) {
      console.error('Erro ao salvar posição da máscara:', error);
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

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              </p>
              {isEditingMask && customVideoSrc && (
                <p className="mt-2 text-[0.65rem] text-white/70">Arraste o texto para reposicionar a máscara</p>
              )}
            </div>

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
                className={`absolute inset-0 z-30 ${isEditingMask ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onPointerDown={handleMaskPointerDown}
              >
                <div
                  className={`absolute flex max-w-[70%] -translate-x-1/2 -translate-y-1/2 select-none text-center ${
                    isEditingMask ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  style={{
                    left: `${maskPosition.x}%`,
                    top: `${maskPosition.y}%`,
                  }}
                >
                  {maskImageSrc ? (
                    <div
                      aria-label={`Número ${maskDisplayText}`}
                      className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                      style={{
                        backgroundColor: maskColor,
                        width: `${maskFontSize * 4}rem`,
                        height: `${maskFontSize * 4}rem`,
                        maskImage: `url(${maskImageSrc})`,
                        WebkitMaskImage: `url(${maskImageSrc})`,
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-xl bg-transparent px-3 py-2"
                      style={{ fontFamily: '"Indie Flower", "Brush Script MT", cursive', color: maskColor }}
                    >
                      <p className="h-2" aria-hidden="true" />
                      <p className="text-[0.72rem] font-semibold leading-tight">Eu já sabia:</p>
                      <p
                        className="font-black leading-tight tracking-widest whitespace-pre-line"
                        style={{ fontSize: `${maskFontSize}rem` }}
                      >
                        {maskDisplayText}
                      </p>
                    </div>
                  )}
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
                width: `${videoProgress.duration > 0 ? Math.min(100, (videoProgress.current / videoProgress.duration) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={handleStart} disabled={videoStarted}>
              Iniciar
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePauseToggle}
              disabled={!videoStarted}
            >
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
            <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">Área de personalização</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Você pode manter apenas 1 vídeo personalizado. Ao enviar um novo arquivo, o anterior será substituído.
                Caso ainda não tenha feito upload, continuaremos usando o vídeo padrão localizado em
                <code className="text-xs text-primary"> /public/videos/eujasabia_base.mp4</code>.{' '}
                Formato obrigatório MP4 e tamanho máximo de {MAX_VIDEO_SIZE_MB} MB ({MAX_VIDEO_SIZE_KB} KB).
              </p>
              <p>
                Gravação recomendada: celular em posição vertical (em pé), usando a câmera frontal na altura de XX&nbsp;cm e
                uma folha em branco na mesma altura, posicionada a YY&nbsp;cm. Vista-se de preto e salve em MP4.
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status atual: {currentVideoStatus}
              </p>
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
              <input
                ref={colorInputRef}
                type="color"
                className="sr-only"
                value={maskColor}
                onChange={handleMaskColorChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleColorButtonClick}
              >
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
                    min={MIN_MASK_FONT_SIZE}
                    max={MAX_MASK_FONT_SIZE}
                    step={MASK_FONT_SIZE_STEP}
                    value={maskFontSize}
                    onChange={handleMaskFontSizeChange}
                    className="h-1.5 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-bold text-primary">{(maskFontSize * 4).toFixed(1)} rem</span>
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
                  className="rounded-xl border border-primary/20 bg-background/60 px-3 py-2 text-sm text-foreground shadow-inner focus-visible:outline-none disabled:opacity-60"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingMask((prev) => !prev)}
              >
                {isEditingMask ? 'Encerrar edição da máscara' : 'Editar Posição da Máscara'}
              </Button>
              <Button
                type="button"
                onClick={handleSaveMaskPosition}
                disabled={!customVideoSrc || isSavingMask}
              >
                {isSavingMask ? 'Salvando...' : 'Salvar Máscara'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EuJaSabia2;
