// Game access control based on subscription tier and difficulty level
// 
// Rules:
// - FREE: Difficulty 1 = unlimited, Difficulty 2-3 = 3 uses each, Difficulty 4-5 = blocked
// - STANDARD: Difficulty 1-4 = unlimited, Difficulty 5 = blocked
// - INFLUENCER: All difficulties = unlimited

export type SubscriptionTier = 'FREE' | 'STANDARD' | 'INFLUENCER';

export const FREE_LIMIT_PER_GAME = 3;

// Difficulty levels that are limited (not unlimited) for FREE tier
export const FREE_LIMITED_DIFFICULTIES = [2, 3];

// Difficulty levels blocked for each tier
export const BLOCKED_DIFFICULTIES: Record<SubscriptionTier, number[]> = {
  FREE: [4, 5],
  STANDARD: [5],
  INFLUENCER: [],
};

// Difficulty levels that are unlimited for each tier
export const UNLIMITED_DIFFICULTIES: Record<SubscriptionTier, number[]> = {
  FREE: [1],
  STANDARD: [1, 2, 3, 4],
  INFLUENCER: [1, 2, 3, 4, 5],
};

export interface GameAccessResult {
  canAccess: boolean;
  isUnlimited: boolean;
  usageCount: number;
  usageLimit: number | null; // null = unlimited
  reason: 'UNLIMITED' | 'LIMITED' | 'BLOCKED' | 'LIMIT_REACHED';
}

/**
 * Determines if a user can access a game based on their tier, game difficulty, and usage
 */
export function checkGameAccess(
  tier: SubscriptionTier,
  difficulty: number,
  gameUsageCount: number = 0
): GameAccessResult {
  // Check if difficulty is blocked for this tier
  if (BLOCKED_DIFFICULTIES[tier].includes(difficulty)) {
    return {
      canAccess: false,
      isUnlimited: false,
      usageCount: gameUsageCount,
      usageLimit: 0,
      reason: 'BLOCKED',
    };
  }

  // Check if difficulty is unlimited for this tier
  if (UNLIMITED_DIFFICULTIES[tier].includes(difficulty)) {
    return {
      canAccess: true,
      isUnlimited: true,
      usageCount: gameUsageCount,
      usageLimit: null,
      reason: 'UNLIMITED',
    };
  }

  // For FREE tier with limited difficulties (2, 3)
  if (tier === 'FREE' && FREE_LIMITED_DIFFICULTIES.includes(difficulty)) {
    const canUse = gameUsageCount < FREE_LIMIT_PER_GAME;
    return {
      canAccess: canUse,
      isUnlimited: false,
      usageCount: gameUsageCount,
      usageLimit: FREE_LIMIT_PER_GAME,
      reason: canUse ? 'LIMITED' : 'LIMIT_REACHED',
    };
  }

  // Default: unlimited access
  return {
    canAccess: true,
    isUnlimited: true,
    usageCount: gameUsageCount,
    usageLimit: null,
    reason: 'UNLIMITED',
  };
}

/**
 * Get the minimum tier required for a difficulty level
 */
export function getMinTierForDifficulty(difficulty: number): SubscriptionTier {
  if (difficulty <= 3) return 'FREE';
  if (difficulty === 4) return 'STANDARD';
  return 'INFLUENCER'; // difficulty 5
}

/**
 * Check if a tier meets the minimum requirement
 */
export function tierMeetsMinimum(userTier: SubscriptionTier, minTier: SubscriptionTier): boolean {
  const tierRank: Record<SubscriptionTier, number> = {
    FREE: 0,
    STANDARD: 1,
    INFLUENCER: 2,
  };
  return tierRank[userTier] >= tierRank[minTier];
}
