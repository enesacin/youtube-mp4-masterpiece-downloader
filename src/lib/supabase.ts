
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Validate and provide instructions if using default values
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Using default Supabase URL. Please set VITE_SUPABASE_URL environment variable.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using default Supabase anon key. Please set VITE_SUPABASE_ANON_KEY environment variable.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};
