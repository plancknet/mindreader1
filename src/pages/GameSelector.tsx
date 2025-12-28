import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Smile,
  Shuffle,
  Play,
  Wand2,
  Search,
  Home,
  Moon,
  Languages as LanguagesIcon,
  LogOut,
  type LucideProps,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { languages } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { GAME_IDS } from '@/constants/games';
import { checkGameAccess, type SubscriptionTier } from '@/lib/gameAccess';

type Tier = SubscriptionTier;

type GameCard = {
  id: string;
  gameId: number; // Maps to GAME_IDS for usage tracking
  translationKey: string;
  icon: React.ComponentType<LucideProps>;
  path: string;
  instructionsPath?: string;
  color: string;
  badgeKey?: string;
  minTier: Tier;
  difficulty: number;
  requiresAdmin?: boolean;
  adminOnly?: boolean;
};

const CardIcon = ({ className, ...props }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    role="img"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <rect x="5" y="3" width="14" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <rect x="8" y="6" width="8" height="12" rx="1.2" ry="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <path
      d="M12 10.5c-.8-1.4-3-1.1-3 0 0 1.6 3 3.5 3 3.5s3-1.9 3-3.5c0-1.1-2.2-1.4-3 0z"
      fill="currentColor"
      opacity="0.65"
    />
  </svg>
);

const ScratchCardIcon = ({ className, ...props }: LucideProps) => (
  <svg viewBox="0 0 64 64" role="img" aria-hidden="true" className={className} {...props}>
    <rect x="6" y="14" width="52" height="36" rx="8" ry="8" fill="currentColor" opacity="0.15" />
    <rect
      x="10"
      y="18"
      width="44"
      height="28"
      rx="6"
      ry="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="6 4"
      opacity="0.8"
    />
    <circle cx="48" cy="32" r="9" fill="currentColor" opacity="0.25" />
    <circle cx="48" cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 24 L40 24 M14 30 L38 28 M18 36 L42 34 M20 40 L44 38"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

const MAX_LEVEL = 5;

const LevelBars = ({ level }: { level: number }) => {
  return (
    <div className="flex items-end gap-1" aria-label={`Nível ${level}`}>
      {Array.from({ length: MAX_LEVEL }).map((_, index) => {
        const barLevel = index + 1;
        const isActive = barLevel <= level;
        const barHeight = 8 + index * 4;
        return (
          <span
            key={barLevel}
            className={`w-1.5 rounded-full transition-colors ${
              isActive ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.45)]' : 'bg-muted-foreground/30'
            }`}
            style={{ height: `${barHeight}px` }}
          />
        );
      })}
    </div>
  );
};

type LevelFilter = 1 | 2 | 3 | 4 | 5;

const levelFilterChips: Array<{ label: string; value: LevelFilter }> = [
  { label: 'Level 1', value: 1 },
  { label: 'Level 2', value: 2 },
  { label: 'Level 3', value: 3 },
  { label: 'Level 4', value: 4 },
  { label: 'Level 5', value: 5 },
];

const getStoredCameraReadyFlag = () =>
  typeof window !== 'undefined' &&
  sessionStorage.getItem(STORAGE_KEYS.MINDREADER_CAMERA_READY) === 'true';

const hasMindReaderCameraAccess = async () => {
  if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (status.state === 'granted') {
        return true;
      }
      if (status.state === 'denied') {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(STORAGE_KEYS.MINDREADER_CAMERA_READY);
        }
        return false;
      }
    } catch {
      // Ignore and fall back to stored flag
    }
  }

  return getStoredCameraReadyFlag();
};

const GAME_CARDS: GameCard[] = [
  // Difficulty 1 - FREE unlimited
  {
    id: 'carta-pensada',
    gameId: GAME_IDS.CARTA_PENSADA,
    translationKey: 'cartaPensada',
    icon: CardIcon,
    path: '/carta-pensada',
    instructionsPath: '/carta-pensada/instrucoes',
    color: 'from-indigo-500 via-blue-500 to-cyan-500',
    minTier: 'FREE',
    difficulty: 1,
  },
  {
    id: 'ponta-da-carta',
    gameId: GAME_IDS.PONTA_DA_CARTA,
    translationKey: 'pontaCarta',
    icon: CardIcon,
    path: '/ponta-da-carta',
    instructionsPath: '/ponta-da-carta/instrucoes',
    color: 'from-emerald-500 via-cyan-500 to-blue-500',
    minTier: 'FREE',
    difficulty: 1,
  },
  {
    id: 'oi-sumida',
    gameId: GAME_IDS.OI_SUMIDA,
    translationKey: 'oiSumida',
    icon: CardIcon,
    path: '/oi-sumida',
    instructionsPath: '/oi-sumida/instrucoes',
    color: 'from-rose-500 via-pink-500 to-orange-400',
    minTier: 'FREE',
    difficulty: 1,
  },
  // Difficulty 2 - FREE limited (3 uses)
  {
    id: 'jogo-da-velha-bruxa',
    gameId: GAME_IDS.JOGO_VELHA_BRUXA,
    translationKey: 'jogoVelhaBruxa',
    icon: Wand2,
    path: '/jogo-da-velha-bruxa',
    instructionsPath: '/jogo-da-velha-bruxa/instrucoes',
    color: 'from-slate-700 via-indigo-700 to-purple-700',
    minTier: 'FREE',
    difficulty: 2,
  },
  {
    id: 'mystery-word',
    gameId: GAME_IDS.MYSTERY_WORD,
    translationKey: 'mysteryWord',
    icon: Sparkles,
    path: '/mystery-word',
    instructionsPath: '/mystery-word/instructions',
    color: 'from-orange-500 to-red-500',
    minTier: 'FREE',
    difficulty: 2,
  },
  {
    id: 'suas-palavras',
    gameId: GAME_IDS.SUAS_PALAVRAS,
    translationKey: 'suasPalavras',
    icon: Sparkles,
    path: '/suas-palavras',
    instructionsPath: '/suas-palavras/instrucoes',
    color: 'from-rose-400 via-pink-500 to-purple-600',
    minTier: 'FREE',
    difficulty: 2,
  },
  {
    id: 'my-emojis',
    gameId: GAME_IDS.MY_EMOJIS,
    translationKey: 'myEmojis',
    icon: Smile,
    path: '/my-emojis',
    instructionsPath: '/my-emojis/instructions',
    color: 'from-yellow-400 to-lime-400',
    badgeKey: 'underConstruction',
    minTier: 'FREE',
    difficulty: 2,
  },
  // Difficulty 3 - FREE limited (3 uses)
  {
    id: 'mind-reader',
    gameId: GAME_IDS.MIND_READER,
    translationKey: 'mindReader',
    icon: Brain,
    path: '/connect-mind',
    instructionsPath: '/mind-reader/instructions',
    color: 'from-purple-500 to-pink-500',
    minTier: 'FREE',
    difficulty: 3,
  },
  {
    id: 'mental-conversation',
    gameId: GAME_IDS.MENTAL_CONVERSATION,
    translationKey: 'mentalConversation',
    icon: MessageCircle,
    path: '/mental-conversation',
    instructionsPath: '/mental-conversation/instructions',
    color: 'from-blue-500 to-cyan-500',
    minTier: 'FREE',
    difficulty: 3,
  },
  {
    id: 'mix-de-cartas',
    gameId: GAME_IDS.MIX_DE_CARTAS,
    translationKey: 'mixDeCartas',
    icon: Shuffle,
    path: '/mind-reader/mix-de-cartas',
    instructionsPath: '/mix-de-cartas/instrucoes',
    color: 'from-emerald-500 to-lime-500',
    minTier: 'FREE',
    difficulty: 3,
  },
  // Difficulty 4 - STANDARD unlimited
  {
    id: 'carta-mental',
    gameId: GAME_IDS.CARTA_MENTAL,
    translationKey: 'cartaMental',
    icon: CardIcon,
    path: '/carta-mental',
    instructionsPath: '/carta-mental/instrucoes',
    color: 'from-sky-500 via-blue-500 to-indigo-600',
    minTier: 'STANDARD',
    difficulty: 4,
  },
  {
    id: 'raspa-carta',
    gameId: GAME_IDS.RASPA_CARTA,
    translationKey: 'raspaCarta',
    icon: ScratchCardIcon,
    path: '/raspa-carta',
    instructionsPath: '/raspa-carta/instrucoes',
    color: 'from-cyan-400 via-sky-500 to-blue-600',
    minTier: 'STANDARD',
    difficulty: 4,
    requiresAdmin: true,
  },
  {
    id: 'papo-reto',
    gameId: GAME_IDS.PAPO_RETO,
    translationKey: 'papoReto',
    icon: MessageCircle,
    path: '/papo-reto',
    instructionsPath: '/papo-reto/instrucoes',
    color: 'from-fuchsia-500 via-purple-500 to-blue-500',
    minTier: 'STANDARD',
    difficulty: 4,
  },
  // Difficulty 5 - INFLUENCER only
  {
    id: 'eu-ja-sabia',
    gameId: GAME_IDS.EU_JA_SABIA,
    translationKey: 'euJaSabia',
    icon: Play,
    path: '/eu-ja-sabia',
    color: 'from-amber-500 via-orange-500 to-red-500',
    minTier: 'INFLUENCER',
    difficulty: 5,
  },
  {
    id: 'eu-ja-sabia-2',
    gameId: GAME_IDS.EU_JA_SABIA_2,
    translationKey: 'euJaSabia2',
    icon: Play,
    path: '/eu-ja-sabia-2',
    instructionsPath: '/eu-ja-sabia-2/instrucoes',
    color: 'from-amber-400 via-pink-400 to-rose-500',
    minTier: 'INFLUENCER',
    difficulty: 5,
  },
  {
    id: 'google-mime',
    gameId: GAME_IDS.GOOGLE_MIME,
    translationKey: 'googleMime',
    icon: Search,
    path: '/google-mime',
    instructionsPath: '/google-mime/instrucoes',
    requiresAdmin: false,
    adminOnly: false,
    color: 'from-blue-500 via-red-500 to-yellow-500',
    minTier: 'INFLUENCER',
    difficulty: 5,
  },
];

const GameSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language: currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const { usageData } = useUsageLimit();
  const { isAdmin } = useIsAdmin();
  const subscriptionTier: Tier = usageData?.subscriptionTier ?? 'FREE';
  const subscriptionStatus = usageData?.subscriptionStatus ?? 'inactive';
  const tierRank: Record<Tier, number> = { FREE: 0, STANDARD: 1, INFLUENCER: 2 };
  const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter | null>(null);

  useEffect(() => {
    if (usageData && !usageData.canUse && !usageData.isPremium) {
      navigate('/premium');
    }
  }, [usageData, navigate]);

  const games = GAME_CARDS.filter(
    (game) => game.id !== 'my-emojis' && game.id !== 'eu-ja-sabia'
  )
    .map((game) => {
      const baseKey = `gameSelector.cards.${game.translationKey}`;
      return {
        ...game,
        title: t(`${baseKey}.title`),
        description: t(`${baseKey}.description`),
        badge: game.badgeKey ? t(`gameSelector.${game.badgeKey}`) : undefined,
      };
    })
    .sort((a, b) => {
      if (a.difficulty === b.difficulty) {
        return a.title.localeCompare(b.title);
      }
      return a.difficulty - b.difficulty;
    });

  const filteredGames = useMemo(() => {
    return games.filter((game) => selectedLevel === null || game.difficulty === selectedLevel);
  }, [games, selectedLevel]);

  const goHome = () => navigate('/');

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
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      navigate('/');
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background pb-24 text-foreground"
      style={{ fontFamily: loginFontFamily }}
    >
      {/* Dark mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 dark:block hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>
      {/* Light mode decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 dark:hidden block">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-primary shadow-glow dark:border-[#7f13ec]/20 dark:bg-[#7f13ec]/15 dark:text-[#7f13ec] dark:shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold text-foreground drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_15px_rgba(127,19,236,0.5)]">
                MindReader
              </h1>
            </div>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary shadow-glow dark:bg-[#7f13ec] dark:shadow-[0_0_8px_rgba(127,19,236,0.8)]" />
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pt-6">
          <div className="px-4">
            <div className="flex flex-wrap gap-2 pb-2">
              {levelFilterChips.map((chip) => {
                const isActive = selectedLevel === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setSelectedLevel(isActive ? null : chip.value)}
                    className={`flex h-7 items-center justify-center rounded-full border px-2.5 text-[0.65rem] font-semibold tracking-wide transition-all active:scale-95 ${
                      isActive
                        ? 'border-primary/50 bg-primary text-primary-foreground shadow-glow dark:border-[#7f13ec]/50 dark:bg-[#7f13ec] dark:text-white dark:shadow-[0_0_15px_rgba(127,19,236,0.4)]'
                        : 'border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:bg-secondary/80 dark:border-white/10 dark:bg-[#1e1b4b] dark:text-white/70 dark:hover:border-[#7f13ec]/40 dark:hover:bg-white/5'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-10">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              const instructionsPath = game.instructionsPath;
              
              // Get usage count for this specific game
              const gameUsageCount = usageData?.gameUsage?.[game.gameId] ?? 0;
              
              // Check access using the new rules
              const accessResult = checkGameAccess(subscriptionTier, game.difficulty, gameUsageCount);
              
              // Admin overrides
              const isInfluencerTier = subscriptionTier === 'INFLUENCER';
              const adminAllowed =
                (!game.requiresAdmin || isAdmin || isInfluencerTier) &&
                (!game.adminOnly || isAdmin);
              
              const enabled = isAdmin || (accessResult.canAccess && adminAllowed);
              
              // Build disabled message
              let disabledMessage: string | null = null;
              if (!adminAllowed) {
                disabledMessage = game.adminOnly
                  ? 'Disponível apenas para administradores.'
                  : 'Disponível para administradores ou plano Influencer.';
              } else if (accessResult.reason === 'BLOCKED') {
                if (game.difficulty === 5) {
                  disabledMessage = 'Disponível apenas no plano Influencer.';
                } else if (game.difficulty === 4) {
                  disabledMessage = 'Disponível a partir do plano Standard.';
                }
              } else if (accessResult.reason === 'LIMIT_REACHED') {
                disabledMessage = `Limite de ${accessResult.usageLimit} usos atingido. Faça upgrade para continuar.`;
              }
              
              // Show remaining uses for limited games
              const showUsageInfo = !accessResult.isUnlimited && accessResult.canAccess && accessResult.usageLimit;
              const remainingUses = showUsageInfo ? accessResult.usageLimit! - accessResult.usageCount : 0;

              const handleCardNavigation = async () => {
                if (!enabled) return;
                if (game.id === 'mind-reader') {
                  const skipConnectMind = await hasMindReaderCameraAccess();
                  navigate(skipConnectMind ? '/select-theme' : game.path);
                  return;
                }
                navigate(game.path);
              };

              const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                if (!enabled) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  void handleCardNavigation();
                }
              };

              return (
                <div
                  key={game.id}
                  role="button"
                  tabIndex={enabled ? 0 : -1}
                  onClick={() => {
                    void handleCardNavigation();
                  }}
                  onKeyDown={handleCardKeyDown}
                  className={`group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all dark:border-white/10 dark:bg-gradient-to-br dark:from-[#1e1b4b]/85 dark:to-[#0f111a]/95 dark:shadow-black/30 ${
                    enabled
                      ? 'cursor-pointer hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:hover:border-[#7f13ec]/50 dark:hover:shadow-[0_0_25px_rgba(127,19,236,0.15)] dark:focus-visible:ring-[#7f13ec]/60'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`relative shrink-0 size-[72px] rounded-xl border border-border/50 bg-gradient-to-br ${game.color} shadow-inner dark:border-white/10`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-black/20" />
                    <div className="relative flex h-full w-full items-center justify-center">
                      <Icon className="h-9 w-9 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="two-line-clamp text-base font-semibold leading-snug text-foreground group-hover:text-primary dark:text-white dark:group-hover:text-[#d8b4fe]">
                          {game.title}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <LevelBars level={game.difficulty} />
                        {game.badge && (
                          <Badge className="bg-secondary text-[10px] uppercase tracking-wide text-foreground dark:bg-white/5 dark:text-white">
                            {game.badge}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground dark:text-white/65">{game.description}</p>

                    {!enabled && disabledMessage && (
                      <p className="text-[11px] text-muted-foreground/60 dark:text-white/40">{disabledMessage}</p>
                    )}

                    {showUsageInfo && enabled && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        {remainingUses} uso{remainingUses !== 1 ? 's' : ''} restante{remainingUses !== 1 ? 's' : ''}
                      </p>
                    )}

                    {instructionsPath && (
                      <div className="flex justify-end pt-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-border bg-secondary text-foreground hover:border-primary/50 hover:bg-primary/20 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-[#7f13ec]/50 dark:hover:bg-[#7f13ec]/30"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(instructionsPath, { state: { from: location.pathname } });
                          }}
                          aria-label={`${game.title} - ${t('gameSelector.modalTitle')}`}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

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
            <Moon className="h-5 w-5" />
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

export default GameSelector;

