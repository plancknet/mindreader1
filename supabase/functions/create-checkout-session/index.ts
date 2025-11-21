import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const RequestSchema = z.object({
    planType: z.enum(["STANDARD", "INFLUENCER"]),
  });

  try {
    let body = {};
    try {
      const text = await req.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      throw new Error("Invalid JSON in request body");
    }
    
    const { planType } = RequestSchema.parse(body);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("Usuário não autenticado");
    }

    console.log("Creating checkout session for user:", user.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check database first for Stripe customer ID
    const { data: premiumUser } = await supabaseClient
      .from('users')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = premiumUser?.stripe_customer_id;

    // If not in database, check Stripe by email
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("Existing Stripe customer found:", customerId);
        
        // Store customer ID in database for future use
        await supabaseClient
          .from('users')
          .upsert({ 
            user_id: user.id, 
            stripe_customer_id: customerId 
          });
      }
    } else {
      console.log("Stripe customer ID from database:", customerId);
    }

    const standardPriceId = "price_1SUot7LLVxhpxlCu2FsPNWGA";
    const influencerPriceId = "price_1SVfB2LLVxhpxlCueOnadLnl";
    const influencerProductId = "prod_TSaLROGvGVAYDz";

    const lineItems =
      planType === "INFLUENCER"
        ? [{ price: influencerPriceId, quantity: 1 }]
        : [{ price: standardPriceId, quantity: 1 }];

    const mode = planType === "INFLUENCER" ? "subscription" : "payment";
    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode,
      success_url: `${origin}/premium/success?plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?plan=${planType}`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        app: "mindreader",
        type: planType === "INFLUENCER" ? "subscription" : "one_time",
        planType,
        productId: planType === "INFLUENCER" ? influencerProductId : undefined,
      }
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
