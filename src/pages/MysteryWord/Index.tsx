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

const MysteryWord = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { incrementUsage } = useUsageLimit();
  const [stage, setStage] = useState<'greeting' | 'input' | 'playing' | 'stopped'>('greeting');
  const [selectedPhrase, setSelectedPhrase] = useState('');
  const [secretPosition, setSecretPosition] = useState(0);
  const [secretWord, setSecretWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clickedArea, setClickedArea] = useState<'left' | 'center' | 'right' | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const wordPoolRef = useRef<string[]>([]);

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
    setSelectedPhrase(phrases[randomIndex]);
    setSecretPosition(randomIndex + 1);
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


  const handleContinueToInput = (area: 'left' | 'center' | 'right') => {
    setClickedArea(area);
    if (area === 'center') {
      setStage('input');
    }
  };

  const handleStartPlaying = () => {
    if (!secretWord.trim()) return;
    refreshWordPool();
    setStage('playing');
    setIsPlaying(true);
    setWordCount(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setStage('stopped');
    incrementUsage(GAME_IDS.MYSTERY_WORD).catch(console.error);
  };

  const handlePlayAgain = () => {
    setStage('greeting');
    setSecretWord('');
    setCurrentWord('');
    setWordCount(0);
    setIsPlaying(false);
    wordPoolRef.current = [];
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
          if (nextCount === secretPosition) {
            setCurrentWord(secretWord);
          } else {
            setCurrentWord(getNextUniqueWord());
          }
          return nextCount;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, secretPosition, secretWord, language, getNextUniqueWord]);


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
                
                {clickedArea && clickedArea !== 'center' && (
                  <div className="text-3xl font-bold text-primary animate-fade-in mb-4">
                    {clickedArea === 'left' ? 'Esquerda' : 'Direita'}
                  </div>
                )}
                
                <div 
                  className={`relative inline-block transition-transform duration-150 ${isPressed ? 'scale-95' : 'scale-100'}`}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  onMouseLeave={() => setIsPressed(false)}
                >
                  <div className="relative h-16 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-xl font-medium cursor-pointer overflow-hidden">
                    <Brain className="mr-2 h-6 w-6" />
                    {t('mysteryWord.startButton')}
                    
                    <div 
                      className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-10"
                      onClick={() => handleContinueToInput('left')}
                    />
                    <div 
                      className="absolute inset-y-0 left-1/3 w-1/3 cursor-pointer z-10"
                      onClick={() => handleContinueToInput('center')}
                    />
                    <div 
                      className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-10"
                      onClick={() => handleContinueToInput('right')}
                    />
                  </div>
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
