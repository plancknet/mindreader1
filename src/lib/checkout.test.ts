import { describe, expect, it } from 'vitest';
import { OFFER_PRICES, currencyForLanguage, priceLabel } from './checkout';

describe('offer prices', () => {
  it('Portuguese visitors pay R$ 19,90 and R$ 8,90 for the add-on', () => {
    expect(currencyForLanguage('pt-BR')).toBe('brl');
    expect(OFFER_PRICES.brl.MAIN).toBe(19.9);
    expect(OFFER_PRICES.brl.EJS2).toBe(8.9);
    expect(priceLabel('MAIN', 'pt-BR')).toBe('R$ 19,90');
    expect(priceLabel('EJS2', 'pt-BR')).toBe('R$ 8,90');
  });

  it('other languages pay $9.99 and $3.99 for the add-on', () => {
    expect(currencyForLanguage('en')).toBe('usd');
    expect(priceLabel('MAIN', 'en')).toBe('$9.99');
    expect(priceLabel('EJS2', 'en')).toBe('$3.99');
  });
});
