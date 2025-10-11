import { createClient } from '@supabase/supabase-js';

// Validar que as variáveis existem, mas não quebrar testes unitários.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321/mock';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-mock-key';

// Em produção, alertar se estiver usando valores mockados.
if (process.env.NODE_ENV === 'production') {
  if (supabaseUrl.includes('mock') || supabaseAnonKey === 'anon-mock-key') {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars ausentes em produção!');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);