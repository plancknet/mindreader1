import { CheckCircle2, Shuffle, Smile, Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
} from '@/components/InstructionsLayout';

const steps = [
  {
    title: '1. Escolha 3 emojis',
    description: 'Mostre a matriz 3x3 de emojis aleatorios e peca para selecionar exatamente tres botoes.',
    icon: Smile,
  },
  {
    title: '2. Monte a matriz original',
    description: 'Exiba a linha com os tres emojis escolhidos. Eles serao usados em todas as referencias futuras.',
    icon: CheckCircle2,
  },
  {
    title: '3-5. Revele a previsao',
    description: 'Informe que apenas uma pessoa pode ver/registrar a previsao e diga: "O emoji 1 ficara comigo, o emoji 2 ficara no meio e o emoji 3 ficara com ele."',
    icon: Sparkles,
  },
  {
    title: '6. Embaralhe antes de avancar',
    description: 'Ainda na matriz original (1x3), use o botao "Embaralhar" quantas vezes quiser. Ao avancar, a matriz embaralhada e definida.',
    icon: Shuffle,
  },
  {
    title: '7. Selecione dois emojis',
    description: 'Na matriz embaralhada, peca para o participante ativar dois dos tres emojis.',
    icon: CheckCircle2,
  },
  {
    title: '8-9. Mova o emoji restante',
    description: 'Mostre a matriz final vazia. Se o emoji do meio da matriz original estiver entre os selecionados, o emoji que sobrou vai para a posicao 1,3; caso contrario, ele vai para a posicao 1,2.',
    icon: Smile,
  },
  {
    title: '10-12. Finalize a matriz',
    description: 'Peca para o participante escolher apenas um dos dois emojis selecionados. Aplique as regras: se for o emoji do meio original, ele vai para a posicao 1,2; senao, para 1,1. O emoji restante ocupa o espaco vazio.',
    icon: CheckCircle2,
  },
  {
    title: '13. Hora da revelacao',
    description: 'Se o emoji da posicao 1,1 original continuar em 1,1 na matriz final, leia a revelacao em voz alta. Caso contrario, seu amigo faz a leitura.',
    icon: Sparkles,
  },
];

const MyEmojisInstructions = () => {
  return (
    <InstructionsLayout
      icon={Smile}
      label="Meus Emojis"
      title="Instrucoes - Meus Emojis"
      subtitle="Estruture o efeito usando tres areas: instrucoes, matrizes e botoes."
      backPath="/my-emojis"
      backLabel="Comecar agora"
    >
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <InstructionsCard key={step.title}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-[#7f13ec]/20">
                  <Icon className="h-6 w-6 text-[#7f13ec]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-white/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </InstructionsCard>
          );
        })}
      </div>
    </InstructionsLayout>
  );
};

export default MyEmojisInstructions;
