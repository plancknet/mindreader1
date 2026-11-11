// Guest checkout: buyers pay first; the account is created from the email given at checkout.
import { grantsForItems, parseItems, type OfferItem } from "./offer.ts";

// deno-lint-ignore no-explicit-any
type Admin = any;

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://mindreader.site";

async function findUserIdByEmail(supabase: Admin, email: string): Promise<string | null> {
  const { data } = await supabase.from("users").select("user_id").ilike("email", email).limit(1).maybeSingle();
  if (data?.user_id) return data.user_id;
  for (let page = 1; page <= 20; page++) {
    const { data: list } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    const users = list?.users ?? [];
    const hit = users.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (users.length < 1000) break;
  }
  return null;
}

/** Finds the buyer's account by email, creating a confirmed one if needed. */
export async function ensureBuyerAccount(
  supabase: Admin,
  email: string,
): Promise<{ userId: string; created: boolean }> {
  const existing = await findUserIdByEmail(supabase, email);
  if (existing) return { userId: existing, created: false };
  const password = crypto.randomUUID() + crypto.randomUUID();
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data?.user) {
    const again = await findUserIdByEmail(supabase, email);
    if (again) return { userId: again, created: false };
    throw error ?? new Error("could_not_create_user");
  }
  return { userId: data.user.id, created: true };
}

/** Grants what a paid checkout bought, never downgrading legacy influencers. */
export async function grantPurchase(
  supabase: Admin,
  userId: string,
  session: { id: string; customer: unknown; metadata?: Record<string, string> | null },
): Promise<OfferItem[]> {
  let items = parseItems(session.metadata?.items);
  if (items.length === 0) items = ["MAIN"];
  const updates: Record<string, unknown> = {
    ...grantsForItems(items),
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    stripe_session_id: session.id,
    updated_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase
    .from("users").select("subscription_tier").eq("user_id", userId).maybeSingle();
  if (existing?.subscription_tier === "INFLUENCER") {
    delete updates.subscription_tier;
    delete updates.premium_type;
  }
  const { error } = await supabase.from("users").upsert({ user_id: userId, ...updates }, { onConflict: "user_id" });
  if (error) throw error;
  return items;
}

/** Emails the buyer a link to choose their password (sent once per checkout). */
export async function sendSetPasswordEmail(
  // deno-lint-ignore no-explicit-any
  stripe: any,
  supabase: Admin,
  sessionId: string,
  email: string,
): Promise<void> {
  const fresh = await stripe.checkout.sessions.retrieve(sessionId);
  if (fresh.metadata?.password_email_sent === "1") return;
  await stripe.checkout.sessions.update(sessionId, {
    metadata: { ...(fresh.metadata ?? {}), password_email_sent: "1" },
  });
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/definir-senha`,
  });
  if (error) console.error("[guest] set-password email failed", error);
}

export function buyerEmail(session: {
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
}): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}
