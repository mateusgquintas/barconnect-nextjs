import { createClient } from '@supabase/supabase-js';

// Validar que as variáveis existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

// Criar cliente Supabase (usado em todo o app)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);