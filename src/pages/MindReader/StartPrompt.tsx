import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { START_WORDS } from '@/i18n/languages';

const StartPrompt = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');

  const [rawInput, setRawInput] = useState('');
  const targetWord = START_WORDS[language] || START_WORDS['pt-BR'];

  useEffect(() => {
    if (!themeId) {
      navigate('/select-theme');
    }
  }, [themeId, navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(event.target.value);
  };

  const normalizedInput = useMemo(() => rawInput.toUpperCase(), [rawInput]);
  const trimmedInput = useMemo(() => rawInput.trim(), [rawInput]);
  const lettersCount = Math.min(rawInput.length, targetWord.length);
  const typedMask = useMemo(() => targetWord.slice(0, lettersCount), [targetWord, lettersCount]);
  const remainingMask = useMemo(
    () => targetWord.slice(lettersCount),
    [targetWord, lettersCount]
  );

  const handleSubmit = () => {
    if (!themeId || !trimmedInput) {
      return;
    }

    if (trimmedInput.toUpperCase() === targetWord) {
      navigate(`/gameplay?theme=${themeId}`);
      return;
    }

    navigate(`/gameplay?theme=${themeId}&userWord=${encodeURIComponent(trimmedInput)}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('startPrompt.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('startPrompt.subtitle')}
          </p>
        </div>

        <Card className="p-8">
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
              disabled={!trimmedInput}
            >
              {t('common.send')}
            </Button>
          </div>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
           </p>
        </div>
      </div>
    </div>
  );
};

export default StartPrompt;
