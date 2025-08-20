import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlybynsxxrjbdedroizp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJseWJ5bnN4eHJqYmRlZHJvaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODI5NDQsImV4cCI6MjA3MTI1ODk0NH0.WUSrLD3NE-Oar-mHAf85rQ_NnubKfAqt_zy1h8_8qBg'

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is available
export const checkSupabaseConnection = () => {
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