import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client only if environment variables are available
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is available
export const checkSupabaseConnection = () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - falling back to local storage')
    return false
  }
  return true
}

export type Database = {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          name: string
          role: string | null
          sister_orgs: string | null
          interests: string | null
          linkedin_website: string | null
          notes: string | null
          is_founder: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: string | null
          sister_orgs?: string | null
          interests?: string | null
          linkedin_website?: string | null
          notes?: string | null
          is_founder?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          sister_orgs?: string | null
          interests?: string | null
          linkedin_website?: string | null
          notes?: string | null
          is_founder?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      startups: {
        Row: {
          id: string
          name: string
          url: string | null
          domain: string | null
          status: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          url?: string | null
          domain?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string | null
          domain?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: number
          person_id: string
          startup_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          person_id: string
          startup_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          person_id?: string
          startup_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      data_uploads: {
        Row: {
          id: number
          filename: string
          file_path: string | null
          upload_date: string
          total_people: number
          total_startups: number
          total_relationships: number
          uploaded_by: string | null
        }
        Insert: {
          filename: string
          file_path?: string | null
          upload_date?: string
          total_people?: number
          total_startups?: number
          total_relationships?: number
          uploaded_by?: string | null
        }
        Update: {
          id?: number
          filename?: string
          file_path?: string | null
          upload_date?: string
          total_people?: number
          total_startups?: number
          total_relationships?: number
          uploaded_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}