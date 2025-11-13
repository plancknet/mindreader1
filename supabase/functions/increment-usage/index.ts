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

    // Get game_id from request body
    const { game_id } = await req.json();
    if (!game_id || ![1, 2, 3, 4].includes(game_id)) {
      throw new Error("game_id inválido. Deve ser 1, 2, 3 ou 4");
    }

    console.log(`Incrementing usage for user ${user.id}, game ${game_id}`);

    // Get current premium status
    const { data: premiumUser, error: fetchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // Determine which counter to increment
    const gameCountField = `jogo${game_id}_count`;

    // If no record exists, create one with the appropriate game counter = 1
    if (!premiumUser) {
      const { data: newUser, error: createError } = await supabaseClient
        .from("users")
        .insert({
          user_id: user.id,
          is_premium: false,
          usage_count: 1,
          [`jogo${game_id}_count`]: 1,
          last_accessed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({
          success: true,
          usageCount: 1,
          gameCount: 1,
          totalCount: 1,
          isPremium: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Increment the appropriate game counter and overall usage_count
    const newGameCount = (premiumUser[gameCountField] || 0) + 1;
    const newTotalCount = premiumUser.jogo1_count + premiumUser.jogo2_count + 
                          premiumUser.jogo3_count + premiumUser.jogo4_count + 1;

    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        [gameCountField]: newGameCount,
        usage_count: premiumUser.usage_count + 1,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        usageCount: premiumUser.usage_count + 1,
        gameCount: newGameCount,
        totalCount: newTotalCount,
        isPremium: premiumUser.is_premium,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error incrementing usage:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
