
import { createClient } from '@supabase/supabase-js';

// Supabase projesi için URL ve anonim anahtar bilgileri
const SUPABASE_URL = "https://vzaflfrbuugucbuevfxc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YWZsZnJidXVndWNidWV2ZnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzE1MzIsImV4cCI6MjA1OTQ0NzUzMn0.rro6QS8GjrRSdDkgO4ZzDg_dpLDaIVswLQH8f1fRs_8";

// Supabase yapılandırmasının doğru olup olmadığını kontrol eden fonksiyon
export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Supabase client'ı oluştur
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
