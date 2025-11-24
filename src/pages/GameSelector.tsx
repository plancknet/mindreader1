import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Smile,
  Shuffle,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { HeaderControls } from '@/components/HeaderControls';
import { useTranslation } from '@/hooks/useTranslation';
import { useUsageLimit } from '@/hooks/useUsageLimit';

type Tier = 'FREE' | 'STANDARD' | 'INFLUENCER';

type GameCard = {
  id: string;
  translationKey: string;
  icon: React.ComponentType<LucideProps>;
  path: string;
  instructionsPath?: string;
  color: string;
  badgeKey?: string;
  minTier: Tier;
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

const GAME_CARDS: GameCard[] = [
  {
    id: 'mystery-word',
    translationKey: 'mysteryWord',
    icon: Sparkles,
    path: '/mystery-word',
    instructionsPath: '/mystery-word/instructions',
    color: 'from-orange-500 to-red-500',
    badgeKey: undefined,
    minTier: 'FREE',
  },
  {
    id: 'suas-palavras',
    translationKey: 'suasPalavras',
    icon: Sparkles,
    path: '/suas-palavras',
    color: 'from-rose-400 via-pink-500 to-purple-600',
    minTier: 'STANDARD',
  },
  {
    id: 'mind-reader',
    translationKey: 'mindReader',
    icon: Brain,
    path: '/connect-mind',
    instructionsPath: '/mind-reader/instructions',
    color: 'from-purple-500 to-pink-500',
    badgeKey: undefined,
    minTier: 'FREE',
  },
  {
    id: 'mix-de-cartas',
    translationKey: 'mixDeCartas',
    icon: Shuffle,
    path: '/mind-reader/mix-de-cartas',
    color: 'from-emerald-500 to-lime-500',
    minTier: 'STANDARD',
  },
  {
    id: 'carta-mental',
    translationKey: 'cartaMental',
    icon: CardIcon,
    path: '/carta-mental',
    color: 'from-sky-500 via-blue-500 to-indigo-600',
    minTier: 'STANDARD',
  },
  {
    id: 'mental-conversation',
    translationKey: 'mentalConversation',
    icon: MessageCircle,
    path: '/mental-conversation',
    instructionsPath: '/mental-conversation/instructions',
    color: 'from-blue-500 to-cyan-500',
    badgeKey: undefined,
    minTier: 'STANDARD',
  },
  {
    id: 'papo-reto',
    translationKey: 'papoReto',
    icon: MessageCircle,
    path: '/papo-reto',
    color: 'from-slate-900 via-slate-800 to-slate-900',
    minTier: 'STANDARD',
  },
  {
    id: 'my-emojis',
    translationKey: 'myEmojis',
    icon: Smile,
    path: '/my-emojis',
    instructionsPath: '/my-emojis/instructions',
    color: 'from-yellow-400 to-lime-400',
    badgeKey: 'underConstruction',
    minTier: 'STANDARD',
  },
];

const GameSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { usageData } = useUsageLimit();
  const subscriptionTier: Tier = usageData?.subscriptionTier ?? 'FREE';
  const subscriptionStatus = usageData?.subscriptionStatus ?? 'inactive';
  const tierRank: Record<Tier, number> = { FREE: 0, STANDARD: 1, INFLUENCER: 2 };

  useEffect(() => {
    if (usageData && !usageData.canUse && !usageData.isPremium) {
      navigate('/premium');
    }
  }, [usageData, navigate]);

  const games = GAME_CARDS.filter((game) => game.id !== 'my-emojis').map((game) => {
    const baseKey = `gameSelector.cards.${game.translationKey}`;
    return {
      ...game,
      title: t(`${baseKey}.title`),
      description: t(`${baseKey}.description`),
      badge: game.badgeKey ? t(`gameSelector.${game.badgeKey}`) : undefined,
    };
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full space-y-8">
        <div className="flex justify-end">
          <HeaderControls showBackButton={false} />
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('gameSelector.heading')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('gameSelector.subheading')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            const instructionsPath = game.instructionsPath;
            const meetsTier = tierRank[subscriptionTier] >= tierRank[game.minTier];
            const statusAllowed = !(game.minTier === 'INFLUENCER') || subscriptionStatus === 'active';
            const enabled = meetsTier && statusAllowed;
            const isCartaMental = game.id === 'carta-mental';
            const iconWrapperClass = isCartaMental
              ? 'p-4 rounded-2xl bg-white/80 shadow-[0_12px_35px_rgba(56,189,248,0.35)] border border-primary/30'
              : `p-4 rounded-full bg-gradient-to-br ${game.color} bg-opacity-10`;
            const iconColorClass = isCartaMental ? 'text-sky-600' : 'text-primary';
            return (
              <Card
                key={game.id}
                className={`p-8 transition-all group relative overflow-hidden ${
                  enabled ? 'hover:scale-105' : 'opacity-60'
                }`}
              >
                {game.badge && (
                  <Badge className="absolute top-4 right-4 uppercase tracking-wide">
                    {game.badge}
                  </Badge>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                <div className="relative space-y-4">
                  <div className="flex justify-center">
                    <div className={iconWrapperClass}>
                      <Icon className={`w-12 h-12 ${iconColorClass}`} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center">{game.title}</h2>

                  <p className="text-muted-foreground text-center text-sm">
                    {game.description}
                  </p>

                  {!enabled && (
                    <p className="text-xs text-center text-muted-foreground">
                      Disponível no plano Vitalício ou Influencer.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={!enabled}
                      onClick={() => enabled && navigate(game.path)}
                    >
                      {t('gameSelector.play')}
                    </Button>
                    {instructionsPath && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(instructionsPath, { state: { from: location.pathname } });
                        }}
                        aria-label={`${game.title} - ${t('gameSelector.modalTitle')}`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
