import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain, Home, Moon, Languages as LanguagesIcon, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { START_WORDS, languages } from '@/i18n/languages';
import { themes } from '@/data/themes';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

type Quadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface QuadrantWords {
  'top-left': string[];
  'top-right': string[];
  'bottom-left': string[];
  'bottom-right': string[];
}

const quadrantOrder: Quadrant[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const StartPrompt = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');
  const { trackUsage } = useGameUsageTracker(GAME_IDS.MIND_READER);

  const [rawInput, setRawInput] = useState('');
  const [quadrantWords, setQuadrantWords] = useState<QuadrantWords | null>(null);
  const [colorRotation, setColorRotation] = useState(0);
  const targetWord = START_WORDS[language] || START_WORDS['pt-BR'];

  const theme = themes.find(t => t.id === themeId);
  const themeWords = theme?.words[language] || theme?.words['pt-BR'] || [];

  const goHome = () => navigate('/game-selector');

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-light');
  };

  const cycleLanguage = () => {
    const codes = languages.map(lang => lang.code);
    const currentIndex = codes.indexOf(language);
    const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
    setLanguage(nextCode);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/');
    }
  };

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

    trackUsage();
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
    <div
      className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="relative flex-1 px-4 pb-32 pt-8">
          <div className="pointer-events-none absolute inset-0 z-0 px-2 pb-32">
            <div className="grid h-full w-full grid-cols-2 gap-3 sm:gap-6">
              {quadrantOrder.map(quadrant => (
                <div
                  key={quadrant}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e1b4b]/70 to-[#0f111a]/60 p-4 text-center shadow-lg shadow-black/30 transition-all duration-1000 ${getQuadrantColor(quadrant)}`}
                >
                  <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-white/80 sm:text-lg">
                    {quadrantWords[quadrant].map((word, idx) => (
                      <div key={`${quadrant}-${word}-${idx}`} className="drop-shadow">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-full items-center justify-center px-2">
            <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e1b4b]/90 to-[#0f111a]/95 p-8 text-white shadow-2xl shadow-black/40">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Brain className="h-12 w-12 text-[#d8b4fe] animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#d8b4fe]">
                    {t('gameSelector.cards.mindReader.title')}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-base font-semibold text-white/90">
                    {t('startPrompt.placeholder', { word: targetWord })}
                  </p>
                  <div className="relative">
                    <Input
                      type="text"
                      value={rawInput}
                      onChange={handleInputChange}
                      className="text-center text-3xl font-bold tracking-[0.3em] uppercase text-transparent caret-[#7f13ec] selection:bg-transparent bg-transparent focus-visible:ring-0"
                      placeholder=""
                      autoFocus
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-bold tracking-[0.3em] uppercase">
                      <span className="text-white">{typedMask}</span>
                      <span className="text-white/30">{remainingMask}</span>
                    </span>
                  </div>
                  <p className="text-xs text-white/70 text-center">
                    {t('startPrompt.letterCount', { count: lettersCount, total: targetWord.length })}
                  </p>
                  <Button
                    type="button"
                    className="w-full rounded-2xl bg-[#7f13ec] py-4 text-base font-semibold tracking-wide text-white shadow-[0_12px_30px_rgba(127,19,236,0.35)] transition-colors hover:bg-[#7f13ec]/90 disabled:opacity-40"
                    onClick={handleSubmit}
                    disabled={!isComplete}
                  >
                    {t('common.send')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#0f111a]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-white/70">
          <button
            type="button"
            onClick={goHome}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#7f13ec]/30 bg-[#7f13ec]/15 px-3 py-2 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)] transition-colors hover:bg-[#7f13ec]/25"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <Moon className="h-5 w-5" />
            <span>Mode</span>
          </button>
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:text-white"
          >
            <LanguagesIcon className="h-5 w-5" />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:border-red-400/50 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default StartPrompt;
