import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain, Home, Moon, Sun, Languages as LanguagesIcon, LogOut } from 'lucide-react';
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

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const StartPrompt = () => {
    const navigate = useNavigate();
    const { t, language: currentLanguage } = useTranslation();
    const { setLanguage } = useLanguageContext();
    const [searchParams] = useSearchParams();
    const themeId = searchParams.get('theme');
    const { trackUsage } = useGameUsageTracker(GAME_IDS.MIND_READER);

    const goHome = () => navigate('/game-selector');

    const toggleTheme = () => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        if (isDark) {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    const cycleLanguage = () => {
        const codes = languages.map((lang) => lang.code);
        const currentIndex = codes.indexOf(currentLanguage);
        const nextCode = codes[(currentIndex + 1) % codes.length] ?? codes[0];
        setLanguage(nextCode);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Failed to sign out', err);
        } finally {
            navigate('/');
        }
    };

    const [rawInput, setRawInput] = useState('');
    const [quadrantWords, setQuadrantWords] = useState<QuadrantWords | null>(null);
    const [colorRotation, setColorRotation] = useState(0);
    const targetWord = START_WORDS[currentLanguage] || START_WORDS['pt-BR'];

    const theme = themes.find(t => t.id === themeId);
    const themeWords = theme?.words[currentLanguage] || theme?.words['pt-BR'] || [];

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
            className="relative min-h-screen overflow-hidden bg-background pb-24 text-foreground"
            style={{ fontFamily: loginFontFamily }}
        >
            {/* Dark mode decorative blurs */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block">
                <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
                <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
            </div>
            {/* Light mode decorative blurs */}
            <div className="pointer-events-none fixed inset-0 z-0 block dark:hidden">
                <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
                <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-primary/8 blur-[100px]" />
            </div>

            {/* Central floating card */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md px-4">
                <Card className="p-8 shadow-glow bg-card/90 backdrop-blur-sm border border-border dark:bg-card/20 dark:border-border/30">
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <Brain className="w-12 h-12 text-primary dark:text-[#7f13ec] animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-muted-foreground dark:text-white/70 block text-center">
                                {t('startPrompt.placeholder', { word: targetWord })}
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={rawInput}
                                    onChange={handleInputChange}
                                    className="text-center text-2xl font-bold tracking-widest uppercase text-transparent caret-primary selection:bg-transparent bg-transparent backdrop-blur-none dark:border-white/10"
                                    placeholder=""
                                    autoFocus
                                />
                                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-widest uppercase">
                                    <span className="text-foreground dark:text-white">{typedMask}</span>
                                    <span className="text-muted-foreground/40 dark:text-white/40">{remainingMask}</span>
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-white/60 text-center">
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
                            <div key={idx} className="text-xl md:text-2xl font-bold text-foreground dark:text-white drop-shadow-lg">
                                {word}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Right */}
                <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('top-right')}`}>
                    <div className="text-center space-y-3 relative z-10">
                        {quadrantWords['top-right'].map((word, idx) => (
                            <div key={idx} className="text-xl md:text-2xl font-bold text-foreground dark:text-white drop-shadow-lg">
                                {word}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Bottom Left */}
                <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-left')}`}>
                    <div className="text-center space-y-3 relative z-10">
                        {quadrantWords['bottom-left'].map((word, idx) => (
                            <div key={idx} className="text-xl md:text-2xl font-bold text-foreground dark:text-white drop-shadow-lg">
                                {word}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Bottom Right */}
                <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-right')}`}>
                    <div className="text-center space-y-3 relative z-10">
                        {quadrantWords['bottom-right'].map((word, idx) => (
                            <div key={idx} className="text-xl md:text-2xl font-bold text-foreground dark:text-white drop-shadow-lg">
                                {word}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-background/95 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f111a]/95">
                <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 px-4 py-4 text-[11px] font-semibold uppercase text-muted-foreground dark:text-white/70">
                    <button
                        type="button"
                        onClick={goHome}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/15 px-3 py-2 text-primary shadow-glow transition-colors hover:bg-primary/25 dark:border-[#7f13ec]/30 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)] dark:hover:bg-[#7f13ec]/25"
                    >
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                    </button>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#7f13ec]/40 dark:hover:text-white"
                    >
                        <Moon className="hidden h-5 w-5 dark:block" />
                        <Sun className="block h-5 w-5 dark:hidden" />
                        <span>Mode</span>
                    </button>
                    <button
                        type="button"
                        onClick={cycleLanguage}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#7f13ec]/40 dark:hover:text-white"
                    >
                        <LanguagesIcon className="h-5 w-5" />
                        <span>{currentLanguage.toUpperCase()}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-red-400/50 dark:hover:text-white"
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
