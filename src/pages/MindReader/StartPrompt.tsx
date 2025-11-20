import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { START_WORDS } from '@/i18n/languages';
import { themes } from '@/data/themes';
import { HeaderControls } from '@/components/HeaderControls';

type Quadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface QuadrantWords {
  'top-left': string[];
  'top-right': string[];
  'bottom-left': string[];
  'bottom-right': string[];
}

const StartPrompt = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');

  const [rawInput, setRawInput] = useState('');
  const [quadrantWords, setQuadrantWords] = useState<QuadrantWords | null>(null);
  const [colorRotation, setColorRotation] = useState(0);
  const targetWord = START_WORDS[language] || START_WORDS['pt-BR'];

  const theme = themes.find(t => t.id === themeId);
  const themeWords = theme?.words[language] || theme?.words['pt-BR'] || [];

  const distributeWords = useCallback((wordList: string[]) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    const wordsPerQuadrant = Math.ceil(shuffled.length / 4);
    
    return {
      'top-left': shuffled.slice(0, wordsPerQuadrant),
      'top-right': shuffled.slice(wordsPerQuadrant, wordsPerQuadrant * 2),
      'bottom-left': shuffled.slice(wordsPerQuadrant * 2, wordsPerQuadrant * 3),
      'bottom-right': shuffled.slice(wordsPerQuadrant * 3)
    };
  }, []);

  useEffect(() => {
    if (!themeId) {
      navigate('/select-theme');
    } else if (themeWords.length > 0) {
      setQuadrantWords(distributeWords(themeWords));
    }
  }, [themeId, navigate, themeWords, distributeWords]);

  // Rotate colors every second
  useEffect(() => {
    const interval = setInterval(() => {
      setColorRotation(prev => (prev + 1) % 6);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    if (value.length <= targetWord.length) {
      setRawInput(value);
    }
  };

  const normalizedInput = useMemo(() => rawInput.toUpperCase(), [rawInput]);
  const trimmedInput = useMemo(() => rawInput.trim(), [rawInput]);
  
  // Check if first letters (except last) match START_WORDS
  const prefixLength = targetWord.length - 1;
  const requiredPrefix = targetWord.slice(0, prefixLength);
  const typedPrefix = normalizedInput.slice(0, prefixLength);
  const isPrefixValid = typedPrefix === requiredPrefix.slice(0, typedPrefix.length);
  
  // Mask logic: show complete START_WORDS visually
  const lettersCount = Math.min(rawInput.length, targetWord.length);
  const showMask = isPrefixValid && lettersCount === targetWord.length;
  const typedMask = useMemo(() => {
    if (!isPrefixValid) return '';
    if (lettersCount < targetWord.length) {
      return targetWord.slice(0, lettersCount);
    }
    // Show complete word when all letters typed
    return targetWord;
  }, [targetWord, lettersCount, isPrefixValid]);
  
  const remainingMask = useMemo(() => {
    if (!isPrefixValid) return '';
    if (lettersCount >= targetWord.length) {
      return ''; // Nothing remaining, show complete word
    }
    return targetWord.slice(lettersCount);
  }, [targetWord, lettersCount, isPrefixValid]);

  // Button enabled only if prefix is correct and all letters typed
  const isComplete = isPrefixValid && normalizedInput.length === targetWord.length;

  const handleSubmit = () => {
    if (!themeId || !isComplete) {
      return;
    }

    const lastChar = normalizedInput.charAt(normalizedInput.length - 1);
    navigate(`/gameplay?theme=${themeId}&userWord=${encodeURIComponent(lastChar)}`);
  };

  const getQuadrantColor = (quadrant: Quadrant): string => {
    const isLeft = quadrant.includes('left');
    const isTop = quadrant.includes('top');
    
    const colors = [
      'bg-blue-500/20',
      'bg-purple-500/20',
      'bg-pink-500/20',
      'bg-indigo-500/20',
      'bg-cyan-500/20',
      'bg-rose-500/20'
    ];
    
    const quadrantIndex = isTop ? (isLeft ? 0 : 1) : (isLeft ? 2 : 3);
    const colorIndex = (colorRotation + quadrantIndex) % colors.length;
    
    return colors[colorIndex];
  };

  if (!quadrantWords) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 relative">
      <div className="fixed top-4 left-4 z-50">
        <HeaderControls />
      </div>

      {/* Central floating card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md px-4">
        <Card className="p-8 shadow-glow bg-card/20 border border-border/30">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground block text-center">
                {t('startPrompt.placeholder', { word: targetWord })}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={rawInput}
                  onChange={handleInputChange}
                  className="text-center text-2xl font-bold tracking-widest uppercase text-transparent caret-primary selection:bg-transparent bg-transparent backdrop-blur-none"
                  placeholder=""
                  autoFocus
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-widest uppercase">
                  <span className="text-foreground">{typedMask}</span>
                  <span className="text-muted-foreground/40">{remainingMask}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('startPrompt.letterCount', { count: lettersCount, total: targetWord.length })}
              </p>
              <Button
                type="button"
                className="w-full text-lg font-semibold"
                onClick={handleSubmit}
                disabled={!isComplete}
              >
                {t('common.send')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quadrants Grid */}
      <div className="h-screen grid grid-cols-2 gap-8 p-8">
        {/* Top Left */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('top-left')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['top-left'].map((word, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Top Right */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('top-right')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['top-right'].map((word, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Left */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-left')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['bottom-left'].map((word, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Right */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-right')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['bottom-right'].map((word, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StartPrompt;
