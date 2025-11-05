import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { START_WORDS } from '@/i18n/languages';
import { themes } from '@/data/themes';

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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Quadrants with words */}
      {quadrantWords && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top-left */}
          <div className="border-r border-b border-border/30 p-8 flex flex-col items-center justify-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {quadrantWords['top-left'].map((word, index) => (
                <span
                  key={index}
                  className="text-2xl md:text-3xl font-bold text-foreground/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Top-right */}
          <div className="border-b border-border/30 p-8 flex flex-col items-center justify-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {quadrantWords['top-right'].map((word, index) => (
                <span
                  key={index}
                  className="text-2xl md:text-3xl font-bold text-foreground/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom-left */}
          <div className="border-r border-border/30 p-8 flex flex-col items-center justify-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {quadrantWords['bottom-left'].map((word, index) => (
                <span
                  key={index}
                  className="text-2xl md:text-3xl font-bold text-foreground/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom-right */}
          <div className="border-border/30 p-8 flex flex-col items-center justify-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {quadrantWords['bottom-right'].map((word, index) => (
                <span
                  key={index}
                  className="text-2xl md:text-3xl font-bold text-foreground/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating input card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <Card className="max-w-md w-full p-8 shadow-glow pointer-events-auto bg-card/95 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('startPrompt.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('startPrompt.subtitle')}
              </p>
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
                  className="text-center text-2xl font-bold tracking-widest uppercase text-transparent caret-primary selection:bg-transparent"
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
    </div>
  );
};

export default StartPrompt;
