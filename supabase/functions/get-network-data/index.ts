import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // For public access, we don't need authentication
    // But we still verify if there's a valid session for admin features
    const { data: { user } } = await supabase.auth.getUser()
    console.log('User accessing network data:', user?.email || 'anonymous')

    // Fetch all data
    const [peopleResult, startupsResult, relationshipsResult] = await Promise.all([
      supabase.from('people').select('*').order('name'),
      supabase.from('startups').select('*').order('name'),
      supabase.from('relationships').select('*')
    ])

    if (peopleResult.error || startupsResult.error || relationshipsResult.error) {
      console.error('Database errors:', {
        people: peopleResult.error,
        startups: startupsResult.error,
        relationships: relationshipsResult.error
      })
      return new Response(
        JSON.stringify({ error: 'Failed to fetch network data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform data to match frontend format
    const networkData = {
      people: peopleResult.data.map(person => ({
        id: person.id,
        name: person.name,
        role: person.role,
        sisterOrgs: person.sister_orgs,
        interests: person.interests,
        linkedinWebsite: person.linkedin_website,
        notes: person.notes,
        isFounder: person.is_founder
      })),
      startups: startupsResult.data.map(startup => ({
        id: startup.id,
        name: startup.name,
        url: startup.url,
        domain: startup.domain,
        status: startup.status,
        notes: startup.notes
      })),
      relationships: relationshipsResult.data.map(rel => ({
        personId: rel.person_id,
        startupId: rel.startup_id,
        role: rel.role
      }))
    }

    return new Response(
      JSON.stringify({ networkData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})