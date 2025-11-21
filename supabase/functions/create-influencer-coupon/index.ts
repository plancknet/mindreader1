import { serve } from \"https://deno.land/std@0.190.0/http/server.ts\";
import { createClient } from \"https://esm.sh/@supabase/supabase-js@2.57.2\";
import Stripe from \"https://esm.sh/stripe@18.5.0\";
import { z } from \"https://deno.land/x/zod@v3.22.4/mod.ts\";

const corsHeaders = {
  \"Access-Control-Allow-Origin\": \"*\",
  \"Access-Control-Allow-Headers\": \"authorization, x-client-info, apikey, content-type\",
};

const CodeSchema = z.object({
  code: z.string()
    .min(3, \"O código deve ter pelo menos 3 caracteres\")
    .max(12, \"O código deve ter no máximo 12 caracteres\")
    .regex(/^[A-Z0-9]+$/, \"Use apenas letras maiúsculas e números\"),
});

serve(async (req) => {
  if (req.method === \"OPTIONS\") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get(\"SUPABASE_URL\") ?? \"\",
    Deno.env.get(\"SUPABASE_SERVICE_ROLE_KEY\") ?? \"\"
  );

  try {
    const authHeader = req.headers.get(\"Authorization\");
    if (!authHeader) {
      throw new Error(\"Usuário não autenticado\");
    }

    const token = authHeader.replace(\"Bearer \", \"");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error(\"Usuário não autenticado\");
    }

    const body = await req.json();
    const { code } = CodeSchema.parse(body);

    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('subscription_tier, subscription_status, coupon_generated, coupon_code')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error(\"Perfil de usuário não encontrado\");
    }

    if (profile.subscription_tier !== 'INFLUENCER') {
      throw new Error(\"Somente influenciadores ativos podem criar cupons\");
    }

    if (profile.subscription_status !== 'active') {
      throw new Error(\"Sua assinatura Influencer está inativa\");
    }

    if (profile.coupon_generated) {
      throw new Error(\"Cupom já foi criado para este influenciador\");
    }

    const { data: duplicate } = await supabaseClient
      .from('users')
      .select('user_id')
      .eq('coupon_code', code)
      .maybeSingle();

    if (duplicate) {
      throw new Error(\"Este código já está em uso por outro influenciador\");
    }

    const stripe = new Stripe(Deno.env.get(\"STRIPE_SECRET_KEY\") || \"\", {
      apiVersion: \"2025-08-27.basil\",
    });

    // Reuse the master "Cupom iMindReader" coupon for every influencer
    const baseCouponId = "NJtcfBmv";

    const promotionCode = await stripe.promotionCodes.create({
      coupon: baseCouponId,
      code,
      active: true,
    });

    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        coupon_code: code,
        coupon_generated: true,
        stripe_coupon_id: baseCouponId,
        stripe_promotion_code_id: promotionCode.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

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
        headers: { ...corsHeaders, \"Content-Type\": \"application/json\" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating influencer coupon:', error);
    return new Response(
      JSON.stringify({
        error: error.message ?? 'Falha ao criar cupom. Tente novamente.',
      }),
      {
        headers: { ...corsHeaders, \"Content-Type\": \"application/json\" },
        status: 400,
      }
    );
  }
});
