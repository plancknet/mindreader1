import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain } from 'lucide-react';

const StartPrompt = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');
  
  const [displayText, setDisplayText] = useState('');
  const [actualInput, setActualInput] = useState('');
  const targetWord = 'INICIAR';

  useEffect(() => {
    if (!themeId) {
      navigate('/select-theme');
    }
  }, [themeId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChar = e.target.value.slice(-1);
    
    if (!newChar) {
      // Backspace
      setActualInput(prev => prev.slice(0, -1));
      setDisplayText(prev => prev.slice(0, -1));
      return;
    }

    const currentLength = actualInput.length;
    
    if (currentLength < targetWord.length) {
      const nextDisplayChar = targetWord[currentLength];
      setDisplayText(prev => prev + nextDisplayChar);
      setActualInput(prev => prev + newChar);
      
      // Check if completed
      if (currentLength + 1 === targetWord.length) {
        const finalWord = actualInput + newChar;
        setTimeout(() => {
          if (finalWord.toUpperCase() === targetWord) {
            // Normal mode
            navigate(`/gameplay?theme=${themeId}`);
          } else {
            // Trick mode - pass the user's word
            navigate(`/gameplay?theme=${themeId}&userWord=${encodeURIComponent(finalWord)}`);
          }
        }, 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vamos começar!
          </h1>
          <p className="text-muted-foreground text-lg">
            Digite a palavra abaixo para iniciar o jogo
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground block text-center">
              Digite: INICIAR
            </label>
            <Input
              type="text"
              value={displayText}
              onChange={handleInputChange}
              className="text-center text-2xl font-bold tracking-widest uppercase"
              placeholder=""
              autoFocus
              maxLength={targetWord.length}
            />
            <p className="text-xs text-muted-foreground text-center">
              {displayText.length}/{targetWord.length} letras
            </p>
          </div>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            💡 Dica: Você pode digitar qualquer palavra
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartPrompt;
