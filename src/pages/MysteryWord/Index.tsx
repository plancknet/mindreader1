import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, ArrowLeft, Square } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';

const WORD_LISTS: Record<string, string[]> = {
  'pt-BR': ['casa', 'amor', 'vida', 'tempo', 'agua', 'terra', 'fogo', 'luz', 'paz', 'sonho', 'alma', 'sol', 'lua', 'mar', 'ceu', 'flor', 'arvore', 'chuva', 'vento', 'noite'],
  'en': ['house', 'love', 'life', 'time', 'water', 'earth', 'fire', 'light', 'peace', 'dream', 'soul', 'sun', 'moon', 'sea', 'sky', 'flower', 'tree', 'rain', 'wind', 'night'],
  'es': ['casa', 'amor', 'vida', 'tiempo', 'agua', 'tierra', 'fuego', 'luz', 'paz', 'sueno', 'alma', 'sol', 'luna', 'mar', 'cielo', 'flor', 'arbol', 'lluvia', 'viento', 'noche'],
  'zh-CN': ['房子', '爱', '生活', '时间', '水', '地球', '火', '光', '和平', '梦', '灵魂', '太阳', '月亮', '海洋', '天空', '花', '树', '雨', '风', '夜晚'],
  'fr': ['maison', 'amour', 'vie', 'temps', 'eau', 'terre', 'feu', 'lumiere', 'paix', 'reve', 'ame', 'soleil', 'lune', 'mer', 'ciel', 'fleur', 'arbre', 'pluie', 'vent', 'nuit'],
  'it': ['casa', 'amore', 'vita', 'tempo', 'acqua', 'terra', 'fuoco', 'luce', 'pace', 'sogno', 'anima', 'sole', 'luna', 'mare', 'cielo', 'fiore', 'albero', 'pioggia', 'vento', 'notte']
};

const shuffleWords = (words: string[]): string[] => {
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
  const count = lettersOnly.length;
  return count || 4; // fallback to 4 if unreadable
};

const getRandomRevealPosition = () => Math.floor(Math.random() * 8) + 3; // 3..10

const MysteryWord = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { incrementUsage } = useUsageLimit();
  const [stage, setStage] = useState<'greeting' | 'customWords' | 'input' | 'playing' | 'stopped'>('greeting');
  const [selectedPhrase, setSelectedPhrase] = useState('');
  const [secretPosition, setSecretPosition] = useState(0);
  const [secretWord, setSecretWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [customWordsMode, setCustomWordsMode] = useState(false);
  const [customWords, setCustomWords] = useState<string[]>(Array(10).fill(''));
  const [clickedArea, setClickedArea] = useState<'left' | 'center' | 'right' | null>(null);
  const wordPoolRef = useRef<string[]>([]);
  const wordSequenceRef = useRef<string[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const refreshWordPool = useCallback(() => {
    const baseWords = customWordsMode
      ? customWords.filter(Boolean)
      : WORD_LISTS[language] || WORD_LISTS['en'];
    const sanitizedSecret = secretWord.trim().toLowerCase();
    const filteredWords = sanitizedSecret
      ? baseWords.filter(word => word.toLowerCase() !== sanitizedSecret)
      : [...baseWords];
    wordPoolRef.current = shuffleWords(filteredWords);
  }, [language, secretWord, customWordsMode, customWords]);

  const getNextUniqueWord = useCallback(() => {
    if (wordPoolRef.current.length === 0) {
      refreshWordPool();
    }
    return wordPoolRef.current.shift() || '';
  }, [refreshWordPool]);

  const stopCameraIndicator = useCallback(() => {
    if (cameraTimeoutRef.current) {
      clearTimeout(cameraTimeoutRef.current);
      cameraTimeoutRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const triggerCameraIndicator = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch {
      return;
    }
    if (cameraTimeoutRef.current) {
      clearTimeout(cameraTimeoutRef.current);
    }
    cameraTimeoutRef.current = setTimeout(() => {
      stopCameraIndicator();
    }, 3000);
  }, [stopCameraIndicator]);

  useEffect(() => {
    return () => stopCameraIndicator();
  }, [stopCameraIndicator]);

  const handleContinueToInput = (area: 'left' | 'center' | 'right') => {
    setClickedArea(area);
    if (area === 'right') {
      setCustomWordsMode(true);
      setStage('customWords');
      return;
    }
    setCustomWordsMode(false);
    setStage('input');
  };

  const handleCustomWordChange = (index: number, value: string) => {
    setCustomWords((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmitCustomWords = () => {
    const allFilled = customWords.every(word => word.trim());
    if (!allFilled) return;
    setCustomWords((prev) => prev.map(word => word.trim()));
    setStage('input');
  };

  const handleStartPlaying = () => {
    if (!secretWord.trim()) return;
    if (customWordsMode && !customWords.every(word => word.trim())) return;

    const position =
      clickedArea === 'left'
        ? getRandomRevealPosition()
        : getPositionFromPhrase(selectedPhrase);

    setSecretPosition(position);

    refreshWordPool();

    const sequence: string[] = [];
    const totalWords = Math.max(15, position + 2);

    for (let i = 0; i < totalWords; i++) {
      if (i + 1 === position) {
        sequence.push(secretWord.trim());
      } else {
        sequence.push(getNextUniqueWord());
      }
    }

    wordSequenceRef.current = sequence;
    setCurrentWord('');
    setStage('playing');
    setIsPlaying(true);
    setWordCount(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setStage('stopped');
    stopCameraIndicator();
    incrementUsage(GAME_IDS.MYSTERY_WORD).catch(console.error);
  };

  const handlePlayAgain = () => {
    setStage('greeting');
    setSecretWord('');
    setCurrentWord('');
    setWordCount(0);
    setIsPlaying(false);
    setIsPressed(false);
    setCustomWordsMode(false);
    setCustomWords(Array(10).fill(''));
    setClickedArea(null);
    stopCameraIndicator();
    wordPoolRef.current = [];
    wordSequenceRef.current = [];
    getRandomPhrase();
  };

  useEffect(() => {
    if (stage === 'greeting') {
      getRandomPhrase();
    }
  }, [stage, getRandomPhrase]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWordCount(prev => {
          const nextCount = prev + 1;
          const word = wordSequenceRef.current[nextCount - 1] || '';
          setCurrentWord(word);
          if (clickedArea === 'left' && nextCount === secretPosition) {
            void triggerCameraIndicator();
          }
          return nextCount;
        });
      }, 3000);

      return () => {
        clearInterval(interval);
        stopCameraIndicator();
      };
    }
  }, [isPlaying, secretPosition, clickedArea, triggerCameraIndicator, stopCameraIndicator]);

  const isCustomWordListValid = customWords.every(word => word.trim());

  const startButtonBase =
    'relative w-full max-w-xl mx-auto h-16 overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-xl transition-all duration-200';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-selector')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <div className="flex gap-2">
            <LanguageSelector />
            <LogoutButton />
          </div>
        </div>

        {stage === 'greeting' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('mysteryWord.title')}
            </h1>
            <Card className="p-8">
              <div className="space-y-6">
                <p className="text-2xl font-bold text-primary">{selectedPhrase}</p>

                <div
                  className={`${startButtonBase} ${isPressed ? 'scale-[0.98]' : 'scale-100'} group`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-lg font-semibold tracking-wide">
                    <Brain className="mr-2 h-6 w-6" />
                    {t('mysteryWord.startButton')}
                  </div>

                  <div className="absolute inset-0 flex">
                    {(['left', 'center', 'right'] as const).map((area, index) => (
                      <button
                        key={area}
                        className="flex-1"
                        onPointerDown={() => setIsPressed(true)}
                        onPointerUp={() => setIsPressed(false)}
                        onPointerLeave={() => setIsPressed(false)}
                        onPointerCancel={() => setIsPressed(false)}
                        onClick={() => handleContinueToInput(area)}
                        aria-label={`start-${area}-${index}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {stage === 'customWords' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Digite 10 palavras aleatórias
            </h2>
            <Card className="p-8">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Vamos usar as palavras que você digitar para a apresentação.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customWords.map((word, index) => (
                    <Input
                      key={index}
                      type="text"
                      value={word}
                      onChange={(e) => handleCustomWordChange(index, e.target.value)}
                      placeholder={`Palavra ${index + 1}`}
                      className="text-center"
                    />
                  ))}
                </div>
                <Button
                  size="lg"
                  onClick={handleSubmitCustomWords}
                  disabled={!isCustomWordListValid}
                  className="text-xl px-8 py-6"
                >
                  Continuar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {stage === 'input' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('mysteryWord.inputTitle')}
            </h2>
            <Card className="p-8">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  {t('mysteryWord.inputDescription')}
                </p>
                <Input
                  type="text"
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  placeholder={t('mysteryWord.inputPlaceholder')}
                  className="text-center text-2xl py-6"
                  autoFocus
                />
                {customWordsMode && (
                  <p className="text-sm text-primary font-medium">
                    Usaremos as 10 palavras que você digitou.
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={handleStartPlaying}
                  disabled={!secretWord.trim() || (customWordsMode && !isCustomWordListValid)}
                  className="text-xl px-8 py-6"
                >
                  {t('mysteryWord.startPresentation')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {stage === 'playing' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              ...
            </h2>
            <Card className="p-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse">
                {currentWord ? currentWord.toUpperCase() : '...'}
              </div>
            </Card>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="text-xl px-8 py-6 gap-2"
            >
              <Square className="w-6 h-6" />
              {t('mysteryWord.stopButton')}
            </Button>
          </div>
        )}

        {stage === 'stopped' && (
          <div className="text-center space-y-8">
            <Brain className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('mysteryWord.stoppedTitle')}
            </h2>
            <Card className="p-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <p className="text-2xl mb-4 text-muted-foreground">
                {t('mysteryWord.stoppedSubtitle')}
              </p>
              <div className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ...
              </div>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/game-selector')}
                className="text-xl px-8 py-6"
              >
                {t('mysteryWord.menuButton')}
              </Button>
              <Button
                size="lg"
                onClick={handlePlayAgain}
                className="text-xl px-8 py-6"
              >
                <Brain className="mr-2 h-6 w-6" />
                {t('mysteryWord.playAgain')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MysteryWord;
