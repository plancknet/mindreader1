import { useNavigate } from 'react-router-dom';
import { HeaderControls } from '@/components/HeaderControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';

const instructionsText = [
  'Nesta mágica, perceba que todas as cartas têm os naipes centrais apontando para cima. Por exemplo, veja no Ás de Espadas como o naipe parece uma seta apontando para cima. O mesmo ocorre para todas as outras cartas desta mágica.',
  'Assim que o usuário escolher uma das cartas e clicar em "Embaralhar", a carta escolhida será a única com o naipe apontando para baixo e você facilmente conseguirá identificar a carta escolhida pelo seu amigo.',
  'A única exceção é a carta 7 de Ouros. Caso o 7 de Ouros seja selecionado, o naipe central ao invés de estar na parte superior da carta, estará na parte inferior da carta.',
  'Pronto! Agora que o truque foi revelado, ensaie bastante antes de fazer com seus amigos.',
];

const highlightedCards: Array<{ rank: string; suit: SuitName; label: string }> = [
  { rank: 'A', suit: 'spades', label: 'Ás de Espadas' },
  { rank: 'A', suit: 'hearts', label: 'Ás de Copas' },
  { rank: '7', suit: 'clubs', label: '7 de Paus' },
  { rank: '7', suit: 'diamonds', label: '7 de Ouros' },
];

const PontaCartaInstructions = () => {
  const navigate = useNavigate();
  const cardPreviews = highlightedCards.map((card) => ({
    ...card,
    imageSrc: getCardImageSrc(card.rank, card.suit),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-8">
      <style>{`
        @keyframes cardFlip180 {
          0% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(360deg); }
          100% { transform: rotateZ(360deg); }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <HeaderControls />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-primary drop-shadow-lg" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Ponta da Carta</p>
          <h1 className="text-4xl font-bold text-foreground">Revelando o Segredo</h1>
          <p className="text-muted-foreground">Entenda o mecanismo antes de apresentar.</p>
        </div>

        <Card className="border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {instructionsText.map((paragraph) => (
              <p key={paragraph} className="text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="pt-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Observe a rotação dos naipes importantes
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {cardPreviews.map((card) => (
                  <div key={`${card.rank}-${card.suit}`} className="text-center space-y-2">
                    <div
                      className="relative mx-auto aspect-[7/10] w-full max-w-[120px] overflow-hidden rounded-2xl border border-primary/30 bg-black/40 shadow-lg shadow-primary/20"
                      style={{
                        animation: 'cardFlip180 6s linear infinite',
                        transformOrigin: 'center',
                      }}
                    >
                      {card.imageSrc ? (
                        <img
                          src={card.imageSrc}
                          alt={card.label}
                          className="h-full w-full select-none object-cover"
                          draggable={false}
                          style={{ backfaceVisibility: 'hidden' }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
                          {card.label}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/ponta-da-carta')}>
            Voltar para o jogo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PontaCartaInstructions;
