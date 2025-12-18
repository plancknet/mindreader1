import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
} from '@/components/InstructionsLayout';

const Instructions = () => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('instructions.step4Title'),
      text: t('instructions.step4Text'),
    },
    {
      title: t('instructions.step1Title'),
      text: t('instructions.step1Text'),
    },
    {
      title: t('instructions.step2Title'),
      text: t('instructions.step2Text'),
    },
    {
      title: t('instructions.step3Title'),
      text: t('instructions.step3Text'),
    },
  ];

  return (
    <InstructionsLayout
      icon={Brain}
      label="Quadrante Magico"
      title={t('instructions.title')}
      subtitle={t('instructions.subtitle')}
      backPath="/"
      backLabel={t('common.understood')}
    >
      <InstructionsCard>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-[#7f13ec] font-semibold uppercase tracking-wider text-sm">
              {t('instructions.videoTitle')}
            </p>
            <p className="text-white/70 text-base">
              {t('instructions.videoDescription')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#7f13ec]/20 bg-black">
            <div className="relative w-full aspect-[9/16]">
              <video
                key="quadrante-demo"
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain"
              >
                <source src="/videos/Quadrante.mp4" type="video/mp4" />
                {t('instructions.videoTitle')}
              </video>
            </div>
          </div>
        </div>
      </InstructionsCard>

      <InstructionsCard>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-[#7f13ec] font-semibold uppercase tracking-wider text-sm">
              {t('instructions.videoTitle')}
            </p>
            <p className="text-white/70 text-base">
              {t('instructions.videoDescription')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#7f13ec]/20 bg-black">
            <div className="relative w-full aspect-[9/16]">
              <video
                key="quadrante-demo-2"
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain"
              >
                <source src="/videos/Quadrante2.mp4" type="video/mp4" />
                {t('instructions.videoTitle')}
              </video>
            </div>
          </div>
        </div>
      </InstructionsCard>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <InstructionsCard key={step.title}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#7f13ec]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#7f13ec]">{index + 1}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-white/70">{step.text}</p>
              </div>
            </div>
          </InstructionsCard>
        ))}
      </div>
    </InstructionsLayout>
  );
};

export default Instructions;
