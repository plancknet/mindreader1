import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionStep,
  InstructionsSection,
  InstructionNote,
} from '@/components/InstructionsLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const numberRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', '0', '0'],
];

const EuJaSabia2Instructions = () => {
  const { t } = useTranslation();
  const [adminVideoSrc, setAdminVideoSrc] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);

  const videoSteps = t('euJaSabia2Instructions.videoSteps') as string[];
  const maskSteps = t('euJaSabia2Instructions.maskSteps') as string[];
  const executionSteps = t('euJaSabia2Instructions.executionSteps') as string[];

  useEffect(() => {
    const loadAdminVideo = async () => {
      try {
        const { data: adminRole, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError || !adminRole?.user_id) {
          setAdminVideoSrc(null);
          return;
        }

        const { data, error: videoError } = await supabase
          .from('user_videos')
          .select('video_data')
          .eq('user_id', adminRole.user_id)
          .maybeSingle();

        if (videoError) {
          setAdminVideoSrc(null);
          return;
        }

        setAdminVideoSrc(data?.video_data ?? null);
      } catch (error) {
        console.error('Error loading admin video', error);
        setAdminVideoSrc(null);
      } finally {
        setLoadingVideo(false);
      }
    };

    void loadAdminVideo();
  }, []);

  return (
    <InstructionsLayout
      icon={Play}
      label={t('euJaSabia2Instructions.label')}
      title={t('euJaSabia2Instructions.title')}
      subtitle={t('euJaSabia2Instructions.subtitle')}
      backPath="/eu-ja-sabia-2"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title={t('euJaSabia2Instructions.videoTitle')}>
            <div className="space-y-3">
              <InstructionStep number={1}>{videoSteps[0]}</InstructionStep>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                {loadingVideo ? (
                  <div className="flex items-center justify-center text-sm text-white/60">
                    {t('euJaSabia2Instructions.loadingVideo')}
                  </div>
                ) : adminVideoSrc ? (
                  <video
                    src={adminVideoSrc}
                    className="w-full rounded-xl"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="flex items-center justify-center text-sm text-white/60">
                    {t('euJaSabia2Instructions.videoUnavailable')}
                  </div>
                )}
              </div>
              <InstructionStep number={2}>{videoSteps[1]}</InstructionStep>
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('euJaSabia2Instructions.maskTitle')}>
            <div className="space-y-3">
              {maskSteps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>

          <InstructionsSection title={t('euJaSabia2Instructions.executionTitle')}>
            <div className="space-y-3">
              {executionSteps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>

            <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-3 pt-4">
              {numberRows.flat().map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-semibold text-white/80"
                >
                  {value}
                </div>
              ))}
            </div>

            <InstructionNote>
              {t('euJaSabia2Instructions.tip')}
            </InstructionNote>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default EuJaSabia2Instructions;
