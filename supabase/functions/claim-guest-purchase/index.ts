// Called from the thank-you page after a guest checkout: creates/links the account,
// grants the purchase and emails a link to choose the password.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buyerEmail, ensureBuyerAccount, grantPurchase, sendSetPasswordEmail } from "../_shared/guest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

const Schema = z.object({ sessionId: z.string().min(1).max(255).regex(/^cs_[a-zA-Z0-9_]+$/) });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid_session" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    if (session.metadata?.app !== "mindreader" || session.metadata?.guest !== "1") {
      return json({ error: "not_guest_session" }, 403);
    }
    if (session.payment_status !== "paid") return json({ success: false, message: "payment_not_confirmed" });

    const email = buyerEmail(session);
    if (!email) return json({ error: "no_email" }, 400);

    const { userId } = await ensureBuyerAccount(supabase, email);
    const items = await grantPurchase(supabase, userId, session);
    await sendSetPasswordEmail(stripe, supabase, session.id, email);

    return json({ success: true, email, items });
  } catch (error) {
    console.error("claim-guest-purchase error", error);
    return json({ error: "claim_failed" }, 500);
  }
});
