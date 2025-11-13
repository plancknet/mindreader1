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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const PaymentSchema = z.object({
      sessionId: z.string()
        .min(1, 'Session ID is required')
        .regex(/^cs_[a-zA-Z0-9_]+$/, 'Invalid Stripe session ID format')
        .max(255, 'Session ID too long')
    });

    const body = await req.json();
    const { sessionId } = PaymentSchema.parse(body);

    console.log("Verifying payment for session:", sessionId);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      console.log("Payment confirmed for user:", user.id);

      // Atualizar ou criar registro premium
      const { error: upsertError } = await supabaseClient
        .from("users")
        .upsert({
          user_id: user.id,
          is_premium: true,
          premium_type: "one_time",
          purchase_date: new Date().toISOString(),
          stripe_customer_id: session.customer,
          stripe_session_id: sessionId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (upsertError) {
        console.error("Error updating premium status:", upsertError);
        throw upsertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isPremium: true,
          message: "Pagamento confirmado! Você agora é Premium 🎉"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          isPremium: false,
          message: "Pagamento ainda não confirmado"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
