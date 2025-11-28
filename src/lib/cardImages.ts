export type SuitName = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export const deckRanks: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const deckSuits: SuitName[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const getCardImageIndex = (rank: string, suit: SuitName | null | undefined): number | null => {
  if (!suit) {
    return null;
  }

  const suitIndex = deckSuits.indexOf(suit);
  if (suitIndex === -1) {
    return null;
  }

  const rankIndex = deckRanks.indexOf(rank.toUpperCase());
  if (rankIndex === -1) {
    return null;
  }

  return suitIndex * deckRanks.length + rankIndex + 1;
};

export const getCardImageSrc = (rank: string, suit: SuitName | null | undefined): string | null => {
  const index = getCardImageIndex(rank, suit);
  return index ? `/baralho/${index}.webp` : null;
};
