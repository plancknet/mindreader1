import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';

const MysteryWord = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'thinking' | 'cards' | 'reveal'>('intro');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Cartões com números binários para descobrir um número de 1-63
  const cards = [
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63],
    [2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23, 26, 27, 30, 31, 34, 35, 38, 39, 42, 43, 46, 47, 50, 51, 54, 55, 58, 59, 62, 63],
    [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31, 36, 37, 38, 39, 44, 45, 46, 47, 52, 53, 54, 55, 60, 61, 62, 63],
    [8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31, 40, 41, 42, 43, 44, 45, 46, 47, 56, 57, 58, 59, 60, 61, 62, 63],
    [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63]
  ];

  const handleStart = () => {
    setStage('thinking');
    setTimeout(() => {
      setStage('cards');
      setCurrentCardIndex(0);
      setSelectedCards([]);
    }, 3000);
  };

  const handleCardResponse = (hasNumber: boolean) => {
    if (hasNumber) {
      setSelectedCards([...selectedCards, currentCardIndex]);
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setStage('reveal');
    }
  };

  const getRevealedNumber = () => {
    return selectedCards.reduce((sum, cardIndex) => sum + cards[cardIndex][0], 0);
  };

  const handlePlayAgain = () => {
    setStage('intro');
    setSelectedCards([]);
    setCurrentCardIndex(0);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/game-selector')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <LanguageSelector />
            <LogoutButton />
          </div>
        </div>

        {stage === 'intro' && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Brain className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Palavra Misteriosa
            </h1>
            <Card className="p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Como funciona?</h2>
                <div className="space-y-4 text-lg text-muted-foreground text-left">
                  <p>1. Pense em um número entre 1 e 63</p>
                  <p>2. Você verá 6 cartões com diversos números</p>
                  <p>3. Para cada cartão, indique se o número que você pensou está presente</p>
                  <p>4. A IA lerá sua mente e revelará o número!</p>
                </div>
                <Button size="lg" onClick={handleStart} className="text-xl px-8 py-6">
                  <Brain className="mr-2 h-6 w-6" />
                  Começar Leitura Mental
                </Button>
              </div>
            </Card>
          </div>
        )}

        {stage === 'thinking' && (
          <div className="text-center space-y-8">
            <Brain className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Pense em um número entre 1 e 63...
            </h2>
            <p className="text-xl text-muted-foreground">
              Concentre-se nele intensamente
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {stage === 'cards' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Cartão {currentCardIndex + 1} de {cards.length}
              </h2>
              <p className="text-muted-foreground">
                O número que você pensou está neste cartão?
              </p>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-8 gap-2 mb-6">
                {cards[currentCardIndex].map((num) => (
                  <div
                    key={num}
                    className="aspect-square flex items-center justify-center bg-primary/10 rounded-lg font-bold text-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleCardResponse(false)}
                className="text-xl px-8 py-6"
              >
                Não
              </Button>
              <Button
                size="lg"
                onClick={() => handleCardResponse(true)}
                className="text-xl px-8 py-6"
              >
                Sim
              </Button>
            </div>
          </div>
        )}

        {stage === 'reveal' && (
          <div className="text-center space-y-8">
            <Brain className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Li sua mente! 🎯
            </h2>
            <Card className="p-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <p className="text-2xl mb-4 text-muted-foreground">
                O número que você pensou foi:
              </p>
              <div className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {getRevealedNumber()}
              </div>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/game-selector')}
                className="text-xl px-8 py-6"
              >
                Voltar ao Menu
              </Button>
              <Button
                size="lg"
                onClick={handlePlayAgain}
                className="text-xl px-8 py-6"
              >
                <Brain className="mr-2 h-6 w-6" />
                Jogar Novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MysteryWord;
