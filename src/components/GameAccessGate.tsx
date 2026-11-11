import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { checkGameAccess } from '@/lib/gameAccess';

/** Sends people who haven't bought a trick to the purchase page instead of opening it. */
export const GameAccessGate = ({ gameId, children }: { gameId: number; children: ReactNode }) => {
  const { tier, hasEuJaSabia2, loading } = useSubscriptionTier();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-magic" />
      </div>
    );
  }

  if (isAdmin) return <>{children}</>;

  const access = checkGameAccess(tier, gameId, hasEuJaSabia2);
  if (!access.canAccess) {
    return (
      <Navigate
        to="/premium"
        replace
        state={{ blockReason: access.requires === 'EJS2' ? 'needs_ejs2' : 'needs_main' }}
      />
    );
  }
  return <>{children}</>;
};
