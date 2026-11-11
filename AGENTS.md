# Project rules

- Purchase rules live in one place per side: `supabase/functions/_shared/offer.ts` (Stripe price IDs + what each purchase grants) and `src/lib/checkout.ts` / `src/lib/gameAccess.ts` (display prices, access checks). Why: prices and access must stay in sync between checkout, webhook and UI.
- Paid fields on `public.users` (tier, premium flags, add-on flags, Stripe IDs, coupon) can only be changed by server functions or admins; a database trigger resets them on user writes. Why: users can update their own row, so access must not be self-grantable.
- Sales-page copy for `/oferta`, `/premium` and the post-purchase upsell lives in `src/pages/oferta/copy.ts` (PT-BR + EN), not in the global translation files. Why: long marketing copy is edited as a unit.
- Tests run with `bun run test` (vitest); keep rule tests next to the module they cover.
