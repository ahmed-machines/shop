import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// True only when the .env file contains real values.
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'),
)

// If Supabase is not configured we export null; the services below check for this
// and fall back to demo data, and the UI shows a clear "setup needed" message.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export const SETUP_MESSAGE =
  'Supabase is not configured yet. Copy .env.example to .env and add your project URL and anon key (see README).'

