// Game IDs for usage tracking
export const GAME_IDS = {
  MIND_READER: 1,
  MENTAL_CONVERSATION: 2,
  MYSTERY_WORD: 3,
  MY_EMOJIS: 4,
  PAPO_RETO: 5,
  EU_JA_SABIA: 6,
} as const;

export type GameId = typeof GAME_IDS[keyof typeof GAME_IDS];
