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
    .min(3, "O c\u00F3digo deve ter pelo menos 3 caracteres")
    .max(12, "O c\u00F3digo deve ter no m\u00E1ximo 12 caracteres")
    .regex(/^[A-Z0-9]+$/, "Use apenas letras mai\u00FAsculas e n\u00FAmeros"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("Usu\u00E1rio n\u00E3o autenticado");
    }

    const body = await req.json();
    const { code } = CodeSchema.parse(body);

    const { data: profile, error: profileError } = await supabaseClient
      .from("users")
      .select("subscription_tier, coupon_generated, coupon_code")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Perfil de usu\u00E1rio n\u00E3o encontrado");
    }

    if (profile.subscription_tier !== "INFLUENCER") {
      throw new Error("Somente influenciadores podem criar cupons");
    }

    if (profile.coupon_generated) {
      throw new Error("Cupom j\u00E1 foi criado para este influenciador");
    }

    const { data: duplicate } = await supabaseClient
      .from("users")
      .select("user_id")
      .eq("coupon_code", code)
      .maybeSingle();

    if (duplicate) {
      throw new Error("Este c\u00F3digo j\u00E1 est\u00E1 em uso por outro influenciador");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const coupon = await stripe.coupons.create({
      percent_off: 30,
      duration: "forever",
      name: `Influencer ${code}`,
    });

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      active: true,
    });

    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        coupon_code: code,
        coupon_generated: true,
        stripe_coupon_id: coupon.id,
        stripe_promotion_code_id: promotionCode.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        code,
        promotionCodeId: promotionCode.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error creating influencer coupon:", error);
    return new Response(
      JSON.stringify({
        error: error.message ?? "Falha ao criar cupom. Tente novamente.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
