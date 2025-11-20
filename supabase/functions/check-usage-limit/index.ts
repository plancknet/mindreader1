import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    console.log("Checking usage limit for user:", user.id);

    // Get or create premium user record
    const { data: premiumUser, error: fetchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If no record exists, create one
    if (!premiumUser) {
      const { data: newUser, error: createError } = await supabaseClient
        .from("users")
        .insert({
          user_id: user.id,
          is_premium: false,
          subscription_tier: "FREE",
          plan_confirmed: false,
          usage_count: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({
          canUse: true,
          isPremium: false,
          usageCount: 0,
          freeLimit: 3,
          subscriptionTier: "FREE",
          planConfirmed: false,
          couponGenerated: false,
          reason: "NEW_USER",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if user is premium
    if (premiumUser.is_premium || premiumUser.subscription_tier === "STANDARD" || premiumUser.subscription_tier === "INFLUENCER") {
      return new Response(
        JSON.stringify({
          canUse: true,
          isPremium: true,
          usageCount: premiumUser.usage_count,
          freeLimit: 3,
          subscriptionTier: premiumUser.subscription_tier ?? "STANDARD",
          planConfirmed: premiumUser.plan_confirmed ?? true,
          couponGenerated: premiumUser.coupon_generated ?? false,
          reason: "PREMIUM",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate total count from all games
    const totalCount = (premiumUser.jogo1_count || 0) + (premiumUser.jogo2_count || 0) + 
                       (premiumUser.jogo3_count || 0) + (premiumUser.jogo4_count || 0);

    // Check if user has reached free limit
    const canUse = totalCount < 3;

    return new Response(
      JSON.stringify({
        canUse,
        isPremium: false,
        usageCount: totalCount,
        freeLimit: 3,
        subscriptionTier: premiumUser.subscription_tier ?? "FREE",
        planConfirmed: premiumUser.plan_confirmed ?? false,
        couponGenerated: premiumUser.coupon_generated ?? false,
        reason: canUse ? "FREE_TIER" : "PAYWALL",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error checking usage limit:", error);
    return new Response(JSON.stringify({ error: "Failed to check usage limit. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
