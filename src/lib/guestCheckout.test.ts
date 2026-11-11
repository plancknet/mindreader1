import { describe, expect, it, vi } from 'vitest';

const invoke = vi.fn().mockResolvedValue({ data: { url: 'https://checkout.example/x' }, error: null });
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke }, auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } },
}));

describe('guest checkout', () => {
  it('a visitor without an account goes straight to payment, not to sign-in', async () => {
    const { startOfferCheckout } = await import('./checkout');
    (globalThis as unknown as { window: unknown }).window = { location: { href: '' } };
    const result = await startOfferCheckout(['MAIN'], 'pt-BR');
    expect(result).toBe('redirected');
    expect(invoke).toHaveBeenCalledWith('create-checkout-session', { body: { items: ['MAIN'], currency: 'brl' } });
  });
});
