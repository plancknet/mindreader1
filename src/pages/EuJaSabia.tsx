import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, DownloadCloud, Info, Play, Scan, Video } from 'lucide-react';

type SheetBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MetadataVersion = {
  digit: number;
  file: string;
  skipped?: boolean;
};

type EuJaSabiaMetadata = {
  sourceVideo: string;
  generatedAt: string;
  frame: {
    width: number;
    height: number;
  };
  sheetBounds: SheetBounds;
  versions: MetadataVersion[];
};

const DIGITS = Array.from({ length: 10 }, (_, index) => index);

const EuJaSabia = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [activeDigit, setActiveDigit] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<EuJaSabiaMetadata | null>(null);
  const [metadataStatus, setMetadataStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [isStarting, setIsStarting] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const { incrementUsage } = useUsageLimit();

  useEffect(() => {
    let isMounted = true;

    const loadMetadata = async () => {
      setMetadataStatus('loading');
      try {
        const response = await fetch('/videos/eu-ja-sabia/metadata.json', {
          cache: 'no-cache',
        });
        if (!response.ok) {
          throw new Error('Metadata not found');
        }
        const parsed = (await response.json()) as EuJaSabiaMetadata;
        if (!isMounted) return;
        setMetadata(parsed);
        setMetadataStatus('ready');
      } catch (error) {
        console.warn('Metadata unavailable for Eu ja sabia:', error);
        if (!isMounted) return;
        setMetadata(null);
        setMetadataStatus('missing');
      }
    };

    void loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  const instructionSteps = useMemo(
    () => t('euJaSabia.instructions.steps').split('||'),
    [t],
  );

  const aspectRatio =
    metadata?.frame?.height && metadata?.frame?.width
      ? metadata.frame.height / metadata.frame.width
      : 9 / 16;

  const overlayStyle = metadata
    ? {
        left: `${(metadata.sheetBounds.x / metadata.frame.width) * 100}%`,
        top: `${(metadata.sheetBounds.y / metadata.frame.height) * 100}%`,
        width: `${(metadata.sheetBounds.width / metadata.frame.width) * 100}%`,
        height: `${(metadata.sheetBounds.height / metadata.frame.height) * 100}%`,
      }
    : null;

  const activeVersion = metadata?.versions.find((version) => version.digit === activeDigit);
  const resolvedFile =
    activeVersion?.file ?? (activeDigit !== null ? `eu-ja-sabia-${activeDigit}.mp4` : null);
  const videoSrc = activeDigit !== null ? `/videos/eu-ja-sabia/${resolvedFile}` : null;

  const handleStart = () => {
    const trimmed = inputValue.trim();
    if (!trimmed.length) {
      setInputError(t('euJaSabia.input.errorEmpty'));
      return;
    }
    const parsedValue = Number(trimmed);
    if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 9) {
      setInputError(t('euJaSabia.input.errorRange'));
      return;
    }
    setInputError(null);
    setVideoError(null);
    setActiveDigit(parsedValue);
    setIsStarting(true);
    setVideoKey((key) => key + 1);
    setTimeout(() => setIsStarting(false), 250);

    void incrementUsage(GAME_IDS.EU_JA_SABIA).catch((error) => {
      console.warn('Failed to increment usage for Eu ja sabia:', error);
    });
  };

  useEffect(() => {
    if (!videoRef.current || videoSrc === null) return;
    const video = videoRef.current;
    video
      .play()
      .then(() => {
        setVideoError(null);
      })
      .catch(() => {
        // playback will start on user interaction, ignore error
      });
  }, [videoSrc]);

  const handleQuickSelect = (digit: number) => {
    setInputValue(String(digit));
    setInputError(null);
  };

  const metadataStatusVariant =
    metadataStatus === 'ready' ? 'default' : metadataStatus === 'loading' ? 'secondary' : 'destructive';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/10 px-4 py-6">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-8 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 right-12 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <HeaderControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 pt-16 pb-16">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-widest">
              {t('euJaSabia.badge')}
            </Badge>
            <Badge variant="outline" className="uppercase tracking-widest">
              {t('euJaSabia.digitalDouble')}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('euJaSabia.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('euJaSabia.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('euJaSabia.input.title')}</CardTitle>
                <CardDescription>{t('euJaSabia.input.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="eu-ja-sabia-number" className="text-sm font-medium">
                    {t('euJaSabia.input.label')}
                  </label>
                  <Input
                    id="eu-ja-sabia-number"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={9}
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value.replace(/[^0-9]/g, ''));
                      setInputError(null);
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">{t('euJaSabia.input.helper')}</p>
                  {inputError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {inputError}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-3">
                    {t('euJaSabia.quickPickLabel')}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {DIGITS.map((digit) => (
                      <Button
                        key={digit}
                        type="button"
                        variant={inputValue === String(digit) ? 'default' : 'outline'}
                        onClick={() => handleQuickSelect(digit)}
                        className="font-mono text-lg"
                      >
                        {digit}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" size="lg" onClick={handleStart} disabled={isStarting}>
                    <Play className="mr-2 h-4 w-4" />
                    {t('euJaSabia.buttons.start')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => navigate('/game-selector')}
                  >
                    {t('common.back')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  {t('euJaSabia.detection.title')}
                </CardTitle>
                <CardDescription>{t('euJaSabia.detection.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={metadataStatusVariant}>
                    {t(`euJaSabia.detection.status.${metadataStatus}`)}
                  </Badge>
                  {metadata?.generatedAt && (
                    <span className="text-xs text-muted-foreground">
                      {t('euJaSabia.detection.generatedAt', {
                        date: new Date(metadata.generatedAt).toLocaleString(),
                      })}
                    </span>
                  )}
                </div>

                {metadata && (
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">{t('euJaSabia.detection.frameSize')}</dt>
                      <dd className="font-semibold">
                        {metadata.frame.width} x {metadata.frame.height}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t('euJaSabia.detection.sheetArea')}</dt>
                      <dd className="font-semibold">
                        {metadata.sheetBounds.width} x {metadata.sheetBounds.height} (
                        {metadata.sheetBounds.x},{metadata.sheetBounds.y})
                      </dd>
                    </div>
                  </dl>
                )}

                {!metadata && metadataStatus === 'missing' && (
                  <Alert variant="destructive">
                    <AlertTitle>{t('euJaSabia.alerts.metadataMissingTitle')}</AlertTitle>
                    <AlertDescription>{t('euJaSabia.alerts.metadataMissingDescription')}</AlertDescription>
                  </Alert>
                )}

                <div className="rounded-xl border border-dashed border-muted-foreground/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <DownloadCloud className="h-4 w-4 text-primary" />
                    {t('euJaSabia.instructions.title')}
                  </div>
                  <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    {instructionSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t('euJaSabia.instructions.requirement')}
                  </p>
                  <Button asChild variant="link" className="px-0 mt-2 text-xs">
                    <a href="/videos/eu-ja-sabia/README.md" target="_blank" rel="noreferrer">
                      {t('euJaSabia.buttons.generatorGuide')}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                {t('euJaSabia.video.title')}
              </CardTitle>
              <CardDescription>{t('euJaSabia.video.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full overflow-hidden rounded-3xl border border-primary/10 bg-black/50 shadow-2xl">
                <div
                  className="w-full"
                  style={{
                    paddingTop: `${aspectRatio * 100}%`,
                  }}
                />
                {videoSrc ? (
                  <video
                    key={`${videoKey}-${resolvedFile}`}
                    ref={videoRef}
                    controls
                    playsInline
                    preload="auto"
                    className="absolute inset-0 h-full w-full rounded-3xl object-cover"
                    onError={() => {
                      setVideoError(
                        t('euJaSabia.alerts.videoErrorDescription', {
                          file: resolvedFile ?? 'unknown',
                        }),
                      );
                    }}
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-center text-white gap-2">
                    <Info className="h-6 w-6" />
                    <p className="text-lg font-semibold">{t('euJaSabia.video.placeholderTitle')}</p>
                    <p className="text-sm text-white/70 max-w-xs">
                      {t('euJaSabia.video.placeholderDescription')}
                    </p>
                  </div>
                )}

                {overlayStyle && (
                  <div
                    className="pointer-events-none absolute rounded-3xl border-2 border-primary/70 bg-primary/10 backdrop-blur-sm"
                    style={overlayStyle}
                  >
                    <span className="absolute -top-6 left-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      {t('euJaSabia.detection.overlayLabel')}
                    </span>
                  </div>
                )}
              </div>

              {activeDigit !== null && (
                <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t('euJaSabia.video.activeLabel', { digit: activeDigit })}
                  {resolvedFile && (
                    <span className="ml-auto text-xs text-muted-foreground">{resolvedFile}</span>
                  )}
                </div>
              )}

              {videoError && (
                <Alert variant="destructive">
                  <AlertTitle>{t('euJaSabia.alerts.videoErrorTitle')}</AlertTitle>
                  <AlertDescription>{videoError}</AlertDescription>
                </Alert>
              )}

              {metadata?.versions && (
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">
                    {t('euJaSabia.video.gridLabel')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                    {metadata.versions.map((version) => (
                      <div
                        key={version.digit}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-center',
                          version.skipped ? 'border-muted-foreground/30' : 'border-primary/40 bg-primary/5',
                        )}
                      >
                        <p className="text-xs font-semibold text-muted-foreground">
                          {t('euJaSabia.video.versionLabel', { digit: version.digit })}
                        </p>
                        <p className="text-xs truncate">{version.file}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EuJaSabia;
