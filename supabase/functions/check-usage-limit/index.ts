import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_LIMIT_PER_GAME = 3;

// Game access rules by tier and difficulty
// FREE: Difficulty 1 = unlimited, Difficulty 2-3 = 3 uses each, Difficulty 4-5 = blocked
// STANDARD: Difficulty 1-4 = unlimited, Difficulty 5 = blocked
// INFLUENCER: All difficulties = unlimited

const GAME_DIFFICULTIES: Record<number, number> = {
  1: 3,  // MIND_READER
  2: 3,  // MENTAL_CONVERSATION
  3: 2,  // MYSTERY_WORD
  4: 2,  // MY_EMOJIS
  5: 4,  // PAPO_RETO
  6: 3,  // MIX_DE_CARTAS
  7: 4,  // RASPA_CARTA
  8: 5,  // EU_JA_SABIA
  9: 4,  // CARTA_MENTAL
  10: 2, // SUAS_PALAVRAS
  11: 1, // PONTA_DA_CARTA
  12: 5, // EU_JA_SABIA_2
  13: 1, // CARTA_PENSADA
  14: 1, // OI_SUMIDA
  15: 2, // JOGO_VELHA_BRUXA
  16: 5, // GOOGLE_MIME
};

const FREE_LIMITED_DIFFICULTIES = [2, 3];
const BLOCKED_DIFFICULTIES_FREE = [4, 5];
const BLOCKED_DIFFICULTIES_STANDARD = [5];
const UNLIMITED_DIFFICULTIES_FREE = [1];
const UNLIMITED_DIFFICULTIES_STANDARD = [1, 2, 3, 4];

type SubscriptionTier = 'FREE' | 'STANDARD' | 'INFLUENCER';

interface GameAccessInfo {
  canAccess: boolean;
  isUnlimited: boolean;
  usageLimit: number | null;
  reason: 'UNLIMITED' | 'LIMITED' | 'BLOCKED' | 'LIMIT_REACHED';
}

function checkGameAccessByDifficulty(
  tier: SubscriptionTier,
  difficulty: number,
  gameUsageCount: number
): GameAccessInfo {
  // INFLUENCER has unlimited access to everything
  if (tier === 'INFLUENCER') {
    return { canAccess: true, isUnlimited: true, usageLimit: null, reason: 'UNLIMITED' };
  }

  // STANDARD tier
  if (tier === 'STANDARD') {
    if (BLOCKED_DIFFICULTIES_STANDARD.includes(difficulty)) {
      return { canAccess: false, isUnlimited: false, usageLimit: 0, reason: 'BLOCKED' };
    }
    return { canAccess: true, isUnlimited: true, usageLimit: null, reason: 'UNLIMITED' };
  }

  // FREE tier
  if (BLOCKED_DIFFICULTIES_FREE.includes(difficulty)) {
    return { canAccess: false, isUnlimited: false, usageLimit: 0, reason: 'BLOCKED' };
  }

  if (UNLIMITED_DIFFICULTIES_FREE.includes(difficulty)) {
    return { canAccess: true, isUnlimited: true, usageLimit: null, reason: 'UNLIMITED' };
  }

  // Limited difficulties (2, 3) for FREE tier
  if (FREE_LIMITED_DIFFICULTIES.includes(difficulty)) {
    const canUse = gameUsageCount < FREE_LIMIT_PER_GAME;
    return {
      canAccess: canUse,
      isUnlimited: false,
      usageLimit: FREE_LIMIT_PER_GAME,
      reason: canUse ? 'LIMITED' : 'LIMIT_REACHED',
    };
  }

  // Default: unlimited
  return { canAccess: true, isUnlimited: true, usageLimit: null, reason: 'UNLIMITED' };
}

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
          gameDifficulties: GAME_DIFFICULTIES,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const tier = (premiumUser.subscription_tier ?? "FREE") as SubscriptionTier;
    const isPremium = premiumUser.is_premium || tier === "STANDARD" || tier === "INFLUENCER";

    // Get per-game usage
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

    // Build game access info for each game
    const gameAccessInfo: Record<number, GameAccessInfo> = {};
    for (const [gameIdStr, difficulty] of Object.entries(GAME_DIFFICULTIES)) {
      const gameId = parseInt(gameIdStr);
      const usageCount = gameUsage[gameId] || 0;
      gameAccessInfo[gameId] = checkGameAccessByDifficulty(tier, difficulty, usageCount);
    }

    // Check if user can use any game
    const canUseAnyGame = Object.values(gameAccessInfo).some(info => info.canAccess);

    return new Response(
      JSON.stringify({
        canUse: canUseAnyGame,
        isPremium,
        usageCount: totalCount,
        freeLimit: FREE_LIMIT_PER_GAME,
        subscriptionTier: tier,
        subscriptionStatus: premiumUser.subscription_status ?? "inactive",
        planConfirmed: premiumUser.plan_confirmed ?? false,
        couponGenerated: premiumUser.coupon_generated ?? false,
        reason: canUseAnyGame ? (isPremium ? "PREMIUM" : "FREE_TIER") : "PAYWALL",
        gameUsage,
        gameDifficulties: GAME_DIFFICULTIES,
        gameAccessInfo,
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
