import { useCallback, useRef } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';

interface GameUsageTrackerOptions {
  requireAuth?: boolean;
}

export const useGameUsageTracker = (gameId: number, options?: GameUsageTrackerOptions) => {
  const { incrementUsage } = useUsageLimit({
    requireAuth: options?.requireAuth ?? true,
  });
  const hasTrackedRef = useRef(false);

  const trackUsage = useCallback(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    if (typeof incrementUsage === 'function') {
      incrementUsage(gameId).catch((error) => {
        console.error('Erro ao registrar uso do jogo', error);
      });
    }
  }, [incrementUsage, gameId]);

  const resetUsageTracking = useCallback(() => {
    hasTrackedRef.current = false;
  }, []);

  return { trackUsage, resetUsageTracking };
};
