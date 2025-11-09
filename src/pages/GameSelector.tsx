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

  const games = [
    {
      id: 'magic-quadrants',
      title: 'Quadrantes Mágicos',
      description: 'Descubra em qual quadrante você está pensando através da leitura mental',
      icon: Grid3x3,
      path: '/connect-mind',
      color: 'from-purple-500 to-pink-500',
      instructions: '1. A IA mostrará uma grade com números\n2. Pense em um número da grade\n3. A IA fará perguntas sobre quadrantes\n4. Responda honestamente\n5. A IA revelará o número que você pensou!'
    },
    {
      id: 'mystery-word',
      title: 'Palavra Misteriosa',
      description: 'Pense em uma palavra e deixe a IA descobrir qual é',
      icon: Sparkles,
      path: '/mystery-word',
      color: 'from-blue-500 to-cyan-500',
      instructions: '1. Pense em uma palavra (animal, fruta ou país)\n2. A IA fará perguntas\n3. Responda com suas respostas\n4. A IA usará pistas para descobrir a palavra\n5. Veja se ela acerta!'
    },
    {
      id: 'mental-conversation',
      title: 'Conversa Mental',
      description: 'Converse mentalmente com a IA',
      icon: MessageSquare,
      path: '/mental-conversation',
      color: 'from-green-500 to-emerald-500',
      disabled: false,
      instructions: '1. Peça ao seu amigo para pensar em um ANIMAL, FRUTA ou PAÍS\n2. Não conte qual é a categoria\n3. A IA fará perguntas naturais\n4. Responda usando voz ou texto\n5. A IA descobrirá a palavra através das suas respostas!'
    }
  ];

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
            Leitores de Mente
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha uma experiência de leitura mental
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
                      {game.disabled ? 'Em breve' : 'Jogar'}
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
            <DialogTitle>Como Jogar</DialogTitle>
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
