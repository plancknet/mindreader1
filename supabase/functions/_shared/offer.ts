// Single source of truth for the MindReader lifetime offer (Stripe price IDs).
export type OfferItem = "MAIN" | "EJS2";
export type OfferCurrency = "brl" | "usd";

export const OFFER_PRICES: Record<OfferItem, Record<OfferCurrency, string>> = {
  MAIN: {
    brl: "price_1UahZSLLVxhpxlCuRa92b03Q", // R$ 19,90
    usd: "price_1UahZkLLVxhpxlCuIKHzpKcj", // $9.99
  },
  EJS2: {
    brl: "price_1Uaha0LLVxhpxlCuV7mTGDCe", // R$ 8,90
    usd: "price_1UahaBLLVxhpxlCu76YfUjsL", // $3.99
  },
};

export function parseItems(raw: string | null | undefined): OfferItem[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is OfferItem => s === "MAIN" || s === "EJS2");
}

/** Build the users-table updates that a paid checkout grants. */
export function grantsForItems(items: OfferItem[]): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (items.includes("MAIN")) {
    updates.is_premium = true;
    updates.subscription_tier = "STANDARD";
    updates.premium_type = "standard";
    updates.plan_confirmed = true;
    updates.subscription_status = "active";
    updates.purchase_date = new Date().toISOString();
  }
  if (items.includes("EJS2")) {
    updates.has_eu_ja_sabia_2 = true;
  }
  return updates;
}
