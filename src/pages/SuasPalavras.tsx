import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Square } from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';
import { toast } from 'sonner';

const shuffleWords = (words: string[]) => {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getPositionFromPhrase = (phrase: string) => {
  const parts = phrase.trim().split(/\s+/);
  const lastWord = parts[parts.length - 1] || '';
  const lettersOnly = lastWord.replace(/[^A-Za-z\u00C0-\u024F]/g, '');
  return lettersOnly.length || 4;
};

const normalizeWord = (word: string) => word.trim().toLowerCase();

const SuasPalavras = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { incrementUsage } = useUsageLimit();

  const [stage, setStage] = useState<'greeting' | 'input' | 'playing' | 'revealed'>('greeting');
  const [mode, setMode] = useState<'camera' | 'phrase'>('camera');
  const [selectedPhrase, setSelectedPhrase] = useState('');
  const [secretPosition, setSecretPosition] = useState(0);

  const [words, setWords] = useState<string[]>(['', '', '', '', '']);
  const [sequence, setSequence] = useState<string[]>([]);
  const [secretRevealIndex, setSecretRevealIndex] = useState(0);

  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTriggeredCamera, setHasTriggeredCamera] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const getPhraseList = useCallback(() => {
    return t('mysteryWord.phrases')
      .split('||')
      .map((phrase) => phrase.trim())
      .filter(Boolean);
  }, [t]);

  const getRandomPhrase = useCallback(() => {
    const phrases = getPhraseList();
    if (phrases.length === 0) return;
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];
    setSelectedPhrase(phrase);
    setSecretPosition(getPositionFromPhrase(phrase));
  }, [getPhraseList]);

  useEffect(() => {
    if (stage === 'greeting') {
      getRandomPhrase();
    }
  }, [stage, getRandomPhrase]);

  const handleModeSelection = (selected: 'camera' | 'phrase') => {
    setMode(selected);
    setStage('input');
  };

  const handleWordChange = (index: number, value: string) => {
    setWords((prev) => prev.map((word, idx) => (idx === index ? value : word)));
  };

  const activateCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return;
    }
    if (cameraStreamRef.current) return;
    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
      console.error('Erro ao ativar câmera:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const buildSequence = () => {
    const trimmed = words.map((word) => word.trim());
    if (trimmed.some((word) => !word)) {
      toast.error('Preencha as cinco palavras antes de continuar.');
      return false;
    }
    const normalizedSecret = normalizeWord(trimmed[0]);
    const otherWords = trimmed.slice(1);
    if (otherWords.some((word) => normalizeWord(word) === normalizedSecret)) {
      toast.error('As palavras não podem ser repetidas.');
      return false;
    }

    if (mode === 'phrase') {
      const total = trimmed.length;
      const position = total ? ((secretPosition - 1) % total + total) % total : 0;
      const shuffledOthers = shuffleWords(otherWords);
      const ordered: string[] = [];
      let otherIndex = 0;
      for (let i = 0; i < total; i++) {
        if (i === position) {
          ordered.push(trimmed[0]);
        } else {
          ordered.push(shuffledOthers[otherIndex++] || '');
        }
      }
      setSequence(ordered);
      setSecretRevealIndex(position + 1);
    } else {
      const shuffled = shuffleWords(trimmed);
      setSequence(shuffled);
      const revealIndex =
        shuffled.findIndex((word) => normalizeWord(word) === normalizedSecret) + 1 || 1;
      setSecretRevealIndex(revealIndex);
    }
    return true;
  };

  const handleStart = () => {
    if (!buildSequence()) return;
    setStage('playing');
    setIsPlaying(true);
    setCurrentIndex(0);
    setCurrentWord('');
    setHasTriggeredCamera(false);
  };

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    stopCamera();
    setStage('revealed');
    void incrementUsage(GAME_IDS.MYSTERY_WORD).catch(console.error);
  }, [incrementUsage, stopCamera]);

  useEffect(() => {
    if (!isPlaying || sequence.length === 0) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const length = sequence.length;
        if (length === 0) {
          handleStop();
          return 0;
        }
        const nextIndex = (prev % length) + 1;
        const word = sequence[nextIndex - 1];
        setCurrentWord(word.toUpperCase());
        if (mode === 'camera') {
          if (!hasTriggeredCamera && nextIndex === secretRevealIndex) {
            setHasTriggeredCamera(true);
            void activateCamera();
          } else if (hasTriggeredCamera && nextIndex !== secretRevealIndex) {
            stopCamera();
          }
        }
        return nextIndex;
      });
    }, 3000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, sequence, secretRevealIndex, mode, activateCamera, stopCamera, handleStop, hasTriggeredCamera]);

  const handleReset = () => {
    setStage('greeting');
    setWords(['', '', '', '', '']);
    setSequence([]);
    setCurrentWord('');
    setCurrentIndex(0);
    setIsPlaying(false);
    setHasTriggeredCamera(false);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <HeaderControls />

        {stage === 'greeting' && (
          <div className="text-center space-y-8">
            <Brain className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <Card className="p-6 space-y-6">
              <p className="text-2xl font-semibold text-primary">{selectedPhrase}</p>
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative rounded-xl bg-primary shadow-lg overflow-hidden">
                  <div className="flex">
                    <button
                      className="flex-1 h-16 opacity-0"
                      aria-label="Revelar com câmera"
                      onClick={() => handleModeSelection('camera')}
                    />
                    <button
                      className="flex-1 h-16 opacity-0"
                      aria-label="Revelar pela frase"
                      onClick={() => handleModeSelection('phrase')}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-4 text-primary-foreground font-semibold text-lg">
                    <span>Revelar a Palavra</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {stage === 'input' && (
          <Card className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Digite suas 5 palavras</h2>
            <div className="grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Palavra Misteriosa</p>
                <Input
                  value={words[0]}
                  onChange={(e) => handleWordChange(0, e.target.value)}
                  placeholder="Palavra principal"
                  className="py-6 text-lg text-center"
                />
              </div>
              {words.slice(1).map((word, idx) => (
                <Input
                  key={idx + 1}
                  value={word}
                  onChange={(e) => handleWordChange(idx + 1, e.target.value)}
                  placeholder={`Outra palavra ${idx + 1}`}
                  className="py-4 text-center"
                />
              ))}
            </div>
            <Button size="lg" onClick={handleStart} className="w-full text-lg py-6">
              Começar
            </Button>
          </Card>
        )}

        {stage === 'playing' && (
          <div className="text-center space-y-6">
            <Brain className="w-16 h-16 text-primary animate-pulse mx-auto" />
            <Card className="p-10 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-6xl font-bold tracking-wide text-primary">{currentWord || '...'}</div>
            </Card>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="text-lg px-8 py-6 gap-2"
            >
              <Square className="w-5 h-5" />
              Parar
            </Button>
          </div>
        )}

        {stage === 'revealed' && (
          <div className="text-center space-y-6">
            <Brain className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <h2 className="text-3xl font-bold">Palavra Revelada</h2>
            <Card className="p-10 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-6xl font-extrabold tracking-wide text-primary">
                E ai, acertou?
              </div>
            </Card>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => navigate('/game-selector')}>
                Voltar ao menu
              </Button>
              <Button size="lg" onClick={handleReset}>
                Usar novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuasPalavras;
