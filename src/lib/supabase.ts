import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
  console.error('❌ VITE_SUPABASE_URL is not configured. Please add it to your .env file.')
}

if (!supabaseKey || supabaseKey === 'your-anon-public-key-here') {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured. Please add it to your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseKey && 
         supabaseUrl !== 'https://your-project-ref.supabase.co' &&
         supabaseKey !== 'your-anon-public-key-here'
}
