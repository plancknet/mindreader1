import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { OFFER_PRICES, type OfferItem } from "../_shared/offer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  items: z.array(z.enum(["MAIN", "EJS2"])).min(1).max(2),
  currency: z.enum(["brl", "usd"]).default("brl"),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
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
    let body: unknown = {};
    try {
      const text = await req.text();
      if (text && text.trim()) body = JSON.parse(text);
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { currency } = parsed.data;
    let items = Array.from(new Set(parsed.data.items)) as OfferItem[];

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: authData } = await supabase.auth.getUser(token);
    const user = authData.user;
    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "";
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Guest checkout: pay first, the account is created from the checkout email afterwards.
    if (!user?.email) {
      if (items.includes("EJS2") && !items.includes("MAIN")) items = ["MAIN", "EJS2"];
      const guestItems = items.join(",");
      const guestSession = await stripe.checkout.sessions.create({
        customer_creation: "always",
        line_items: items.map((item) => ({ price: OFFER_PRICES[item][currency], quantity: 1 })),
        mode: "payment",
        success_url: `${origin}/compra-confirmada?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/oferta#preco`,
        allow_promotion_codes: true,
        locale: currency === "brl" ? "pt-BR" : "en",
        metadata: { app: "mindreader", type: "one_time", guest: "1", items: guestItems, planType: "STANDARD" },
      });
      return json({ url: guestSession.url });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, subscription_tier, has_eu_ja_sabia_2")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasMain = profile?.subscription_tier === "STANDARD" || profile?.subscription_tier === "INFLUENCER";
    const hasEjs2 = Boolean(profile?.has_eu_ja_sabia_2) || profile?.subscription_tier === "INFLUENCER";

    // Don't charge for things already owned
    if (hasMain) items = items.filter((i) => i !== "MAIN");
    if (hasEjs2) items = items.filter((i) => i !== "EJS2");
    // The upsell can only be bought together with or after the main product
    if (!hasMain && items.includes("EJS2") && !items.includes("MAIN")) {
      items = ["MAIN", "EJS2"];
    }
    if (items.length === 0) {
      return json({ alreadyOwned: true });
    }

    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        await supabase.from("users").update({ stripe_customer_id: customerId }).eq("user_id", user.id);
      }
    }

    const itemsParam = items.join(",");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      customer_creation: customerId ? undefined : "always",
      line_items: items.map((item) => ({ price: OFFER_PRICES[item][currency], quantity: 1 })),
      mode: "payment",
      success_url: `${origin}/premium/success?items=${itemsParam}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        app: "mindreader",
        type: "one_time",
        items: itemsParam,
        planType: items.includes("MAIN") ? "STANDARD" : "ADDON",
      },
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return json({ error: "Failed to create checkout session. Please try again." }, 500);
  }
});
