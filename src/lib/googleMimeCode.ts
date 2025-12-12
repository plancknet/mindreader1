import { supabase } from '@/integrations/supabase/client';

const TABLE = 'google_mime_codes';

export type GoogleMimeCodeRecord = {
  id: number;
  code: string;
  generated_at: string;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const generateRandomCode = () => Math.floor(100 + Math.random() * 900).toString();

export const fetchLatestGoogleMimeCode = async (): Promise<GoogleMimeCodeRecord | null> => {
  const { data, error } = await supabase
    .from<GoogleMimeCodeRecord>(TABLE)
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export const generateGoogleMimeCode = async (): Promise<GoogleMimeCodeRecord> => {
  const newCode = generateRandomCode();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ code: newCode })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as GoogleMimeCodeRecord;
};

export const ensureTodayGoogleMimeCode = async (): Promise<GoogleMimeCodeRecord> => {
  const latest = await fetchLatestGoogleMimeCode();
  if (latest) {
    const generatedAt = new Date(latest.generated_at);
    if (generatedAt >= startOfToday()) {
      return latest;
    }
  }

  return generateGoogleMimeCode();
};

export const verifyGoogleMimeCode = async (code: string): Promise<boolean> => {
  if (!code || code.length !== 3) return false;

  const { data, error } = await supabase
    .from(TABLE)
    .select('generated_at')
    .eq('code', code)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return false;
  }

  const generatedAt = new Date(data.generated_at);
  return generatedAt >= startOfToday();
};
