import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  InstructionsLayout,
  InstructionsCard,
  InstructionsSection,
  InstructionStep,
} from '@/components/InstructionsLayout';
import { ensureTodayGoogleMimeCode, type GoogleMimeCodeRecord } from '@/lib/googleMimeCode';
import { useTranslation } from '@/hooks/useTranslation';

const GoogleMimeInstructions = () => {
  const { t, language } = useTranslation();
  const [codeRecord, setCodeRecord] = useState<GoogleMimeCodeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps = t('googleMimeInstructions.steps') as string[];

  const loadCode = async () => {
    try {
      setLoading(true);
      const record = await ensureTodayGoogleMimeCode();
      setCodeRecord(record);
    } catch (err) {
      console.error(err);
      setError(t('googleMimeInstructions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCode();
  }, []);

  const formatDate = (dateString: string) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'it' ? 'it-IT' : language === 'zh-CN' ? 'zh-CN' : 'en-US';
    return new Date(dateString).toLocaleString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <InstructionsLayout
      icon={ShieldCheck}
      label={t('googleMimeInstructions.label')}
      title={t('googleMimeInstructions.title')}
      subtitle={t('googleMimeInstructions.subtitle')}
      backPath="/google-mime"
    >
      <InstructionsCard>
        <div className="space-y-6">
          <InstructionsSection title={t('googleMimeInstructions.codeOfTheDay')}>
            {loading ? (
              <p className="text-white/60">{t('googleMimeInstructions.loading')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-5xl font-semibold tracking-[0.2em] text-white">
                  {codeRecord?.code ?? '---'}
                </p>
                <p className="text-sm text-white/50">
                  {t('googleMimeInstructions.updatedAt')}{' '}
                  {codeRecord ? formatDate(codeRecord.generated_at) : '---'}
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </InstructionsSection>

          <InstructionsSection title={t('googleMimeInstructions.stepByStep')}>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <InstructionStep key={index} number={index + 1}>
                  {step}
                </InstructionStep>
              ))}
            </div>
          </InstructionsSection>
        </div>
      </InstructionsCard>
    </InstructionsLayout>
  );
};

export default GoogleMimeInstructions;
