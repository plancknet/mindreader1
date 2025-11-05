import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageLimitData {
  canUse: boolean;
  isPremium: boolean;
  usageCount: number;
  freeLimit: number;
  reason: string;
}

export const useUsageLimit = () => {
  const [usageData, setUsageData] = useState<UsageLimitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkUsageLimit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('check-usage-limit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (invokeError) throw invokeError;

      setUsageData(data);
    } catch (err: any) {
      console.error('Error checking usage limit:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementUsage = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('increment-usage', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (invokeError) throw invokeError;

      // Refresh usage data after increment
      await checkUsageLimit();

      return data;
    } catch (err: any) {
      console.error('Error incrementing usage:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkUsageLimit();
  }, []);

  return {
    usageData,
    isLoading,
    error,
    checkUsageLimit,
    incrementUsage,
  };
};
