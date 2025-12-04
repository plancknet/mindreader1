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
const MIN_MASK_SIZE = 0.5;
const MAX_MASK_SIZE = 3;
const MASK_SIZE_STEP = 0.1;

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

  // Mask settings for game 2 (stored in mask2_* columns)
  const [maskPosition, setMaskPosition] = useState(DEFAULT_MASK_POSITION);
  const [maskColor, setMaskColor] = useState(DEFAULT_MASK_COLOR);
  const [maskSize, setMaskSize] = useState(DEFAULT_MASK_SIZE);
  const [maskDisplayTime, setMaskDisplayTime] = useState(DEFAULT_MASK_DISPLAY_TIME);

  const videoSrc = '/videos/eujasabia_base.mp4';

  // Load mask display time from localStorage
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

  // Save mask display time to localStorage
  useEffect(() => {
    localStorage.setItem('euJaSabia2_maskTime', String(maskDisplayTime));
    if (!videoStarted) {
      setIsMaskTimeReached(maskDisplayTime === 0);
    } else if (videoRef.current) {
      setIsMaskTimeReached(videoRef.current.currentTime >= maskDisplayTime);
    }
  }, [maskDisplayTime, videoStarted]);

  // Load user ID
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.user) {
        console.error('Erro ao buscar usuário para Eu Já Sabia 2:', error);
        return;
      }
      setUserId(data.user.id);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load mask settings from database (using mask2_* columns)
  useEffect(() => {
    if (!userId) {
      setMaskPosition(DEFAULT_MASK_POSITION);
      setMaskColor(DEFAULT_MASK_COLOR);
      setMaskSize(DEFAULT_MASK_SIZE);
      return;
    }

    let isMounted = true;
    const loadMaskSettings = async () => {
      const { data, error } = await supabase
        .from('user_videos')
        .select('mask2_offset_x, mask2_offset_y, mask2_color, mask2_size')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMounted) return;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações da máscara:', error);
      }

      if (data?.mask2_offset_x != null && data?.mask2_offset_y != null) {
        setMaskPosition({
          x: Number(data.mask2_offset_x),
          y: Number(data.mask2_offset_y),
        });
      } else {
        setMaskPosition(DEFAULT_MASK_POSITION);
      }

      if (data?.mask2_color) {
        setMaskColor(data.mask2_color);
      } else {
        setMaskColor(DEFAULT_MASK_COLOR);
      }

      if (typeof data?.mask2_size === 'number') {
        setMaskSize(data.mask2_size);
      } else {
        setMaskSize(DEFAULT_MASK_SIZE);
      }
    };

    loadMaskSettings();
    return () => {
      isMounted = false;
    };
  }, [userId]);

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
        .then(() => {
          setIsVideoPaused(false);
        })
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

  const handleSaveMaskSettings = async () => {
    if (!userId) {
      toast({
        title: 'Sessão expirada',
        description: 'Entre novamente para salvar os ajustes.',
      });
      return;
    }

    setIsSavingMask(true);
    try {
      // Check if user has a record
      const { data: existingRecord } = await supabase
        .from('user_videos')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
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
      } else {
        // Insert new record with placeholder video_data
        const { error } = await supabase
          .from('user_videos')
          .insert({
            user_id: userId,
            video_data: '',
            mask2_offset_x: maskPosition.x,
            mask2_offset_y: maskPosition.y,
            mask2_color: maskColor,
            mask2_size: maskSize,
          });
        if (error) throw error;
      }

      toast({
        title: 'Configurações salvas',
        description: 'As configurações da máscara foram salvas com sucesso.',
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

  const maskImageSrc = maskNumber ? `/numeros/${maskNumber}.png` : null;
  const hasMaskContent = Boolean(maskNumber) || isEditingMask;
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
              key={videoSrc}
              className="h-full w-full rounded-2xl object-contain bg-black"
              src={videoSrc}
              playsInline
              controls={false}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              {isEditingMask && (
                <p className="mt-2 text-[0.65rem] text-white/70">Arraste para reposicionar a máscara</p>
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
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 select-none ${
                    isEditingMask ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  style={{
                    left: `${maskPosition.x}%`,
                    top: `${maskPosition.y}%`,
                  }}
                >
                  <div
                    aria-label={maskNumber ? `Número ${maskNumber}` : 'Máscara de edição'}
                    className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                    style={{
                      backgroundColor: maskColor,
                      width: `${maskSize * 4}rem`,
                      height: `${maskSize * 4}rem`,
                      maskImage: maskImageSrc ? `url(${maskImageSrc})` : 'none',
                      WebkitMaskImage: maskImageSrc ? `url(${maskImageSrc})` : 'none',
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
            <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">Configurações da máscara SVG</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Ajuste a posição, cor e tamanho da máscara SVG que exibe o número selecionado.
                As configurações serão salvas separadamente das configurações do jogo "Eu já sabia".
              </p>
              <p>
                O mesmo vídeo utilizado no jogo "Eu já sabia" também será usado aqui. Caso deseje alterar,
                envie um novo arquivo MP4 abaixo para atualizar o vídeo compartilhado.
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
                    min={MIN_MASK_SIZE}
                    max={MAX_MASK_SIZE}
                    step={MASK_SIZE_STEP}
                    value={maskSize}
                    onChange={handleMaskSizeChange}
                    className="h-1.5 flex-1 cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-bold text-primary">{(maskSize * 4).toFixed(1)} rem</span>
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
                onClick={() => setIsEditingMask((prev) => !prev)}
              >
                {isEditingMask ? 'Encerrar edição da máscara' : 'Editar Posição da Máscara'}
              </Button>
              <Button
                type="button"
                onClick={handleSaveMaskSettings}
                disabled={isSavingMask}
              >
                {isSavingMask ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EuJaSabia2;
