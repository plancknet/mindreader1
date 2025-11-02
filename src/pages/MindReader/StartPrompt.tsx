import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const StartPrompt = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');

  const inputRef = useRef<HTMLInputElement>(null);
  const [actualInput, setActualInput] = useState('');
  const targetWord = 'INICIAR';

  useEffect(() => {
    if (!themeId) {
      navigate('/select-theme');
    }
  }, [themeId, navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent | undefined;
    const currentMaskLength = Math.min(actualInput.length, targetWord.length);

    const appendValue = (value: string) => {
      if (!value) return;
      setActualInput(prev => prev + value);
    };

    if (nativeEvent) {
      const { inputType } = nativeEvent;
      const data = nativeEvent.data ?? '';
      const dataTransfer = (nativeEvent as InputEvent & { dataTransfer?: DataTransfer }).dataTransfer;

      switch (inputType) {
        case 'deleteContentBackward':
          setActualInput(prev => prev.slice(0, -1));
          break;
        case 'deleteContentForward':
          setActualInput(prev => prev.slice(1));
          break;
        case 'deleteByCut':
        case 'deleteByDrag':
          setActualInput('');
          break;
        case 'insertReplacementText':
          setActualInput(data);
          break;
        case 'insertFromPaste':
        case 'insertFromDrop': {
          const text = data || dataTransfer?.getData('text') || '';
          if (text) {
            appendValue(text);
          }
          break;
        }
        case 'insertCompositionText':
        case 'insertFromComposition':
        case 'insertText':
        default: {
          if (data) {
            appendValue(data);
          } else {
            const rawValue = event.target.value;
            if (rawValue.length < currentMaskLength) {
              const removeCount = currentMaskLength - rawValue.length;
              setActualInput(prev => prev.slice(0, Math.max(prev.length - removeCount, 0)));
            } else if (rawValue.length > currentMaskLength) {
              const appended = rawValue.slice(currentMaskLength);
              appendValue(appended);
            } else if (rawValue.length === 0) {
              setActualInput('');
            }
          }
          break;
        }
      }
    } else {
      const rawValue = event.target.value;
      if (rawValue.length < currentMaskLength) {
        const removeCount = currentMaskLength - rawValue.length;
        setActualInput(prev => prev.slice(0, Math.max(prev.length - removeCount, 0)));
      } else if (rawValue.length > currentMaskLength) {
        const appended = rawValue.slice(currentMaskLength);
        appendValue(appended);
      } else if (rawValue.length === 0) {
        setActualInput('');
      }
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const position = input.value.length;
      input.setSelectionRange(position, position);
    }
  }, [actualInput]);

  const handleSubmit = () => {
    if (!themeId) {
      return;
    }

    const finalWord = actualInput.trim();
    if (!finalWord) {
      return;
    }

    if (finalWord.toUpperCase() === targetWord) {
      navigate(`/gameplay?theme=${themeId}`);
    } else {
      navigate(`/gameplay?theme=${themeId}&userWord=${encodeURIComponent(finalWord)}`);
    }
  };

  const displayText = targetWord.slice(0, Math.min(actualInput.length, targetWord.length));
  const lettersRevealed = displayText.length;

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
              ref={inputRef}
              type="text"
              value={displayText}
              onChange={handleInputChange}
              className="text-center text-2xl font-bold tracking-widest uppercase"
              placeholder=""
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              {lettersRevealed}/{targetWord.length} letras
            </p>
            <Button
              type="button"
              className="w-full text-lg font-semibold"
              onClick={handleSubmit}
              disabled={!actualInput.trim()}
            >
              Enviar
            </Button>
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
