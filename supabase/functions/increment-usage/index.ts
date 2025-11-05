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

    console.log("Incrementing usage for user:", user.id);

    // Get current premium status
    const { data: premiumUser, error: fetchError } = await supabaseClient
      .from("premium_users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If no record exists, create one with usage_count = 1
    if (!premiumUser) {
      const { data: newUser, error: createError } = await supabaseClient
        .from("premium_users")
        .insert({
          user_id: user.id,
          is_premium: false,
          usage_count: 1,
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({
          success: true,
          usageCount: 1,
          isPremium: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Don't increment if user is premium (optional - for analytics you might still want to count)
    // For now, we'll increment even for premium users for analytics purposes
    const newCount = premiumUser.usage_count + 1;

    const { error: updateError } = await supabaseClient
      .from("premium_users")
      .update({
        usage_count: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        usageCount: newCount,
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
