import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, whatsapp } = await req.json();

    console.log('Registering partner lead:', { email, whatsapp });

    // Validate inputs
    if (!email || !whatsapp) {
      return new Response(
        JSON.stringify({ error: 'Email e WhatsApp são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean WhatsApp - remove all non-digits
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    
    // Validate WhatsApp format (should have at least 10 digits - DDD + number)
    if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 13) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp inválido. Use formato: DDD + número (ex: 11999999999)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if email already exists in leads
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id, user_id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingLead) {
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado. Faça login para continuar.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with email and whatsapp as temporary password
    // Password is the clean whatsapp number (DDD + number, no spaces)
    const temporaryPassword = cleanWhatsapp;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        needs_password_change: true,
        whatsapp: cleanWhatsapp,
        is_partner_lead: true
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      
      // Check if user already exists
      if (authError.message?.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'Este email já está cadastrado. Faça login para continuar.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', authData.user?.id);

    // Insert lead record
    const { error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        email: email.toLowerCase().trim(),
        whatsapp: cleanWhatsapp,
        user_id: authData.user?.id,
        ind_interagiu: true,
        ind_logou: false,
        ind_jogou: false,
        ind_criou_cupom: false
      });

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      // Don't fail the request, user is created
    }

    console.log('Lead registered successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cadastro realizado com sucesso!',
        userId: authData.user?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-partner-lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
