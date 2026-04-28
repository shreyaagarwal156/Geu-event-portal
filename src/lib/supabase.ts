import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function determineRole(email: string): 'student' | 'club_admin' | 'main_admin' {
  if (email === 'admin@geu.ac.in') return 'main_admin';
  const prefix = email.split('@')[0];
  if (/^\d+$/.test(prefix)) return 'student';
  return 'club_admin';
}