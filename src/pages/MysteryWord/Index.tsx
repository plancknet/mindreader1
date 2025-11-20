import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Square } from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';
import { toast } from 'sonner';

const WORD_LISTS: Record<string, string[]> = {
  'pt-BR': ['casa', 'amor', 'vida', 'tempo', 'água', 'terra', 'fogo', 'luz', 'paz', 'sonho', 'alma', 'sol', 'lua', 'mar', 'céu', 'flor', 'árvore', 'chuva', 'vento', 'noite'],
  'en': ['house', 'love', 'life', 'time', 'water', 'earth', 'fire', 'light', 'peace', 'dream', 'soul', 'sun', 'moon', 'sea', 'sky', 'flower', 'tree', 'rain', 'wind', 'night'],
  'es': ['casa', 'amor', 'vida', 'tiempo', 'agua', 'tierra', 'fuego', 'luz', 'paz', 'sueño', 'alma', 'sol', 'luna', 'mar', 'cielo', 'flor', 'árbol', 'lluvia', 'viento', 'noche'],
  'zh-CN': ['房子', '爱', '生活', '时间', '水', '地球', '火', '光', '和平', '梦', '灵魂', '太阳', '月亮', '海', '天空', '花', '树', '雨', '风', '夜'],
  'fr': ['maison', 'amour', 'vie', 'temps', 'eau', 'terre', 'feu', 'lumière', 'paix', 'rêve', 'âme', 'soleil', 'lune', 'mer', 'ciel', 'fleur', 'arbre', 'pluie', 'vent', 'nuit'],
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
  return lettersOnly.length || 4;
};

const normalizeWord = (value: string) => value.trim().toLowerCase();

const MysteryWord = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { incrementUsage } = useUsageLimit();
  const [stage, setStage] = useState<'greeting' | 'input' | 'custom-input' | 'playing' | 'stopped'>('greeting');
  const [gameMode, setGameMode] = useState<'normal' | 'random-camera' | 'custom-words'>('normal');
  const [selectedPhrase, setSelectedPhrase] = useState('');
  const [secretPosition, setSecretPosition] = useState(0);
  const [secretWord, setSecretWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [currentCustomInput, setCurrentCustomInput] = useState('');
  const wordPoolRef = useRef<string[]>([]);
  const customSequenceRef = useRef<string[]>([]);
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

  const refreshWordPool = useCallback(() => {
    const words = WORD_LISTS[language] || WORD_LISTS['en'];
    const sanitizedSecret = secretWord.trim().toLowerCase();
    const filteredWords = sanitizedSecret
      ? words.filter(word => word.toLowerCase() !== sanitizedSecret)
      : [...words];
    wordPoolRef.current = shuffleWords(filteredWords);
  }, [language, secretWord]);

  const getNextUniqueWord = useCallback(() => {
    if (wordPoolRef.current.length === 0) {
      refreshWordPool();
    }
    return wordPoolRef.current.shift() || '';
  }, [refreshWordPool]);


  const handleContinueToInput = (mode: 'normal' | 'random-camera' | 'custom-words') => {
    setGameMode(mode);
    
    if (mode === 'random-camera') {
      // Posição aleatória entre 3 e 10
      setSecretPosition(Math.floor(Math.random() * 8) + 3);
      setStage('input');
    } else if (mode === 'custom-words') {
      setStage('custom-input');
      setCustomWords([]);
    } else {
      setStage('input');
    }
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
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const handleAddCustomWord = () => {
    const word = currentCustomInput.trim();
    if (!word) return;
    
    if (customWords.length >= 10) {
      toast.error('Você já adicionou 10 palavras');
      return;
    }
    const normalized = normalizeWord(word);
    const alreadyExists = customWords.some(existing => normalizeWord(existing) === normalized);
    if (alreadyExists) {
      toast.error('Palavra repetida não permitida');
      return;
    }
    
    setCustomWords([...customWords, word]);
    setCurrentCustomInput('');
    
    if (customWords.length === 9) {
      // Última palavra
      toast.success('10 palavras adicionadas! Agora digite a palavra secreta.');
      setTimeout(() => setStage('input'), 500);
    }
  };

  const handleStartPlaying = () => {
    const sanitizedSecret = secretWord.trim();
    if (!sanitizedSecret) return;

    if (gameMode === 'custom-words') {
      if (customWords.length < 10) {
        toast.error('Adicione 10 palavras antes de continuar');
        return;
      }

      const normalizedSecret = normalizeWord(sanitizedSecret);
      const normalizedList = customWords.map(word => word.trim());
      const hasSecret = normalizedList.some(word => normalizeWord(word) === normalizedSecret);

      if (!hasSecret) {
        toast.error('A palavra misteriosa deve ser uma das 10 palavras digitadas');
        return;
      }

      const totalWords = normalizedList.length;
      const clampedPosition = Math.min(Math.max(secretPosition, 1), totalWords);
      setSecretPosition(clampedPosition);

      const otherWords = normalizedList.filter(word => normalizeWord(word) !== normalizedSecret);
      const randomizedOthers = shuffleWords(otherWords);
      const sequence: string[] = [];
      let otherIndex = 0;

      for (let i = 0; i < totalWords; i++) {
        if (i + 1 === clampedPosition) {
          sequence.push(sanitizedSecret);
        } else {
          sequence.push(randomizedOthers[otherIndex++] || '');
        }
      }

      customSequenceRef.current = sequence;
      wordPoolRef.current = [];
    } else {
      customSequenceRef.current = [];
      refreshWordPool();
    }

    setStage('playing');
    setIsPlaying(true);
    setWordCount(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setStage('stopped');
    stopCamera();
    incrementUsage(GAME_IDS.MYSTERY_WORD).catch(console.error);
  };

  const handlePlayAgain = () => {
    setStage('greeting');
    setSecretWord('');
    setCurrentWord('');
    setWordCount(0);
    setIsPlaying(false);
    setGameMode('normal');
    setCustomWords([]);
    setCurrentCustomInput('');
    stopCamera();
    wordPoolRef.current = [];
    customSequenceRef.current = [];
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

          if (gameMode === 'custom-words') {
            const sequence = customSequenceRef.current;
            setCurrentWord(sequence[nextCount - 1] || '');
          } else {
            if (nextCount === secretPosition) {
              setCurrentWord(secretWord);
            } else {
              setCurrentWord(getNextUniqueWord());
            }
          }

          if (gameMode === 'random-camera') {
            if (nextCount === secretPosition) {
              void activateCamera();
            } else if (nextCount > secretPosition) {
              stopCamera();
            }
          }

          return nextCount;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, secretPosition, secretWord, getNextUniqueWord, gameMode, activateCamera, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <HeaderControls />

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
                <div className="relative inline-block w-full max-w-md">
                  <div className="relative rounded-lg bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
                    <div className="flex">
                      <button
                        onClick={() => handleContinueToInput('random-camera')}
                        className="flex-1 h-16 opacity-0 cursor-pointer"
                        aria-label="Modo câmera aleatória"
                      />
                      <button
                        onClick={() => handleContinueToInput('normal')}
                        className="flex-1 h-16 opacity-0 cursor-pointer"
                        aria-label="Modo normal"
                      />
                      <button
                        onClick={() => handleContinueToInput('custom-words')}
                        className="flex-1 h-16 opacity-0 cursor-pointer"
                        aria-label="Modo palavras personalizadas"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-2 text-primary-foreground text-xl font-medium">
                        <Brain className="h-6 w-6" />
                        <span className="whitespace-nowrap">{t('mysteryWord.startButton')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {stage === 'custom-input' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Digite 10 palavras
            </h2>
            <Card className="p-8">
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Adicione {10 - customWords.length} palavra(s)
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {customWords.map((word, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                      {word}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={currentCustomInput}
                    onChange={(e) => setCurrentCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomWord()}
                    placeholder="Digite uma palavra"
                    className="text-center text-xl py-6"
                    autoFocus
                  />
                  <Button 
                    onClick={handleAddCustomWord}
                    disabled={!currentCustomInput.trim() || customWords.length >= 10}
                    className="px-6"
                  >
                    Adicionar
                  </Button>
                </div>
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
                <Button 
                  size="lg" 
                  onClick={handleStartPlaying}
                  disabled={!secretWord.trim()}
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
