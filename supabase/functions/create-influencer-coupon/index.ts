import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CodeSchema = z.object({
  code: z.string()
    .min(3, "O código deve ter pelo menos 3 caracteres")
    .max(12, "O código deve ter no máximo 12 caracteres")
    .regex(/^[A-Z0-9]+$/, "Use apenas letras maiúsculas e números"),
});

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

    const body = await req.json();
    const { code } = CodeSchema.parse(body);

    console.log("Criando cupom para usuário:", user.id, "código:", code);

    // Check if user already has a coupon
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("coupon_generated")
      .eq("user_id", user.id)
      .single();

    // If user doesn't exist in the users table yet, that's okay - they're new
    if (userData?.coupon_generated) {
      throw new Error("Você já possui um cupom ativo");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const promoCode = await stripe.promotionCodes.create({
      coupon: "NJtcfBmv",
      code: code,
      active: true,
      metadata: {
        user_id: user.id,
        user_email: user.email || "",
      },
    });

    console.log("Cupom criado na Stripe:", promoCode.id);

    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        coupon_code: code,
        coupon_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar usuário:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        code: code,
        stripe_promotion_code_id: promoCode.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro ao criar cupom:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erro ao criar cupom",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
