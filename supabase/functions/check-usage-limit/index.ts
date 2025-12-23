import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_LIMIT_PER_GAME = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !data.user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const user = data.user;

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
          subscription_status: "inactive",
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
          freeLimit: FREE_LIMIT_PER_GAME,
          subscriptionTier: "FREE",
          subscriptionStatus: "inactive",
          planConfirmed: false,
          couponGenerated: false,
          reason: "NEW_USER",
          gameUsage: {},
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
          freeLimit: FREE_LIMIT_PER_GAME,
          subscriptionTier: premiumUser.subscription_tier ?? "STANDARD",
          subscriptionStatus: premiumUser.subscription_status ?? "active",
          planConfirmed: premiumUser.plan_confirmed ?? true,
          couponGenerated: premiumUser.coupon_generated ?? false,
          reason: "PREMIUM",
          gameUsage: {},
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get per-game usage for free users
    const { data: usageRows, error: usageError } = await supabaseClient
      .from("user_game_usage")
      .select("game_id, usage_count")
      .eq("user_id", user.id);

    if (usageError && usageError.code !== "PGRST116") {
      throw usageError;
    }

    // Build game usage map
    const gameUsage: Record<number, number> = {};
    if (usageRows && usageRows.length > 0) {
      for (const row of usageRows) {
        gameUsage[row.game_id] = row.usage_count || 0;
      }
    }

    // Calculate total usage for display purposes
    const totalCount = Object.values(gameUsage).reduce((sum, count) => sum + count, 0);

    // Check if user can use any game (at least one game under limit)
    const canUseAnyGame = Object.values(gameUsage).length === 0 || 
      Object.values(gameUsage).some(count => count < FREE_LIMIT_PER_GAME);

    return new Response(
      JSON.stringify({
        canUse: canUseAnyGame,
        isPremium: false,
        usageCount: totalCount,
        freeLimit: FREE_LIMIT_PER_GAME,
        subscriptionTier: premiumUser.subscription_tier ?? "FREE",
        subscriptionStatus: premiumUser.subscription_status ?? "inactive",
        planConfirmed: premiumUser.plan_confirmed ?? false,
        couponGenerated: premiumUser.coupon_generated ?? false,
        reason: canUseAnyGame ? "FREE_TIER" : "PAYWALL",
        gameUsage,
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
