import { describe, expect, it } from 'vitest';
import { checkGameAccess } from './gameAccess';
import { GAME_IDS } from '@/constants/games';

describe('lifetime offer access rules', () => {
  it('free users cannot open any trick in the app', () => {
    expect(checkGameAccess('FREE', GAME_IDS.CARTA_PENSADA).canAccess).toBe(false);
    expect(checkGameAccess('FREE', GAME_IDS.CARTA_PENSADA).requires).toBe('MAIN');
  });

  it('the R$ 19,90 purchase opens every trick except Eu Já Sabia 2', () => {
    expect(checkGameAccess('STANDARD', GAME_IDS.GOOGLE_MIME).canAccess).toBe(true);
    expect(checkGameAccess('STANDARD', GAME_IDS.EU_JA_SABIA).canAccess).toBe(true);
    expect(checkGameAccess('STANDARD', GAME_IDS.PAPO_RETO).canAccess).toBe(true);
    const ejs2 = checkGameAccess('STANDARD', GAME_IDS.EU_JA_SABIA_2);
    expect(ejs2.canAccess).toBe(false);
    expect(ejs2.requires).toBe('EJS2');
  });

  it('the Eu Já Sabia 2 add-on unlocks it for buyers', () => {
    expect(checkGameAccess('STANDARD', GAME_IDS.EU_JA_SABIA_2, true).canAccess).toBe(true);
  });

  it('legacy influencer subscribers keep everything', () => {
    expect(checkGameAccess('INFLUENCER', GAME_IDS.EU_JA_SABIA_2).canAccess).toBe(true);
  });
});
