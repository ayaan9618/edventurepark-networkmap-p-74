import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NetworkData {
  people: Array<{
    id: string;
    name: string;
    role?: string;
    sisterOrgs?: string;
    interests?: string;
    linkedinWebsite?: string;
    notes?: string;
    isFounder?: boolean;
  }>;
  startups: Array<{
    id: string;
    name: string;
    url?: string;
    domain?: string;
    status?: string;
    notes?: string;
  }>;
  relationships: Array<{
    personId: string;
    startupId: string;
    role: string;
  }>;
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { networkData, filename }: { networkData: NetworkData; filename: string } = await req.json()

    // Start transaction by clearing existing data
    const { error: deleteRelError } = await supabase
      .from('relationships')
      .delete()
      .neq('id', 0) // Delete all records

    const { error: deletePeopleError } = await supabase
      .from('people')
      .delete()
      .neq('id', '') // Delete all records

    const { error: deleteStartupsError } = await supabase
      .from('startups')
      .delete()
      .neq('id', '') // Delete all records

    if (deleteRelError || deletePeopleError || deleteStartupsError) {
      console.error('Delete errors:', { deleteRelError, deletePeopleError, deleteStartupsError })
      return new Response(
        JSON.stringify({ error: 'Failed to clear existing data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert people
    const peopleData = networkData.people.map(person => ({
      id: person.id,
      name: person.name,
      role: person.role || null,
      sister_orgs: person.sisterOrgs || null,
      interests: person.interests || null,
      linkedin_website: person.linkedinWebsite || null,
      notes: person.notes || null,
      is_founder: person.isFounder || false
    }))

    const { error: peopleError } = await supabase
      .from('people')
      .insert(peopleData)

    if (peopleError) {
      console.error('People insert error:', peopleError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert people data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert startups
    const startupsData = networkData.startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      url: startup.url || null,
      domain: startup.domain || null,
      status: startup.status || null,
      notes: startup.notes || null
    }))

    const { error: startupsError } = await supabase
      .from('startups')
      .insert(startupsData)

    if (startupsError) {
      console.error('Startups insert error:', startupsError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert startups data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert relationships
    const relationshipsData = networkData.relationships.map(rel => ({
      person_id: rel.personId,
      startup_id: rel.startupId,
      role: rel.role
    }))

    const { error: relationshipsError } = await supabase
      .from('relationships')
      .insert(relationshipsData)

    if (relationshipsError) {
      console.error('Relationships insert error:', relationshipsError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert relationships data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Record the upload
    const { error: uploadRecordError } = await supabase
      .from('data_uploads')
      .insert({
        filename,
        total_people: networkData.people.length,
        total_startups: networkData.startups.length,
        total_relationships: networkData.relationships.length,
        uploaded_by: user.id
      })

    if (uploadRecordError) {
      console.error('Upload record error:', uploadRecordError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        counts: {
          people: networkData.people.length,
          startups: networkData.startups.length,
          relationships: networkData.relationships.length
        }
      }),
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