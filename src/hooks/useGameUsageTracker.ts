import { useCallback, useRef } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';

export const useGameUsageTracker = (gameId: number) => {
  const { incrementUsage } = useUsageLimit();
  const hasTrackedRef = useRef(false);

  const trackUsage = useCallback(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    incrementUsage(gameId).catch((error) => {
      console.error('Erro ao registrar uso do jogo', error);
    });
  }, [incrementUsage, gameId]);

  const resetUsageTracking = useCallback(() => {
    hasTrackedRef.current = false;
  }, []);

  return { trackUsage, resetUsageTracking };
};
