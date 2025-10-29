// Serviço de autenticação com integração Supabase
import { User, UserRole } from '@/types/user';
import { supabase, isSupabaseMock } from './supabase';

// Base de usuários para fallback (caso Supabase não esteja disponível)
const FALLBACK_USERS_DB: Array<{ username: string; password: string; role: UserRole; name: string }> = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'operador',
    password: 'operador123',
    role: 'operator',
    name: 'Operador'
  }
];

export const validateCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    // Primeiro, tentar buscar do Supabase
    const { data, error } = await (supabase.from('users') as any)
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (!error && data) {
      return {
        id: data.id || `user_${Date.now()}`,
        name: data.name || data.username,
        username: data.username,
        password: data.password,
        role: data.role as UserRole
      };
    }
  } catch (dbError) {
    console.log('📝 Banco indisponível, usando credenciais locais');
  }

  // Fallback para credenciais locais
  const user = FALLBACK_USERS_DB.find(u => u.username === username && u.password === password);
  
  if (user) {
    return {
      id: `user_${Date.now()}`,
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role
    };
  }
  
  return null;
};

export const getDefaultUsers = () => FALLBACK_USERS_DB.map(({ password, ...user }) => user);

// Cria ou recupera um usuário de aplicação amarrado a um "username" (pode ser o e-mail)
export const getOrCreateUserByUsername = async (username: string): Promise<User> => {
  // Tenta buscar na tabela de usuários da aplicação
  const { data, error } = await (supabase.from('users') as any)
    .select('*')
    .eq('username', username)
    .single();

  if (!error && data) {
    return {
      id: data.id || `user_${Date.now()}`,
      name: data.name || username.split('@')[0] || username,
      username: data.username,
      password: data.password ?? '',
      role: (data.role as UserRole) || 'operator'
    };
  }

  // Se não existir, cria com role padrão "operator"
  const insertPayload = {
    username,
    password: '',
    name: username.split('@')[0] || username,
    role: 'operator'
  };

  const insertRes = await (supabase.from('users') as any)
    .insert(insertPayload)
    .select()
    .single();

  const row = insertRes?.data || insertPayload;
  return {
    id: row.id || `user_${Date.now()}`,
    name: row.name,
    username: row.username,
    password: row.password ?? '',
    role: (row.role as UserRole) || 'operator'
  };
};

// Login via Link Mágico (OTP por e-mail). Em ambiente mock, apenas cria/retorna usuário local.
export const loginWithEmail = async (email: string): Promise<{ sent: boolean; user?: User; message?: string }> => {
  if (!email || !email.includes('@')) {
    return { sent: false, message: 'E-mail inválido' };
  }

  if (isSupabaseMock) {
    // No mock, não há fluxo de e-mail; apenas garante usuário e "loga" diretamente
    const user = await getOrCreateUserByUsername(email);
    return { sent: true, user, message: 'Login local (mock) concluído' };
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    // Envia o link mágico para o e-mail
    const { error } = await (supabase as any).auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin
      }
    });
    if (error) {
      return { sent: false, message: error.message };
    }
    return { sent: true, message: 'Enviamos um link para seu e-mail' };
  } catch (err: any) {
    return { sent: false, message: err?.message || 'Falha ao solicitar link mágico' };
  }
};

export const signOut = async () => {
  try {
    if (!isSupabaseMock && (supabase as any).auth?.signOut) {
      await (supabase as any).auth.signOut();
    }
  } catch {
    // noop
  }
};