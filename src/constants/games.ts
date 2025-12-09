// Game IDs for usage tracking
export const GAME_IDS = {
  MIND_READER: 1,
  MENTAL_CONVERSATION: 2,
  MYSTERY_WORD: 3,
  MY_EMOJIS: 4,
  PAPO_RETO: 5,
  MIX_DE_CARTAS: 6,
  RASPA_CARTA: 7,
  EU_JA_SABIA: 8,
  CARTA_MENTAL: 9,
  SUAS_PALAVRAS: 10,
  PONTA_DA_CARTA: 11,
  EU_JA_SABIA_2: 12,
  CARTA_PENSADA: 13,
} as const;

export type GameId = typeof GAME_IDS[keyof typeof GAME_IDS];

// Valid game IDs array for validation
export const VALID_GAME_IDS = Object.values(GAME_IDS);
