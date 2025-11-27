import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './supabase-mock';
import { env } from './env';

// Validar que as variáveis existem, mas não quebrar desenvolvimento local.
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag opcional para forçar mock em desenvolvimento
const forceMock = (env.NEXT_PUBLIC_USE_SUPABASE_MOCK || '').toLowerCase() === 'true';
const hasEnv = Boolean(supabaseUrl && supabaseAnonKey);
// Usar mock se forçado ou se envs estiverem ausentes
const shouldUseMock = forceMock || !hasEnv;

if (shouldUseMock && env.NODE_ENV === 'development') {
  console.log('🧪 Usando Supabase Mock - Configure as variáveis de ambiente para conectar ao Supabase real');
}

// Em produção, alertar se estiver usando valores mockados.
if (env.NODE_ENV === 'production' && shouldUseMock) {
  console.error('❌ Supabase env vars ausentes em produção!');
}

// Log detalhado para diagnóstico
console.log('📊 Supabase Status:', {
  isUsingMock: shouldUseMock,
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  forceMock: forceMock,
  env: env.NODE_ENV
});

export const supabase = shouldUseMock 
  ? (createMockSupabaseClient() as any)
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false, // Desabilita persistência de sessão para evitar erros OAuth
        autoRefreshToken: false,
        detectSessionInUrl: false, // Evita tentar detectar sessão OAuth na URL
      },
    });

export const isSupabaseMock = shouldUseMock;