// Game access control for the lifetime offer.
//
// Rules:
// - FREE: no tricks inside the app (the free taste is the public demo/quiz)
// - STANDARD (one-time lifetime purchase): every trick except Eu Já Sabia 2
// - Eu Já Sabia 2: requires the add-on purchase (or a legacy INFLUENCER subscription)
// - INFLUENCER (legacy subscribers): everything

import { GAME_IDS } from '@/constants/games';

export type SubscriptionTier = 'FREE' | 'STANDARD' | 'INFLUENCER';

export interface GameAccessResult {
  canAccess: boolean;
  isUnlimited: boolean;
  usageCount: number;
  usageLimit: number | null; // null = unlimited
  reason: 'UNLIMITED' | 'LIMITED' | 'BLOCKED' | 'LIMIT_REACHED';
  /** What the user needs to buy to open this trick */
  requires?: 'MAIN' | 'EJS2';
}

export function checkGameAccess(
  tier: SubscriptionTier,
  gameId: number,
  hasEuJaSabia2: boolean = false,
  gameUsageCount: number = 0,
): GameAccessResult {
  const unlimited: GameAccessResult = {
    canAccess: true,
    isUnlimited: true,
    usageCount: gameUsageCount,
    usageLimit: null,
    reason: 'UNLIMITED',
  };
  const blocked = (requires: 'MAIN' | 'EJS2'): GameAccessResult => ({
    canAccess: false,
    isUnlimited: false,
    usageCount: gameUsageCount,
    usageLimit: 0,
    reason: 'BLOCKED',
    requires,
  });

  if (tier === 'INFLUENCER') return unlimited;
  if (tier === 'STANDARD') {
    if (gameId === GAME_IDS.EU_JA_SABIA_2 && !hasEuJaSabia2) return blocked('EJS2');
    return unlimited;
  }
  return blocked('MAIN');
}

export function hasMainProduct(tier: SubscriptionTier): boolean {
  return tier === 'STANDARD' || tier === 'INFLUENCER';
}
