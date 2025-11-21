import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageLimitData {
  canUse: boolean;
  isPremium: boolean;
  usageCount: number;
  freeLimit: number;
  subscriptionTier?: 'FREE' | 'STANDARD' | 'INFLUENCER';
  planConfirmed?: boolean;
  couponGenerated?: boolean;
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

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // Session expired or invalid, try to refresh
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          setIsLoading(false);
          // Redirect to auth page
          window.location.href = '/auth';
          return;
        }
      }

      const currentSession = await supabase.auth.getSession();
      if (!currentSession.data.session) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('check-usage-limit', {
        headers: {
          Authorization: `Bearer ${currentSession.data.session.access_token}`,
        },
      });

      if (invokeError) {
        // Handle 401 errors specifically
        if (invokeError.message?.includes('401') || invokeError.message?.includes('Sessão')) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          window.location.href = '/auth';
          return;
        }
        throw invokeError;
      }

      setUsageData(data);
    } catch (err: any) {
      console.error('Error checking usage limit:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementUsage = async (game_id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      if (!game_id || ![1, 2, 3, 4].includes(game_id)) {
        throw new Error('game_id inválido. Deve ser 1, 2, 3 ou 4');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('increment-usage', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          game_id,
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
