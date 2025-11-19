import { createClient } from '@supabase/supabase-js'

// Default Supabase credentials (can be overridden with environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shulwuxlmolimcizosou.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodWx3dXhsbW9saW1jaXpvc291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA1NzMsImV4cCI6MjA3OTEzNjU3M30.WuHat1cQySBwEmZz8J4PcQHaI1C8kffJrFYXzKhuVVA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
