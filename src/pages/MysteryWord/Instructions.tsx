import { Brain, Type, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  InstructionsLayout,
  InstructionsCard,
} from '@/components/InstructionsLayout';

const MysteryWordInstructions = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Brain, title: t('mysteryWordInstructions.step1Title'), text: t('mysteryWordInstructions.step1Text') },
    { icon: Type, title: t('mysteryWordInstructions.step2Title'), text: t('mysteryWordInstructions.step2Text') },
    { icon: Sparkles, title: t('mysteryWordInstructions.step3Title'), text: t('mysteryWordInstructions.step3Text') },
  ];

  return (
    <InstructionsLayout
      icon={Sparkles}
      label="Palavra Misteriosa"
      title={t('mysteryWordInstructions.title')}
      subtitle={t('mysteryWordInstructions.subtitle')}
      backPath="/mystery-word"
      backLabel={t('common.understood')}
    >
      <InstructionsCard>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-[#7f13ec] font-semibold uppercase tracking-wider text-sm">
              {t('mysteryWordInstructions.videoTitle')}
            </p>
            <p className="text-white/70 text-base">
              {t('mysteryWordInstructions.videoDescription')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#7f13ec]/20 bg-black">
            <div className="relative w-full aspect-[9/16]">
              <video
                key="palavra-demo"
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain"
              >
                <source src="/videos/Palavra.mp4" type="video/mp4" />
                {t('mysteryWordInstructions.videoTitle')}
              </video>
            </div>
          </div>
        </div>
      </InstructionsCard>

      <div className="space-y-4">
        {steps.map(({ icon: Icon, title, text }) => (
          <InstructionsCard key={title}>
            <div className="flex items-start gap-4">
              <div className="bg-[#7f13ec]/20 p-3 rounded-full">
                <Icon className="h-6 w-6 text-[#7f13ec]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
                <p className="text-white/70">{text}</p>
              </div>
            </div>
          </InstructionsCard>
        ))}
      </div>
    </InstructionsLayout>
  );
};

export default MysteryWordInstructions;
