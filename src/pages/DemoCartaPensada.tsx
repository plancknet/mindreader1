import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCardImageSrc } from '@/lib/cardImages';
import type { SuitName } from '@/lib/cardImages';
import { Sparkles, ChevronLeft, ChevronRight, Wand2, Eye, Grid3X3, MessageSquare, Search, Hash, Smile, Brain, Layers, CreditCard, Eraser, Type, ShoppingCart } from 'lucide-react';

type PlayingCard = {
  rank: string;
  suit: SuitName;
  label: string;
  imageSrc: string | null;
};

const suits: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const TOTAL_ROUNDS = 3;
const fontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const buildFullDeck = (): PlayingCard[] => {
  const labels: Record<SuitName, string> = {
    spades: 'Espadas', hearts: 'Copas', diamonds: 'Ouros', clubs: 'Paus',
  };
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      rank, suit, label: `${rank} de ${labels[suit]}`,
      imageSrc: getCardImageSrc(rank, suit),
    })),
  );
};

const fullDeck = buildFullDeck();
const getRandomDeck = () => {
  const shuffled = [...fullDeck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 21);
};

const buildColumns = (deck: PlayingCard[]) => {
  const columns: PlayingCard[][] = [[], [], []];
  deck.forEach((card, index) => {
    columns[index % 3][Math.floor(index / 3)] = card;
  });
  return columns;
};

const performStacking = (currentDeck: PlayingCard[], selectedColumn: number) => {
  const cols = buildColumns(currentDeck);
  const stacks = cols.map((column) => [...column].reverse());
  const remaining = [0, 1, 2].filter((col) => col !== selectedColumn);
  const newPile = [...stacks[remaining[0]], ...stacks[selectedColumn], ...stacks[remaining[1]]];
  const flipped = [...newPile].reverse();
  const redealt: PlayingCard[][] = [[], [], []];
  flipped.forEach((card, index) => {
    redealt[index % 3][Math.floor(index / 3)] = card;
  });
  const nextDeck: PlayingCard[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 3; col++) {
      nextDeck.push(redealt[col][row]);
    }
  }
  return nextDeck;
};

// Trick catalog data
const tricksCatalog = [
  { icon: CreditCard, title: 'Ponta da Carta', description: 'Selecione cartas especiais e revele apenas a ponta. Surpreenda com um truque visual rápido e impactante.', difficulty: 1 },
  { icon: Eye, title: 'Oi Sumida', description: 'Grid de cartas com embaralhamento instantâneo. A carta desaparece diante dos olhos de todos!', difficulty: 1 },
  { icon: Grid3X3, title: 'Jogo da Velha Bruxa', description: 'Desafie qualquer pessoa em um duelo místico de X e O — a bruxa nunca perde!', difficulty: 2 },
  { icon: Search, title: 'Palavra Misteriosa', description: 'Revele secretamente a palavra pensada pelo público usando telepatia digital.', difficulty: 2 },
  { icon: Type, title: 'Suas Palavras', description: 'Use cinco palavras pessoais para revelar o segredo mais profundo da mente.', difficulty: 2 },
  { icon: Smile, title: 'Meus Emojis', description: 'Descubra de quem é cada emoji em uma dinâmica divertida e surpreendente.', difficulty: 2 },
  { icon: Brain, title: 'Quadrante Mágico', description: 'Em qual quadrante está a palavra escolhida? Detecção por movimento de cabeça!', difficulty: 3 },
  { icon: MessageSquare, title: 'Conversa Mental', description: 'Converse com uma IA que lê a mente e adivinha a palavra pensada.', difficulty: 3 },
  { icon: Layers, title: 'Mix de Cartas', description: 'Conecte a sua mente e descubra a carta escolhida em um embaralhamento mágico.', difficulty: 3 },
  { icon: Wand2, title: 'Carta Mental', description: 'Transmita mentalmente a carta escolhida usando o verso personalizado do MindReader.', difficulty: 4 },
  { icon: Eraser, title: 'Raspa Carta', description: 'Raspe a tela digital para revelar o rei, dama ou valete secreto.', difficulty: 4 },
  { icon: Hash, title: 'Eu Já Sabia 2', description: 'Revele o número pensado usando máscaras ilustradas. Surpreenda com a previsão!', difficulty: 5 },
  { icon: Search, title: 'Google Mime', description: 'Simule uma pesquisa no Google e revele a celebridade pensada em tempo real.', difficulty: 5 },
];

const difficultyLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Intermediário',
  3: 'Avançado',
  4: 'Expert',
  5: 'Mestre',
};

const difficultyColors: Record<number, string> = {
  1: 'bg-green-500/20 text-green-400 border-green-500/30',
  2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  5: 'bg-red-500/20 text-red-400 border-red-500/30',
};

type Phase = 'welcome' | 'rounds' | 'reveal' | 'catalog';

const DemoCartaPensada = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [currentTrick, setCurrentTrick] = useState(0);
  const [revealAnimation, setRevealAnimation] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const initDeck = useCallback(() => {
    setDeck(getRandomDeck());
    setRound(1);
    setSelectedColumn(null);
    setIsProcessing(false);
  }, []);

  const startOnboarding = () => {
    initDeck();
    setPhase('rounds');
  };

  const columns = useMemo(() => buildColumns(deck), [deck]);
  const finalCard = deck[10] ?? null;

  const processSelection = (columnIndex: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedColumn(columnIndex);

    setTimeout(() => {
      setDeck((prev) => performStacking(prev, columnIndex));
      if (round === TOTAL_ROUNDS) {
        setRevealAnimation(true);
        setTimeout(() => setPhase('reveal'), 400);
      } else {
        setRound((prev) => prev + 1);
        setSelectedColumn(null);
      }
      setIsProcessing(false);
    }, 600);
  };

  const goToCatalog = () => {
    setCurrentTrick(0);
    setPhase('catalog');
  };

  const handleBuyNow = () => {
    // Fire Google Ads conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: 'AW-1052545747/auOdCIPsot0bENOl8vUD',
      });
    }
    navigate('/auth');
  };

  // ─── WELCOME ───
  if (phase === 'welcome') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground" style={{ fontFamily }}>
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center gap-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-[#7f13ec]" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Vamos ler sua mente?
            </h1>
          </div>

          <p className="max-w-md text-lg text-muted-foreground">
            Pense em uma carta de baralho. Memorize-a bem. Em 3 rodadas, vou descobrir exatamente qual carta você pensou.
          </p>

          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#7f13ec]/40 bg-[#7f13ec]/10 text-sm font-semibold text-[#7f13ec]">
                  {n}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">3 rodadas · Escolha a coluna com sua carta</p>
          </div>

          <Button
            onClick={startOnboarding}
            size="lg"
            className="rounded-2xl bg-[#7f13ec] px-10 py-6 text-lg font-semibold text-white hover:bg-[#6b0fd0] shadow-[0_0_30px_rgba(127,19,236,0.4)]"
          >
            Começar ✨
          </Button>
        </div>
      </div>
    );
  }

  // ─── CARD ROUNDS ───
  if (phase === 'rounds') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground" style={{ fontFamily }}>
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col px-4 pt-6 pb-6">
          {/* Round indicator */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    n === round
                      ? 'bg-[#7f13ec] text-white shadow-[0_0_15px_rgba(127,19,236,0.5)] scale-110'
                      : n < round
                        ? 'bg-[#7f13ec]/30 text-[#7f13ec]'
                        : 'border border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Rodada {round} de 3 — Toque na coluna onde está sua carta
            </p>
          </div>

          {/* Cards grid */}
          <div className="mx-auto grid w-full max-w-lg grid-cols-3 gap-3 rounded-3xl border border-[#7f13ec]/10 bg-card/50 p-4 shadow-xl backdrop-blur">
            {columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                role="button"
                tabIndex={isProcessing ? -1 : 0}
                onClick={() => !isProcessing && processSelection(columnIndex)}
                onKeyDown={(e) => {
                  if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    processSelection(columnIndex);
                  }
                }}
                className={`flex flex-col gap-1.5 rounded-2xl border p-2 transition-all ${
                  selectedColumn === columnIndex
                    ? 'border-[#7f13ec]/60 bg-[#7f13ec]/10 ring-2 ring-[#7f13ec]/40'
                    : isProcessing
                      ? 'cursor-not-allowed border-border/30 opacity-50'
                      : 'cursor-pointer border-border/30 hover:border-[#7f13ec]/40 hover:bg-[#7f13ec]/5'
                }`}
              >
                {column.map((card) => (
                  <Card
                    key={`${card.rank}-${card.suit}`}
                    className="mx-auto aspect-[7/10] w-full max-w-[56px] overflow-hidden rounded-lg border-0 bg-transparent shadow-sm sm:max-w-[64px]"
                  >
                    <img
                      src={card.imageSrc || '/placeholder.svg'}
                      alt={card.label}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── REVEAL ───
  if (phase === 'reveal' && finalCard) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground" style={{ fontFamily }}>
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/25 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="animate-bounce">
            <Sparkles className="h-12 w-12 text-[#7f13ec]" />
          </div>

          <h2 className="text-3xl font-bold sm:text-4xl">A sua carta é...</h2>

          <Card className="aspect-[7/10] w-52 overflow-hidden rounded-3xl border border-[#7f13ec]/40 bg-transparent shadow-[0_25px_60px_rgba(127,19,236,0.3)] transition-transform hover:scale-105 sm:w-60">
            <img
              src={finalCard.imageSrc || '/placeholder.svg'}
              alt={finalCard.label}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </Card>

          <p className="text-xl font-semibold text-[#7f13ec]">{finalCard.label}</p>

          <p className="max-w-sm text-muted-foreground">
            Impressionante, né? Isso é apenas <strong>1 de 14 truques</strong> disponíveis no MindReader. Conheça os outros!
          </p>

          <Button
            onClick={goToCatalog}
            size="lg"
            className="rounded-2xl bg-[#7f13ec] px-10 py-6 text-lg font-semibold text-white hover:bg-[#6b0fd0] shadow-[0_0_30px_rgba(127,19,236,0.4)]"
          >
            Ver todos os truques →
          </Button>
        </div>
      </div>
    );
  }

  // ─── CATALOG ───
  const trick = tricksCatalog[currentTrick];
  const TrickIcon = trick.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground" style={{ fontFamily }}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 pt-8 pb-32">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Isso é só o começo...</h2>
          <p className="mt-2 text-muted-foreground">
            São <strong>14 truques</strong> para você surpreender em qualquer momento
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentTrick + 1} de {tricksCatalog.length}
          </p>
        </div>

        {/* Trick card */}
        <div className="mx-auto w-full max-w-md">
          <Card className="overflow-hidden rounded-3xl border border-[#7f13ec]/20 bg-card/80 p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7f13ec]/15 shadow-[0_0_20px_rgba(127,19,236,0.2)]">
                <TrickIcon className="h-8 w-8 text-[#7f13ec]" />
              </div>

              <div>
                <h3 className="text-xl font-bold">{trick.title}</h3>
                <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${difficultyColors[trick.difficulty]}`}>
                  Nível {trick.difficulty} · {difficultyLabels[trick.difficulty]}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{trick.description}</p>
            </div>
          </Card>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentTrick((prev) => Math.max(0, prev - 1))}
              disabled={currentTrick === 0}
              className="rounded-xl gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>

            {/* Dots */}
            <div className="flex gap-1">
              {tricksCatalog.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrick(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentTrick ? 'w-6 bg-[#7f13ec]' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentTrick((prev) => Math.min(tricksCatalog.length - 1, prev + 1))}
              disabled={currentTrick === tricksCatalog.length - 1}
              className="rounded-xl gap-1"
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#7f13ec]/10 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <Button
          onClick={handleBuyNow}
          size="lg"
          className="w-full rounded-2xl bg-[#7f13ec] py-6 text-lg font-bold text-white hover:bg-[#6b0fd0] shadow-[0_0_30px_rgba(127,19,236,0.4)] gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Comprar Agora — R$ 29,90
        </Button>
      </div>
    </div>
  );
};

export default DemoCartaPensada;
