import { MessageSquare, Type, Sparkles, Volume2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  InstructionsLayout,
  InstructionsCard,
} from '@/components/InstructionsLayout';

const MentalConversationInstructions = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: MessageSquare, title: t('mentalConversationInstructions.step1Title'), text: t('mentalConversationInstructions.step1Text') },
    { icon: Type, title: t('mentalConversationInstructions.step2Title'), text: t('mentalConversationInstructions.step2Text') },
    { icon: Sparkles, title: t('mentalConversationInstructions.step3Title'), text: t('mentalConversationInstructions.step3Text') },
    { icon: Volume2, title: t('mentalConversationInstructions.step4Title'), text: t('mentalConversationInstructions.step4Text') },
  ];

  return (
    <InstructionsLayout
      icon={MessageSquare}
      label="Conversa Mental"
      title={t('mentalConversationInstructions.title')}
      subtitle={t('mentalConversationInstructions.subtitle')}
      backPath="/mental-conversation"
      backLabel={t('common.understood')}
    >
      <InstructionsCard>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-[#7f13ec] font-semibold uppercase tracking-wider text-sm">
              {t('mentalConversationInstructions.videoTitle')}
            </p>
            <p className="text-white/70 text-base">
              {t('mentalConversationInstructions.videoDescription')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#7f13ec]/20 bg-black">
            <div className="relative w-full aspect-[9/16]">
              <video
                key="conversa-demo"
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain"
              >
                <source src="/videos/Conversa.mp4" type="video/mp4" />
                {t('mentalConversationInstructions.videoTitle')}
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

export default MentalConversationInstructions;
