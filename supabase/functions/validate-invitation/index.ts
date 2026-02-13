import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string' || token.length < 10 || token.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        accepted_at,
        organizations:organization_id (
          name,
          logo_url
        )
      `)
      .eq('token', token)
      .maybeSingle()

    if (error) {
      console.error('Error querying invitation:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to validate invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (data.accepted_at) {
      return new Response(
        JSON.stringify({ error: 'This invitation has already been used' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(data.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invitation has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return invitation details WITHOUT the token
    return new Response(
      JSON.stringify({
        id: data.id,
        email: data.email,
        role: data.role,
        expires_at: data.expires_at,
        organization: data.organizations,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
