import { supabase } from '@/integrations/supabase/client';

export type OfferItem = 'MAIN' | 'EJS2';
export type OfferCurrency = 'brl' | 'usd';

const PENDING_KEY = 'mindreader.pendingCheckout';

/** Display prices for the lifetime offer. Portuguese pays in BRL, everyone else in USD. */
export const OFFER_PRICES: Record<OfferCurrency, Record<OfferItem, number>> = {
  brl: { MAIN: 19.9, EJS2: 8.9 },
  usd: { MAIN: 9.99, EJS2: 3.99 },
};

/** "Was" prices shown crossed out on the offer. */
export const OFFER_ANCHOR_PRICES: Record<OfferCurrency, number> = {
  brl: 97,
  usd: 29.99,
};

export const currencyForLanguage = (language: string): OfferCurrency =>
  language.toLowerCase().startsWith('pt') ? 'brl' : 'usd';

export const formatPrice = (amount: number, currency: OfferCurrency): string =>
  currency === 'brl'
    ? `R$ ${amount.toFixed(2).replace('.', ',')}`
    : `$${amount.toFixed(2)}`;

export const priceLabel = (item: OfferItem, language: string): string => {
  const currency = currencyForLanguage(language);
  return formatPrice(OFFER_PRICES[currency][item], currency);
};

export const savePendingCheckout = (items: OfferItem[]) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ items, at: Date.now() }));
  } catch {
    /* ignore */
  }
};

/** Returns and clears a checkout the visitor started before signing in (valid for 2 hours). */
export const takePendingCheckout = (): OfferItem[] | null => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw) as { items?: OfferItem[]; at?: number };
    if (!parsed.items?.length || !parsed.at || Date.now() - parsed.at > 2 * 60 * 60 * 1000) return null;
    return parsed.items.filter((i) => i === 'MAIN' || i === 'EJS2');
  } catch {
    return null;
  }
};

export const hasPendingCheckout = (): boolean => {
  try {
    return Boolean(localStorage.getItem(PENDING_KEY));
  } catch {
    return false;
  }
};

/** Where to send someone right after they sign in. */
export const postAuthPath = (defaultPath: string): string =>
  hasPendingCheckout() ? '/premium' : defaultPath;

export type CheckoutResult = 'redirected' | 'needs_auth' | 'already_owned';

/**
 * Opens Stripe Checkout for the chosen items. When the visitor isn't signed in,
 * the choice is remembered and they're sent to sign in first.
 */
export const startOfferCheckout = async (
  items: OfferItem[],
  language: string,
): Promise<CheckoutResult> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    savePendingCheckout(items);
    return 'needs_auth';
  }

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { items, currency: currencyForLanguage(language) },
  });
  if (error) throw error;
  if (data?.alreadyOwned) return 'already_owned';
  if (data?.url) {
    window.location.href = data.url;
    return 'redirected';
  }
  throw new Error('No checkout URL');
};
