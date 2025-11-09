import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Grid3x3, MessageSquare, Sparkles, HelpCircle } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const GameSelector = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const baseGames = [
    {
      id: 'magic-quadrants',
      icon: Grid3x3,
      path: '/connect-mind',
      color: 'from-purple-500 to-pink-500',
      translationKey: 'gameSelector.cards.magicQuadrants',
      instructionsKey: 'gameSelector.cards.magicQuadrants.instructions'
    },
    {
      id: 'mystery-word',
      icon: Sparkles,
      path: '/mystery-word',
      color: 'from-blue-500 to-cyan-500',
      translationKey: 'gameSelector.cards.mysteryWord',
      instructionsKey: 'gameSelector.cards.mysteryWord.instructions'
    },
    {
      id: 'mental-conversation',
      icon: MessageSquare,
      path: '/mental-conversation',
      color: 'from-green-500 to-emerald-500',
      disabled: false,
      translationKey: 'gameSelector.cards.mentalConversation',
      instructionsKey: 'mentalConversation.instructions'
    }
  ];

  const games = baseGames.map(({ translationKey, instructionsKey, ...game }) => ({
    ...game,
    title: t(`${translationKey}.title`),
    description: t(`${translationKey}.description`),
    instructions: t(instructionsKey),
  }));

  const openInstructions = (gameId: string) => {
    setSelectedGame(gameId);
    setInstructionsOpen(true);
  };

  const currentGameInstructions = games.find(g => g.id === selectedGame)?.instructions || '';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full space-y-8">
        <div className="flex justify-end gap-2">
          <LanguageSelector />
          <LogoutButton />
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
            return (
              <Card
                key={game.id}
                className={`p-8 hover:scale-105 transition-all group relative overflow-hidden ${
                  game.disabled ? 'opacity-50' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative space-y-4">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${game.color} bg-opacity-10`}>
                      <Icon className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center">{game.title}</h2>
                  
                  <p className="text-muted-foreground text-center text-sm">
                    {game.description}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant={game.disabled ? "outline" : "default"}
                      disabled={game.disabled}
                      onClick={() => !game.disabled && navigate(game.path)}
                    >
                      {game.disabled ? t('gameSelector.comingSoon') : t('gameSelector.play')}
                    </Button>
                    <Button 
                      size="icon"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInstructions(game.id);
                      }}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('gameSelector.modalTitle')}</DialogTitle>
            <DialogDescription className="whitespace-pre-line pt-4">
              {currentGameInstructions}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSelector;
