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

    const { game_id } = await req.json();
    const MIN_GAME_ID = 1;
    const MAX_GAME_ID = 12;
    if (!game_id || typeof game_id !== "number" || game_id < MIN_GAME_ID || game_id > MAX_GAME_ID) {
      throw new Error("game_id inválido. Deve ser um número entre 1 e 12");
    }

    console.log(`Incrementing usage for user ${user.id}, game ${game_id}`);

    // Get current premium status
    let { data: premiumUser, error: fetchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

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
      premiumUser = newUser;
    }

    const nowIso = new Date().toISOString();
    const nextUsageCount = (premiumUser?.usage_count ?? 0) + 1;

    const { data: currentGameUsage, error: gameUsageError } = await supabaseClient
      .from("user_game_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .eq("game_id", game_id)
      .maybeSingle();

    if (gameUsageError && gameUsageError.code !== "PGRST116") {
      throw gameUsageError;
    }

    const newGameCount = (currentGameUsage?.usage_count ?? 0) + 1;

    const { error: usageUpsertError } = await supabaseClient
      .from("user_game_usage")
      .upsert(
        {
          user_id: user.id,
          game_id,
          usage_count: newGameCount,
          last_used_at: nowIso,
        },
        { onConflict: "user_id,game_id" },
      );

    if (usageUpsertError) throw usageUpsertError;

    const { error: userUpdateError } = await supabaseClient
      .from("users")
      .update({
        usage_count: nextUsageCount,
        updated_at: nowIso,
      })
      .eq("user_id", user.id);

    if (userUpdateError) throw userUpdateError;

    return new Response(
      JSON.stringify({
        success: true,
        usageCount: nextUsageCount,
        gameCount: newGameCount,
        totalCount: nextUsageCount,
        isPremium: premiumUser?.is_premium ?? false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error incrementing usage:", error);
    return new Response(JSON.stringify({ error: "Failed to update usage. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
