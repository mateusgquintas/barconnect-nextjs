import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './supabase-mock';

// Validar que as variáveis existem, mas não quebrar desenvolvimento local.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se as variáveis não estão definidas, usar mock em desenvolvimento
const shouldUseMock = !supabaseUrl || !supabaseAnonKey;

if (shouldUseMock && process.env.NODE_ENV === 'development') {
  console.log('🧪 Usando Supabase Mock - Configure as variáveis de ambiente para conectar ao Supabase real');
}

// Em produção, alertar se estiver usando valores mockados.
if (process.env.NODE_ENV === 'production' && shouldUseMock) {
  console.error('❌ Supabase env vars ausentes em produção!');
}

export const supabase = shouldUseMock 
  ? createMockSupabaseClient() as any
  : createClient(supabaseUrl!, supabaseAnonKey!);