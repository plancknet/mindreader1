import { CheckCircle2, Shuffle, Smile, Sparkles } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
} from '@/components/InstructionsLayout';

const steps = [
  {
    title: '1. Escolha 3 emojis',
    description: 'Mostre a matriz 3x3 de emojis aleatórios e peça para selecionar exatamente três botões.',
    icon: Smile,
  },
  {
    title: '2. Monte a matriz original',
    description: 'Exiba a linha com os três emojis escolhidos. Eles serão usados em todas as referências futuras.',
    icon: CheckCircle2,
  },
  {
    title: '3-5. Revele a previsão',
    description: 'Informe que apenas uma pessoa pode ver/registrar a previsão e diga: "O emoji 1 ficará comigo, o emoji 2 ficará no meio e o emoji 3 ficará com ele."',
    icon: Sparkles,
  },
  {
    title: '6. Embaralhe antes de avancar',
    description: 'Ainda na matriz original (1x3), use o botão "Embaralhar" quantas vezes quiser. Ao avançar, a matriz embaralhada é definida.',
    icon: Shuffle,
  },
  {
    title: '7. Selecione dois emojis',
    description: 'Na matriz embaralhada, peça para o participante ativar dois dos três emojis.',
    icon: CheckCircle2,
  },
  {
    title: '8-9. Mova o emoji restante',
    description: 'Mostre a matriz final vazia. Se o emoji do meio da matriz original estiver entre os selecionados, o emoji que sobrou vai para a posição 1,3; caso contrário, ele vai para a posição 1,2.',
    icon: Smile,
  },
  {
    title: '10-12. Finalize a matriz',
    description: 'Peça para o participante escolher apenas um dos dois emojis selecionados. Aplique as regras: se for o emoji do meio original, ele vai para a posição 1,2; senão, para 1,1. O emoji restante ocupa o espaço vazio.',
    icon: CheckCircle2,
  },
  {
    title: '13. Hora da revelacao',
    description: 'Se o emoji da posição 1,1 original continuar em 1,1 na matriz final, leia a revelação em voz alta. Caso contrário, seu amigo faz a leitura.',
    icon: Sparkles,
  },
];

const MyEmojisInstructions = () => {
  return (
    <InstructionsLayout
      icon={Smile}
      label="Meus Emojis"
      title="Instruções - Meus Emojis"
      subtitle="Estruture o efeito usando três áreas: instruções, matrizes e botões."
      backPath="/my-emojis"
      backLabel="Começar agora"
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


