import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const markWelcomeSeen = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('premium_users')
          .update({ has_seen_welcome: true })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating welcome status:', error);
      }
    };

    markWelcomeSeen();
  }, []);

  const gameLinks = [
    {
      id: 'mystery-word',
      title: 'Palavra Misteriosa',
      icon: Sparkles,
      instructionsPath: '/mystery-word/instructions',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'mind-reader',
      title: 'Quadrante Mágico',
      icon: Brain,
      instructionsPath: '/mind-reader/instructions',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'mental-conversation',
      title: 'Conversa Mental',
      icon: MessageCircle,
      instructionsPath: '/mental-conversation/instructions',
      color: 'from-blue-500 to-cyan-500',
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse">
              <Brain className="w-20 h-20 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Agora nososs conseguiremos Ler de Mentes
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Bem-vindo! Explore cada jogo para descobrir seus poderes mentais. 
            IMPORTANTE: leia as instruções de cada modalidade e treine antes de apresentar aos seus amigos:
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {gameLinks.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="p-6 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => navigate(game.instructionsPath, { state: { from: location.pathname } })}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${game.color} bg-opacity-10`}>
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-center group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                  
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-accent"
                    >
                      Ver Instruções
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            className="h-14 px-12 text-lg"
            onClick={() => navigate('/game-selector')}
          >
            Iniciar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
