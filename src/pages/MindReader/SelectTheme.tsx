import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { themes } from '@/data/themes';
import { Brain } from 'lucide-react';

const SelectTheme = () => {
  const navigate = useNavigate();

  const handleThemeSelect = (themeId: string) => {
    navigate(`/gameplay?theme=${themeId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            O que está pensando?
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha uma categoria e pense em uma palavra
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className="p-8 hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="text-center space-y-4">
                <div className="text-7xl">{theme.emoji}</div>
                <h2 className="text-2xl font-bold">{theme.name}</h2>
                <Button className="w-full" variant="outline">
                  Selecionar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            💡 Dica: Pense em uma palavra assim que vir as opções
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectTheme;
