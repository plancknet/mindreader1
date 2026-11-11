import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { grantsForItems, parseItems, type OfferItem } from "../_shared/offer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const PaymentSchema = z.object({
  sessionId: z.string().min(1).max(255).regex(/^cs_[a-zA-Z0-9_]+$/, "Invalid Stripe session ID format"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user) return json({ error: "not_authenticated" }, 401);

    const parsed = PaymentSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { sessionId } = parsed.data;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId && session.metadata.userId !== user.id) {
      return json({ success: false, message: "Session does not belong to this user" }, 403);
    }

    if (session.payment_status !== "paid") {
      return json({ success: false, message: "payment_not_confirmed" });
    }

    let items: OfferItem[] = parseItems(session.metadata?.items);
    // Older sessions (before the lifetime offer) only had planType
    if (items.length === 0) items = ["MAIN"];

    const updates: Record<string, unknown> = {
      ...grantsForItems(items),
      stripe_customer_id: session.customer,
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    };

    // Never downgrade a legacy influencer subscriber
    const { data: existing } = await supabase
      .from("users")
      .select("subscription_tier, has_eu_ja_sabia_2")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing?.subscription_tier === "INFLUENCER") {
      delete updates.subscription_tier;
      delete updates.premium_type;
    }

    const { error: updateError } = await supabase
      .from("users")
      .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" });
    if (updateError) throw updateError;

    const hasEjs2 = items.includes("EJS2") || Boolean(existing?.has_eu_ja_sabia_2) ||
      existing?.subscription_tier === "INFLUENCER";

    return json({ success: true, isPremium: true, items, hasEuJaSabia2: hasEjs2 });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return json({ error: "Payment verification failed. Please try again." }, 500);
  }
});
